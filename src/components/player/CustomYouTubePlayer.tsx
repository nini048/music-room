'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CustomYouTubePlayer({ videoId }: { videoId: string }) {
  const { isPlaying, volume, next, setCurrentTime, registerSeek, setPlaying } = usePlayerStore();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  // Initialize Player
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return;

    // Clean up previous instance
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Create a new div for YT to replace (YT destroys the div it mounts on)
    const playerDiv = document.createElement('div');
    playerDiv.style.width = '100%';
    playerDiv.style.height = '100%';
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(playerDiv);

    playerRef.current = new window.YT.Player(playerDiv, {
      videoId,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        modestbranding: 1,
        origin: typeof window !== 'undefined' ? window.location.origin : '*'
      },
      events: {
        onReady: (event: any) => {
          console.log("Custom YT Player Ready!");
          if (isPlaying) {
            event.target.playVideo();
          } else {
            setPlaying(true);
          }
          registerSeek((time: number) => {
             event.target.seekTo(time, true);
          });
          event.target.setVolume(volume * 100);
        },
        onStateChange: (event: any) => {
           // 0 = ended, 1 = playing, 2 = paused
           if (event.data === 0) {
             next();
           } else if (event.data === 1) {
             setPlaying(true);
           } else if (event.data === 2) {
             setPlaying(false);
           }
        },
        onError: (event: any) => {
           console.error("Custom YT Player Error:", event.data);
        }
      }
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, videoId]); // Only re-instantiate when video changes

  // Sync volume
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Sync play/pause
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
      const state = playerRef.current.getPlayerState();
      // Only command if state doesn't match
      if (isPlaying && state !== 1) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === 1) {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  // Sync progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && isPlaying) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, setCurrentTime]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
