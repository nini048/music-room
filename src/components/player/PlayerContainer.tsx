'use client';

import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyricsStore } from '@/store/useLyricsStore';
import { useColorStore } from '@/store/useColorStore';
import { Play } from 'lucide-react';
import { useEffect, useRef } from 'react';
import FullscreenOverlay from './FullscreenOverlay';
import Controls from '@/components/player/Controls';
import MiniPlayer from '@/components/player/MiniPlayer';
import SearchBar from '@/components/sidebar/SearchBar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './PlayerContainer.module.css';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as unknown as React.FC<any>;

export default function PlayerContainer() {
  const { currentSong, isPlaying, volume, next, setCurrentTime, playerMode, sleepTimer, setPlaying } = usePlayerStore();
  const { fetchLyrics } = useLyricsStore();
  const { setDominantColor } = useColorStore();
  const controlsRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcuts();

  useEffect(() => {
    if (currentSong) {
      fetchLyrics(currentSong.artist, currentSong.title);
      setDominantColor(currentSong.thumbnail || currentSong.cover || '');
    }
  }, [currentSong, fetchLyrics, setDominantColor]);

  useEffect(() => {
    if (!sleepTimer) return;
    const remaining = sleepTimer - Date.now();
    if (remaining <= 0) { setPlaying(false); return; }
    const timeout = setTimeout(() => setPlaying(false), remaining);
    return () => clearTimeout(timeout);
  }, [sleepTimer, setPlaying]);

  return (
    <div className={styles.container}>
      
      {/* Video / Audio Area */}
      <div className={styles.videoArea}>
        {!currentSong ? (
          <>
            <img
              src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=1200&auto=format&fit=crop"
              alt="Background"
              className={styles.bgImage}
            />
            <div className={styles.emptyState}>
              <div className={styles.playIconEmpty}>
                <Play size={28} />
              </div>
              <p className={styles.emptyText}>Start Listening</p>
            </div>
          </>
        ) : (
          <div className={styles.playerWrapper}>
            {/* Audio Only overlay */}
            {playerMode === 'audio' && (
              <div className={styles.audioOverlay}>
                <img
                  src={currentSong.thumbnail || currentSong.cover}
                  alt={currentSong.title}
                  className={styles.audioBg}
                />
                <div className={styles.audioGradient} />
                
                {/* Center Image */}
                <div className={styles.audioContent}>
                  <div className={styles.audioCoverBox}>
                    <img src={currentSong.thumbnail || currentSong.cover} alt={currentSong.title} />
                  </div>
                  <div>
                    <h2 className={styles.audioTitle}>{currentSong.title}</h2>
                    <p className={styles.audioArtist}>{currentSong.artist}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Player */}
            <div className={styles.reactPlayerContainer} style={{ opacity: playerMode === 'audio' ? 0 : 1, pointerEvents: playerMode === 'audio' ? 'none' : 'auto' }}>
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${currentSong.id}`}
                playing={isPlaying}
                volume={volume}
                width="100%"
                height="100%"
                onEnded={() => next()}
                onReady={() => setPlaying(true)}
                onProgress={(state: { playedSeconds: number }) => setCurrentTime(state.playedSeconds)}
                config={{
                  youtube: {
                    playerVars: { controls: 0, modestbranding: 1, rel: 0, showinfo: 0, disablekb: 1 }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div ref={controlsRef}>
        <Controls />
      </div>

      {/* Search Area */}
      <div className={styles.searchArea}>
        <div className={styles.searchHeader}>
          <h3 className={styles.searchTitle}>Discover</h3>
          <button className={styles.importBtn}>
            <svg className={styles.importIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Import
          </button>
        </div>
        <SearchBar />
      </div>

      {/* Mini Player */}
      <MiniPlayer controlsRef={controlsRef} />
      <FullscreenOverlay />
    </div>
  );
}
