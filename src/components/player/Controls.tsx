'use client';

import {
  Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Repeat1,
  Volume2, VolumeX, Headphones, Moon
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useState, useRef, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import styles from './Controls.module.css';

export default function Controls() {
  const {
    isPlaying, togglePlay, next, previous,
    volume, setVolume, isShuffle, toggleShuffle,
    repeatMode, setRepeatMode, currentSong,
    playerMode, togglePlayerMode,
    sleepTimer, setSleepTimer,
  } = usePlayerStore();

  const [showSleep, setShowSleep] = useState(false);
  const sleepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sleepRef.current && !sleepRef.current.contains(e.target as Node)) setShowSleep(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sleepRemaining = sleepTimer ? Math.max(0, Math.ceil((sleepTimer - Date.now()) / 60000)) : null;

  const handleToggleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const SLEEP_OPTIONS = [15, 30, 45, 60];

  return (
    <div className={styles.controlsWrapper}>
      
      {/* 1. Ultra Minimal Progress Bar */}
      <div className={styles.progressBarArea}>
        <ProgressBar />
      </div>

      {/* 2. Playback Controls Flow */}
      <div className={styles.playbackFlow}>
        {/* Left Space (Empty for symmetry) */}
        <div className={styles.leftSpace} />

        <div className={styles.mainControls}>
          <button onClick={toggleShuffle}
            className={`${styles.btnAction} ${isShuffle ? styles.btnActionLight : styles.btnActionDark}`}
            title="Shuffle (S)">
            <Shuffle size={20} />
          </button>

          <button onClick={previous} disabled={!currentSong} 
            className={`${styles.skipBtn} ${styles.skipBtnLeft}`} 
            title="Bài trước (Alt+←)">
            <SkipBack size={26} fill="currentColor" />
          </button>

          <button onClick={togglePlay} disabled={!currentSong}
            className={`${styles.playPauseBtn} ${currentSong ? styles.playPauseActive : styles.playPauseDisabled}`}
            title="Play/Pause (Space)">
            {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} className={styles.playIconOffset} fill="currentColor" />}
          </button>

          <button onClick={next} disabled={!currentSong}
            className={`${styles.skipBtn} ${styles.skipBtnRight}`} 
            title="Bài kế tiếp (Alt+→)">
            <SkipForward size={26} fill="currentColor" />
          </button>

          <button onClick={handleToggleRepeat}
            className={`${styles.btnAction} ${repeatMode !== 'none' ? styles.btnActionLight : styles.btnActionDark}`}
            title="Repeat">
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
          </button>
        </div>

        {/* Right Side: Utilities */}
        <div className={styles.rightControls}>
          {/* Audio mode */}
          <button onClick={togglePlayerMode} disabled={!currentSong}
            className={`${styles.utilityBtn} ${playerMode === 'audio' ? styles.utilityBtnActive : styles.utilityBtnInactive}`}
            title="Audio Only">
            <Headphones size={18} />
          </button>

          {/* Sleep Timer */}
          <div className={styles.sleepWrapper} ref={sleepRef}>
            <button onClick={() => setShowSleep(!showSleep)}
              className={`${styles.utilityBtn} ${sleepTimer ? styles.utilityBtnActive : styles.utilityBtnInactive}`}
              title="Hẹn giờ ngủ">
              <Moon size={18} />
              {sleepRemaining && <span className={styles.sleepTime}>{sleepRemaining}</span>}
            </button>
            {showSleep && (
              <div className={styles.sleepMenu}>
                <p className={styles.sleepMenuTitle}>Auto Sleep</p>
                <div className={styles.sleepGrid}>
                  {SLEEP_OPTIONS.map((m) => (
                    <button key={m} onClick={() => { setSleepTimer(m); setShowSleep(false); }}
                      className={`${styles.sleepOption} ${sleepRemaining === m ? styles.sleepOptionActive : styles.sleepOptionInactive}`}>
                      {m} min
                    </button>
                  ))}
                </div>
                {sleepTimer && (
                  <button onClick={() => { setSleepTimer(null); setShowSleep(false); }}
                    className={styles.sleepCancel}>
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={styles.volumeGroup}>
            <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className={styles.volumeBtn}>
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <div className={styles.volumeSliderWrapper}>
              <input type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={styles.volumeInput} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
