'use client';

import { 
  Shuffle, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat, 
  Repeat1,
  Volume2, 
  VolumeX, 
  Maximize2,
  ListMusic,
  Clock,
  Zap,
  Maximize,
  Video,
  Headphones,
  Link2
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useState } from 'react';

export default function Controls() {
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

  const handleToggleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const handleCopyLink = () => {
    if (!currentSong) return;
    const url = `https://www.youtube.com/watch?v=${currentSong.id}`;
    navigator.clipboard.writeText(url).then(() => {
       // Optional: show toast
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 glass p-4 md:p-6 rounded-3xl w-full border border-white/5 shadow-xl animate-fade-in relative z-20">
      <div className="flex items-center gap-8 md:gap-12">
        <button 
          onClick={toggleShuffle}
          className={`transition-all hover:scale-110 ${isShuffle ? 'text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Shuffle size={20} />
        </button>

        <button 
          onClick={previous}
          className="transition-all text-zinc-300 hover:text-white hover:scale-110"
        >
          <SkipBack size={26} fill="currentColor" />
        </button>

        <button 
          onClick={togglePlay}
          disabled={!currentSong}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${currentSong ? 'bg-white text-black hover:scale-105 shadow-white/10' : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'}`}
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>

        <button 
          onClick={next}
          className="transition-all text-zinc-300 hover:text-white hover:scale-110"
        >
          <SkipForward size={26} fill="currentColor" />
        </button>

        <button 
          onClick={handleToggleRepeat}
          className={`transition-all hover:scale-110 ${repeatMode !== 'none' ? 'text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 w-full border-t border-white/5 pt-4 mt-2">
        <button 
          onClick={togglePlayerMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all ${playerMode === 'audio' ? 'border-primary/50 text-white bg-primary/20' : 'border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500'}`}
        >
          <Headphones size={13} />
          Audio Only
        </button>

        <button 
          onClick={handleCopyLink}
          disabled={!currentSong}
          className="p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
          title="Sao chép link YouTube"
        >
          <Link2 size={16} />
        </button>

        <button 
          onClick={toggleFullscreen}
          className="p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          title="Toàn màn hình"
        >
          <Maximize2 size={16} />
        </button>

        <div className="flex items-center gap-3 px-2 flex-1 max-w-[150px]">
          <button onClick={() => setVolume(volume === 0 ? 0.5 : 0)} className="text-zinc-500 hover:text-white">
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none bg-zinc-800 accent-primary cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
