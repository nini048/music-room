'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyricsStore } from '@/store/useLyricsStore';
import { 
  X, 
  Maximize2, 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Fullscreen.module.css';
import { useEffect, useRef } from 'react';

export default function FullscreenOverlay() {
  const { 
    currentSong, 
    isFullscreen, 
    setFullscreen, 
    isPlaying, 
    togglePlay, 
    next, 
    previous,
    currentTime,
    isShuffle,
    toggleShuffle,
    repeatMode,
    setRepeatMode,
    toggleFullscreen
  } = usePlayerStore();
  
  const { lyrics } = useLyricsStore();
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Sync lyrics scroll
  const activeIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  useEffect(() => {
    if (activeIndex !== -1 && lyricsRef.current) {
      const activeElement = lyricsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!isFullscreen || !currentSong) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.fullscreenLabel}>
            <Maximize2 size={16} />
            <span>FULL SCREEN</span>
          </div>
          <button className={styles.closeBtn} onClick={toggleFullscreen}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Left: Player Info */}
          <div className={styles.playerInfo}>
            <motion.div 
              className={styles.coverWrapper}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img src={currentSong.cover} alt={songTitle(currentSong.title)} className={styles.cover} />
              {isPlaying && (
                <div className={styles.visualizerBars}>
                  {[1,2,3].map(i => <div key={i} className={styles.bar} />)}
                </div>
              )}
            </motion.div>

            <div className={styles.metadata}>
              <h1 className={styles.title}>{currentSong.title}</h1>
              <p className={styles.artist}>{currentSong.artist}</p>
            </div>

            <div className={styles.controls}>
              <button 
                className={`${styles.iconBtn} ${isShuffle ? styles.active : ''}`}
                onClick={toggleShuffle}
              >
                <Shuffle size={20} />
              </button>
              <button className={styles.iconBtn} onClick={previous}>
                <SkipBack size={24} fill="currentColor" />
              </button>
              <button 
                className={styles.playBtn}
                onClick={togglePlay}
              >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </button>
              <button className={styles.iconBtn} onClick={next}>
                <SkipForward size={24} fill="currentColor" />
              </button>
              <button 
                className={`${styles.iconBtn} ${repeatMode !== 'none' ? styles.active : ''}`}
                onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
              >
                <Repeat size={20} />
              </button>
            </div>

            <div className={styles.volumeArea}>
               <Volume2 size={18} />
               <div className={styles.volumeTrack}>
                  <div className={styles.volumeFill} style={{ width: '70%' }} />
               </div>
            </div>
          </div>

          {/* Right: Lyrics */}
          <div className={styles.lyricsArea}>
            <p className={styles.lyricsTitle}>LYRICS</p>
            <div className={styles.lyricsList} ref={lyricsRef}>
              {lyrics.length > 0 ? (
                lyrics.map((line, index) => (
                  <motion.p
                    key={index}
                    className={`${styles.lyricLine} ${activeIndex === index ? styles.active : ''}`}
                    animate={{ 
                      opacity: activeIndex === index ? 1 : 0.3,
                      scale: activeIndex === index ? 1.1 : 1
                    }}
                  >
                    {line.text}
                  </motion.p>
                ))
              ) : (
                <p className={styles.noLyrics}>Fetching lyrics...</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function songTitle(title: string) {
  return title.split('|')[0].trim();
}
