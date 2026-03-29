'use client';

import dynamic from 'next/dynamic';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Headphones, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import FullscreenOverlay from './FullscreenOverlay';
import styles from './Player.module.css';
import Controls from '@/components/player/Controls';
import ProgressBar from '@/components/player/ProgressBar';
import SearchBar from '@/components/sidebar/SearchBar';
import { useLyricsStore } from '@/store/useLyricsStore';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as unknown as React.FC<any>;

export default function PlayerContainer() {
  const { currentSong, isPlaying, volume, next, setCurrentTime, currentTime, playerMode } = usePlayerStore();
  const { fetchLyrics } = useLyricsStore();

  useEffect(() => {
    if (currentSong) {
      fetchLyrics(currentSong.artist, currentSong.title);
    }
  }, [currentSong, fetchLyrics]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Video / Audio Area */}
      <div className="w-full aspect-video rounded-3xl overflow-hidden glass relative flex items-center justify-center shadow-2xl shadow-primary/10 border-white/5 bg-black">
        {!currentSong ? (
          <>
            <img 
              src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=1200&auto=format&fit=crop" 
              alt="Player background" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" 
            />
            <div className="z-10 flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                <Play size={32} className="text-white ml-2" fill="currentColor" />
              </div>
              <p className="text-zinc-300 font-medium tracking-wide">Ready to play...</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full">
            {playerMode === 'audio' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 z-[5] animate-fade-in overflow-hidden">
                <img 
                  src={currentSong.thumbnail || currentSong.cover} 
                  alt={currentSong.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110" 
                />
                <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
                  <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-md shadow-lg">
                    <Headphones size={36} className="text-primary animate-pulse" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg mb-1">{currentSong.title}</p>
                    <p className="text-zinc-400 text-sm">{currentSong.artist}</p>
                  </div>
                </div>
              </div>
            )}
            <div className={`w-full h-full transition-opacity duration-500 ${playerMode === 'audio' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
                    playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0 }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="flex flex-col gap-4">
        <ProgressBar />
        <Controls />
        <SearchBar />
      </div>

      <FullscreenOverlay />
    </div>
  );
}
