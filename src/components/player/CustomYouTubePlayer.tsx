'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CustomYouTubePlayer({ videoId }: { videoId: string }) {
  const { setCurrentTime, registerSeek, setPlaying, next } = usePlayerStore();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiReadyRef = useRef(false);
  const isReadyRef = useRef(false);

  // Suppress onStateChange feedback while we're commanding the player
  const isCommandingRef = useRef(false);
  const commandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setCommanding = (val: boolean, delayMs = 600) => {
    isCommandingRef.current = val;
    if (commandTimer.current) clearTimeout(commandTimer.current);
    if (val) {
      commandTimer.current = setTimeout(() => {
        isCommandingRef.current = false;
      }, delayMs);
    }
  };

  // ── Load YouTube IFrame API once ─────────────────────────────────────────────
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      apiReadyRef.current = true;
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const first = document.getElementsByTagName('script')[0];
    if (first?.parentNode) first.parentNode.insertBefore(tag, first);
    else document.head.appendChild(tag);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
      prev?.();
    };
  }, []);

  // ── Re-create player when videoId changes ────────────────────────────────────
  useEffect(() => {
    const tryInit = () => {
      if (!containerRef.current || !videoId) return;

      // Destroy previous
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
      isReadyRef.current = false;

      const playerDiv = document.createElement('div');
      playerDiv.style.width = '100%';
      playerDiv.style.height = '100%';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv, {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : '*',
        },
        events: {
          onReady: (event: any) => {
            isReadyRef.current = true;
            event.target.setVolume(usePlayerStore.getState().volume * 100);

            // Always play on new song (setCurrentSong sets isPlaying:true)
            setCommanding(true);
            event.target.playVideo();
            setPlaying(true);

            // Register seek for ProgressBar / FullscreenOverlay
            registerSeek((time: number) => {
              if (!playerRef.current) return;
              setCommanding(true);
              playerRef.current.seekTo(time, true);
            });
          },
          onStateChange: (event: any) => {
            if (isCommandingRef.current) return; // Ignore while we command
            if (event.data === window.YT.PlayerState.ENDED) {
              next();
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setPlaying(false);
            }
          },
          onError: (event: any) => {
            console.error('YT Player Error:', event.data);
          },
        },
      });
    };

    if (apiReadyRef.current) {
      tryInit();
    } else {
      // Poll until API is ready
      const poll = setInterval(() => {
        if (apiReadyRef.current) {
          clearInterval(poll);
          tryInit();
        }
      }, 100);
      return () => {
        clearInterval(poll);
        if (playerRef.current) {
          try { playerRef.current.destroy(); } catch { /* ignore */ }
          playerRef.current = null;
        }
        isReadyRef.current = false;
      };
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch { /* ignore */ }
        playerRef.current = null;
      }
      isReadyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // ── Sync play/pause from store → player (Zustand v5 subscribe) ───────────────
  useEffect(() => {
    let prevPlaying = usePlayerStore.getState().isPlaying;

    const unsub = usePlayerStore.subscribe((state) => {
      const playing = state.isPlaying;
      if (playing === prevPlaying) return;
      prevPlaying = playing;

      if (!playerRef.current || !isReadyRef.current) return;
      try {
        const ytState = playerRef.current.getPlayerState?.();
        setCommanding(true);
        if (playing && ytState !== 1) {
          playerRef.current.playVideo();
        } else if (!playing && ytState === 1) {
          playerRef.current.pauseVideo();
        }
      } catch { /* ignore */ }
    });

    return unsub;
  }, []);

  // ── Sync volume from store → player ──────────────────────────────────────────
  useEffect(() => {
    let prevVol = usePlayerStore.getState().volume;

    const unsub = usePlayerStore.subscribe((state) => {
      if (state.volume === prevVol) return;
      prevVol = state.volume;
      if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(state.volume * 100);
      }
    });

    return unsub;
  }, []);

  // ── Progress ticker ───────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        playerRef.current &&
        isReadyRef.current &&
        usePlayerStore.getState().isPlaying &&
        typeof playerRef.current.getCurrentTime === 'function'
      ) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [setCurrentTime]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
