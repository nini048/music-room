import { create } from 'zustand';

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  thumbnail: string;
  duration: number | string; // in seconds or "MM:SS"
}

interface PlayerState {
  queue: Song[];
  history: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  isShuffle: boolean;
  isFullscreen: boolean;
  repeatMode: 'none' | 'one' | 'all';
  playerMode: 'video' | 'audio';
  
  // Actions
  togglePlayerMode: () => void;
  setPlayerMode: (mode: 'video' | 'audio') => void;
  setCurrentSong: (song: Song) => void;
  setCurrentTime: (time: number) => void;
  toggleFullscreen: () => void;
  setFullscreen: (val: boolean) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  playNext: (song: Song) => void; // Push to front of queue
  clearQueue: () => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  
  // Logic
  next: () => void;
  previous: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  history: [],
  currentSong: null,
  isPlaying: false,
  volume: 0.5,
  currentTime: 0,
  isShuffle: false,
  isFullscreen: false,
  repeatMode: 'none',
  playerMode: 'video',

  setCurrentSong: (song: Song) => set({ currentSong: song, isPlaying: true, currentTime: 0 }),
  setCurrentTime: (time: number) => set({ currentTime: time }),
  toggleFullscreen: () => set({ isFullscreen: !get().isFullscreen }),
  setFullscreen: (val: boolean) => set({ isFullscreen: val }),
  togglePlayerMode: () => set({ playerMode: get().playerMode === 'video' ? 'audio' : 'video' }),
  setPlayerMode: (mode: 'video' | 'audio') => set({ playerMode: mode }),

  addToQueue: (song: Song) => {
    const { queue } = get();
    // Logic: unique check
    if (queue.some((s) => s.id === song.id)) return;
    set({ queue: [...queue, song] });
  },

  removeFromQueue: (songId: string) => {
    const { queue } = get();
    set({ queue: queue.filter((s) => s.id !== songId) });
  },

  playNext: (song: Song) => {
    const { queue } = get();
    // Remove if exists
    const filtered = queue.filter((s) => s.id !== song.id);
    // Add to front
    set({ queue: [song, ...filtered] });
  },

  clearQueue: () => set({ queue: [] }),

  setPlaying: (isPlaying: boolean) => set({ isPlaying }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume: number) => set({ volume }),
  toggleShuffle: () => set({ isShuffle: !get().isShuffle }),
  setRepeatMode: (mode: 'none' | 'one' | 'all') => set({ repeatMode: mode }),

  next: () => {
    const { queue, currentSong, history, repeatMode, isShuffle } = get();
    
    if (queue.length === 0) {
      if (repeatMode === 'all' && history.length > 0) {
        // Recycle history if queue empty and repeat all
        const allSongs = [...history, ...(currentSong ? [currentSong] : [])];
        if (allSongs.length > 0) {
           set({ queue: allSongs, history: [] });
           // Recursively call next to pick from new queue
           get().next();
        }
        return;
      }
      if (repeatMode === 'one' && currentSong) {
         // Keep playing current song
         return;
      }
      return;
    }

    let nextSong: Song;
    let newQueue: Song[];

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * queue.length);
      nextSong = queue[randomIndex];
      newQueue = queue.filter((_, i) => i !== randomIndex);
    } else {
      nextSong = queue[0];
      newQueue = queue.slice(1);
    }

    const newHistory = currentSong ? [...history, currentSong] : history;
    
    set({ 
      currentSong: nextSong,
      queue: newQueue,
      history: newHistory,
      isPlaying: true 
    });
  },

  previous: () => {
    const { history, currentSong, queue } = get();
    if (history.length === 0) return;

    const prevSong = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    if (currentSong) {
      set({
        queue: [currentSong, ...queue],
        currentSong: prevSong,
        history: newHistory,
        isPlaying: true
      });
    } else {
      set({
        currentSong: prevSong,
        history: newHistory,
        isPlaying: true
      });
    }
  }
}));
