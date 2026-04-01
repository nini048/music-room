'use client';

import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyricsStore } from '@/store/useLyricsStore';
import { useColorStore } from '@/store/useColorStore';
import { Play, Link2, X, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import FullscreenOverlay from './FullscreenOverlay';
import Controls from '@/components/player/Controls';
import MiniPlayer from '@/components/player/MiniPlayer';
import SearchBar from '@/components/sidebar/SearchBar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import styles from './PlayerContainer.module.css';

// Dynamically import ReactPlayer (client-only, no SSR)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactPlayerDynamic = dynamic<any>(() => import('react-player'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', background: '#000' }} />,
});

export default function PlayerContainer() {
  const { currentSong, isPlaying, volume, next, setCurrentTime, playerMode, sleepTimer, setPlaying, addToQueue, setCurrentSong, registerSeek } = usePlayerStore();
  const { fetchLyrics } = useLyricsStore();
  const { setDominantColor } = useColorStore();
  const controlsRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Register the seek function once player mounts
  useEffect(() => {
    registerSeek((time: number) => {
      playerRef.current?.seekTo(time, 'seconds');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError('');
    try {
      const res = await fetch(`/api/import?url=${encodeURIComponent(importUrl.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const songs = data.songs || [];
      if (songs.length === 0) {
        setImportError('Không tìm thấy video.');
      } else {
        // Play first song, add rest to queue
        setCurrentSong(songs[0]);
        songs.slice(1).forEach((s: any) => addToQueue(s));
        setShowImport(false);
        setImportUrl('');
      }
    } catch (e: any) {
      setImportError(e.message || 'Lỗi khi import.');
    } finally {
      setImporting(false);
    }
  };

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
              <ReactPlayerDynamic
                ref={playerRef}
                url={`https://www.youtube.com/watch?v=${currentSong.id}`}
                playing={isPlaying}
                volume={volume}
                muted={volume === 0}
                width="100%"
                height="100%"
                onEnded={() => next()}
                onReady={() => setPlaying(true)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onProgress={(state: { playedSeconds: number }) => setCurrentTime(state.playedSeconds)}
                config={{
                  youtube: {
                    playerVars: { 
                      controls: 0, 
                      modestbranding: 1, 
                      rel: 0, 
                      disablekb: 1,
                      origin: typeof window !== 'undefined' ? window.location.origin : ''
                    }
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
          <button className={styles.importBtn} onClick={() => setShowImport(true)}>
            <Link2 size={14} className={styles.importIcon} />
            Import URL
          </button>
        </div>
        <SearchBar />
      </div>

      {/* Import Modal */}
      {showImport && (
        <div className={styles.importModalOverlay} onClick={() => setShowImport(false)}>
          <div className={styles.importModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.importModalHeader}>
              <h3 className={styles.importModalTitle}>Import từ YouTube</h3>
              <button onClick={() => setShowImport(false)} className={styles.importModalClose}><X size={16} /></button>
            </div>
            <p className={styles.importModalHint}>Dán link video hoặc playlist YouTube</p>
            <div className={styles.importInputRow}>
              <input
                className={styles.importInput}
                value={importUrl}
                onChange={(e) => { setImportUrl(e.target.value); setImportError(''); }}
                placeholder="https://youtube.com/watch?v=..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
                autoFocus
              />
              <button
                className={styles.importSubmitBtn}
                onClick={handleImport}
                disabled={importing || !importUrl.trim()}
              >
                {importing ? <Loader2 size={16} className={styles.importing} /> : 'Import'}
              </button>
            </div>
            {importError && <p className={styles.importError}>{importError}</p>}
          </div>
        </div>
      )}

      {/* Mini Player */}
      <MiniPlayer controlsRef={controlsRef} />
      <FullscreenOverlay />
    </div>
  );
}
