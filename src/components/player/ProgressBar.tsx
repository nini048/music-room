'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useState, useEffect } from 'react';

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
    <div className="flex items-center gap-4 w-full px-2 group">
      <span className="text-[11px] font-medium text-zinc-500 tabular-nums min-w-[32px]">
        {formatTime(currentTime)}
      </span>
      
      <div className="relative flex-1 h-6 flex items-center">
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
          className="absolute inset-0 w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer focus:outline-none z-10"
          style={{
            background: `linear-gradient(to right, #8b5cf6 ${displayProgress}%, rgba(255, 255, 255, 0.1) ${displayProgress}%)`,
          }}
        />
        {/* Hover Thumb Placeholder */}
        <div 
          className="absolute h-3 w-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
          style={{ left: `calc(${displayProgress}% - 6px)` }}
        />
      </div>

      <span className="text-[11px] font-medium text-zinc-500 tabular-nums min-w-[32px]">
        {formatTime(durationInSeconds)}
      </span>
    </div>
  );
}
