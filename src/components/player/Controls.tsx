'use client';

import { 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Maximize2,
  ListMusic,
  Clock,
  Zap,
  Maximize,
  Video,
  Headphones
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import styles from './Controls.module.css';
import { useState } from 'react';

interface ControlsProps {
  playedSeconds: number;
}

export default function Controls({ playedSeconds }: ControlsProps) {
  const { 
    isPlaying, 
    togglePlay, 
    next, 
    previous, 
    volume, 
    setVolume, 
    isShuffle, 
    toggleShuffle, 
    repeatMode, 
    setRepeatMode,
    currentSong,
    toggleFullscreen,
    playerMode,
    togglePlayerMode
  } = usePlayerStore();

  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(0.5);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className={styles.controlsLayer}>
      {/* Progress Bar Area */}
      <div className={styles.progressSection}>
        <span className={styles.time}>{formatTime(playedSeconds)}</span>
        <div className={styles.progressTrack}>
           <div 
             className={styles.progressFill} 
             style={{ width: `${(playedSeconds / (typeof currentSong?.duration === 'number' ? currentSong.duration : 1)) * 100}%` }}
           />
           <div 
             className={styles.progressHandle}
             style={{ left: `${(playedSeconds / (typeof currentSong?.duration === 'number' ? currentSong.duration : 1)) * 100}%` }}
           />
        </div>
        <span className={styles.time}>{formatTime(typeof currentSong?.duration === 'number' ? currentSong.duration : 0)}</span>
      </div>

      {/* Main Controls Row */}
      <div className={styles.mainRow}>
        <div className={styles.leftGroup}>
           <button 
             className={`${styles.utilBtn} ${playerMode === 'video' ? styles.active : ''}`}
             onClick={togglePlayerMode}
             title={playerMode === 'video' ? "Chế độ Audio" : "Chế độ Video"}
           >
             {playerMode === 'video' ? <Video size={16} /> : <Headphones size={16} />}
             <span>{playerMode === 'video' ? "Thường" : "Audio"}</span>
           </button>
           <button className={styles.utilBtn}><Clock size={16} /> Sleep</button>
        </div>

        <div className={styles.centerGroup}>
          <button 
            className={`${styles.controlBtn} ${isShuffle ? styles.active : ''}`}
            onClick={toggleShuffle}
          >
            <Shuffle size={18} />
          </button>
          <button className={styles.controlBtn} onClick={previous}>
            <SkipBack size={22} fill="currentColor" />
          </button>
          <button 
            className={styles.playBtn}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={26} fill="currentColor" /> : <Play size={26} fill="currentColor" />}
          </button>
          <button className={styles.controlBtn} onClick={next}>
            <SkipForward size={22} fill="currentColor" />
          </button>
          <button 
            className={`${styles.controlBtn} ${repeatMode !== 'none' ? styles.active : ''}`}
            onClick={() => setRepeatMode(repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none')}
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className={styles.rightGroup}>
          <button className={styles.controlBtn} onClick={toggleMute}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
          <button className={styles.controlBtn} onClick={toggleFullscreen}>
             <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
