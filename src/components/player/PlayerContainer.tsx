'use client';

import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Music, Headphones, Maximize2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import FullscreenOverlay from './FullscreenOverlay';
import styles from './Player.module.css';
import Controls from '@/components/player/Controls';
import { useLyricsStore } from '@/store/useLyricsStore';
import type ReactPlayerProps from 'react-player';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as unknown as React.FC<any>;

export default function PlayerContainer() {
  const { currentSong, isPlaying, volume, next, setCurrentTime, currentTime, setFullscreen, playerMode } = usePlayerStore();
  const { fetchLyrics } = useLyricsStore();

  useEffect(() => {
    if (currentSong) {
      fetchLyrics(currentSong.artist, currentSong.title);
    }
  }, [currentSong, fetchLyrics]);

  if (!currentSong) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <div className={styles.emptyState}>
            <Headphones size={64} className={styles.iconGlow} />
            <h2>Hãy chọn bài hát để bắt đầu nghe</h2>
            <p>Tìm kiếm bài hát yêu thích của bạn từ YouTube</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mediaArea}>
        {/* Actual player (hidden for audio-only look) */}
        <div className={`${styles.videoWrapper} ${playerMode === 'audio' ? styles.hidden : ''}`}>
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${currentSong.id}`}
            playing={isPlaying}
            volume={volume}
            width="100%"
            height="100%"
            onEnded={() => next()}
            onProgress={(state: { playedSeconds: number }) => {
              setCurrentTime(state.playedSeconds);
            }}
            config={{
               youtube: {
                 playerVars: { autoplay: 1, controls: 0 }
               }
            }}
          />
        </div>

        {/* Audio Only Overlay (Thumbnail) */}
        {playerMode === 'audio' && (
          <div className={styles.audioOverlay}>
            <div className={styles.blurredBackground} style={{ backgroundImage: `url(${currentSong.cover})` }} />
            <div className={styles.activeThumbnail}>
              <img src={currentSong.cover} alt={currentSong.title} className={styles.thumbnailImg} />
            </div>
            <div className={styles.audioVisualizer}>
              <Music size={48} className={styles.pulsingIcon} />
              <div className={styles.titleInfo}>
                 <h2 className={styles.songTitle}>Audio Only Mode</h2>
                 <p className={styles.songArtist}>{currentSong.artist} - {currentSong.title}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Controls playedSeconds={currentTime} />
      <FullscreenOverlay />
    </div>
  );
}
