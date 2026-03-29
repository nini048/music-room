'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyricsStore } from '@/store/useLyricsStore';
import {
  X, Maximize2, Shuffle, SkipBack, Play, Pause, SkipForward,
  Repeat, Repeat1, Volume2, VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import styles from './FullscreenOverlay.module.css';

export default function FullscreenOverlay() {
  const {
    currentSong, isFullscreen, setFullscreen,
    isPlaying, togglePlay, next, previous,
    currentTime, isShuffle, toggleShuffle,
    repeatMode, setRepeatMode, volume, setVolume,
  } = usePlayerStore();
  const { lyrics } = useLyricsStore();
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = lyrics.findIndex((line, i) => {
    const next = lyrics[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  useEffect(() => {
    if (activeIndex !== -1 && lyricsRef.current) {
      const el = lyricsRef.current.children[activeIndex] as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  // Auto-hide controls navigation
  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3500);
  };
  useEffect(() => {
    if (isFullscreen) resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [isFullscreen]);

  if (!isFullscreen || !currentSong) return null;

  const handleToggleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.wrapper}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
        onMouseMove={resetControlsTimer}
        onTouchStart={resetControlsTimer}
      >
        {/* Extreme Background blur from thumbnail */}
        <div className={styles.bgContainer}>
          <img src={currentSong.cover || currentSong.thumbnail} alt="" className={styles.bgImage} />
          <div className={styles.bgOverlay} />
        </div>

        {/* 1. Header Navigation */}
        <motion.div
          className={styles.headerNav}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.headerText}>
            <Maximize2 size={16} />
            <span>FULL SCREEN</span>
          </div>
          <button onClick={() => setFullscreen(false)} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </motion.div>

        {/* 2. Main Layout 2 Columns */}
        <div className={styles.mainLayout}>

          {/* CỘT TRÁI: Player Info & Controls */}
          <div className={styles.leftCol}>
            {/* Album Art */}
            <motion.div
              className={styles.albumArtWrapper}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', damping: 25 }}
            >
              <img src={currentSong.cover || currentSong.thumbnail} alt={currentSong.title} className={styles.albumArtImg} />
              <div className={styles.albumArtGradient} />
              {isPlaying && (
                <div className={styles.visualizerBox}>
                  {[0, 0.15, 0.3, 0.15, 0].map((d, i) => (
                    <span key={i} className={styles.visualizerBar} style={{ animationDelay: `${d}s`, height: `${40 + i * 15}%` }} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Song Info */}
            <div className={styles.songInfo}>
              <h2 className={styles.songTitle}>{currentSong.title}</h2>
              <p className={styles.songArtist}>{currentSong.artist}</p>
            </div>

            {/* Playback Controls */}
            <div className={styles.playbackControls}>
              {/* Row 1: Buttons */}
              <div className={styles.controlRow1}>
                <button onClick={toggleShuffle} className={`${styles.iconBtn} ${isShuffle ? styles.iconBtnActive : ''}`}>
                  <Shuffle size={20} />
                </button>
                <button onClick={previous} className={styles.skipBtn}>
                  <SkipBack size={28} fill="currentColor" />
                </button>
                <button onClick={togglePlay} className={styles.playBtn}>
                  {isPlaying ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className={styles.playIconOffset} />}
                </button>
                <button onClick={next} className={styles.skipBtn}>
                  <SkipForward size={28} fill="currentColor" />
                </button>
                <button onClick={handleToggleRepeat} className={`${styles.iconBtn} ${repeatMode !== 'none' ? styles.iconBtnActive : ''}`}>
                  {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                </button>
              </div>

              {/* Row 2: Volume */}
              <div className={styles.controlRow2}>
                <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className={styles.volumeBtn}>
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className={styles.volumeSlider} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Lyrics Khổng lồ */}
          <div className={styles.rightCol}>
            <p className={styles.lyricsLabel}>Lyrics</p>
            {lyrics.length > 0 ? (
              <div ref={lyricsRef} className={`custom-scrollbar ${styles.lyricsArea}`}>
                {lyrics.map((line, i) => {
                  const isActive = activeIndex === i;
                  return (
                    <motion.p key={i}
                      className={`${styles.lyricLine} ${isActive ? styles.lyricActive : styles.lyricInactive}`}
                      animate={{ opacity: isActive ? 1 : 0.3 }}
                    >
                      {line.text}
                    </motion.p>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyLyrics}>
                ♪ Âm nhạc bay bổng, nhưng không tìm thấy lời bài hát
              </div>
            )}
            
            {/* Gradient shadow to fade out bottom and top of lyrics slightly */}
            <div className={styles.gradientTop} />
            <div className={styles.gradientBottom} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
