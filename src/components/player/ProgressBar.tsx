'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useState } from 'react';
import styles from './ProgressBar.module.css';

function parseDuration(duration: number | string): number {
  if (typeof duration === 'number') return duration;
  if (!duration) return 0;
  
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return isNaN(Number(duration)) ? 0 : Number(duration);
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ProgressBar() {
  const { currentTime, currentSong, setCurrentTime } = usePlayerStore();
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const durationInSeconds = currentSong ? parseDuration(currentSong.duration) : 0;
  const progress = durationInSeconds > 0 ? (currentTime / durationInSeconds) * 100 : 0;
  const displayProgress = isSeeking ? seekValue : progress;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSeekValue(parseFloat(e.target.value));
  };

  const handleSeekEnd = () => {
    const targetTime = (seekValue / 100) * durationInSeconds;
    setCurrentTime(targetTime);
    setIsSeeking(false);
  };

  if (!currentSong) return null;

  return (
    <div className={styles.progressWrapper}>
      <span className={`${styles.timeText} ${styles.right}`}>
        {formatTime(currentTime)}
      </span>
      
      <div className={styles.sliderContainer}>
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={displayProgress}
          onMouseDown={() => setIsSeeking(true)}
          onTouchStart={() => setIsSeeking(true)}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className={styles.sliderInput}
          style={{
            background: `linear-gradient(to right, white ${displayProgress}%, rgba(255, 255, 255, 0.1) ${displayProgress}%)`,
          }}
        />
        {/* Glow behind the thumb */}
        <div 
          className={styles.sliderGlow}
          style={{ left: `calc(${displayProgress}% - 8px)`, top: '50%' }}
        />
      </div>

      <span className={styles.timeText}>
        {formatTime(durationInSeconds)}
      </span>
    </div>
  );
}
