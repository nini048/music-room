'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MiniPlayer.module.css';

interface MiniPlayerProps {
  /** ref of the controls element to observe */
  controlsRef: React.RefObject<HTMLDivElement | null>;
}

export default function MiniPlayer({ controlsRef }: MiniPlayerProps) {
  const { currentSong, isPlaying, togglePlay, next, previous, volume, setVolume } = usePlayerStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!controlsRef.current) return;
    const root = document.getElementById('main-scroll-container');
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.1, root }
    );
    observer.observe(controlsRef.current);
    return () => observer.disconnect();
  }, [controlsRef]);

  const scrollToPlayer = () => {
    controlsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <AnimatePresence>
      {visible && currentSong && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className={styles.miniPlayerWrapper}
        >
          <div className={styles.maxContainer}>
            <div className={styles.miniPlayerBox}>
              {/* Thumbnail */}
              <img
                src={currentSong.thumbnail || currentSong.cover}
                alt={currentSong.title}
                onClick={scrollToPlayer}
                className={styles.thumbnailBtn}
              />

              {/* Info */}
              <div className={styles.infoArea} onClick={scrollToPlayer}>
                <p className={styles.songTitle}>{currentSong.title}</p>
                <p className={styles.songArtist}>{currentSong.artist}</p>
              </div>

              {/* Controls */}
              <div className={styles.playbackControls}>
                <button onClick={previous} className={styles.skipBtn}>
                  <SkipBack size={16} fill="currentColor" />
                </button>
                <button onClick={togglePlay} className={styles.playPauseBtn}>
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className={styles.playIconOffset} />}
                </button>
                <button onClick={next} className={styles.skipBtn}>
                  <SkipForward size={16} fill="currentColor" />
                </button>
              </div>

              {/* Volume (hide on small screens) */}
              <div className={styles.volumeArea}>
                <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className={styles.volumeBtn}>
                  {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className={styles.volumeSlider}
                />
              </div>

              {/* Scroll up btn */}
              <button onClick={scrollToPlayer} className={styles.scrollUpBtn} title="Lên player chính">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
