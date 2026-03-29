import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from './useToastStore';

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  thumbnail: string;
  duration: number | string;
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
  sleepTimer: number | null; // timestamp ms khi hết sleep

  // Actions
  togglePlayerMode: () => void;
  setPlayerMode: (mode: 'video' | 'audio') => void;
  setCurrentSong: (song: Song) => void;
  setCurrentTime: (time: number) => void;
  toggleFullscreen: () => void;
  setFullscreen: (val: boolean) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  playNext: (song: Song) => void;
  clearQueue: () => void;
  setPlaying: (isPlaying: boolean) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  setRepeatMode: (mode: 'none' | 'one' | 'all') => void;
  setSleepTimer: (minutes: number | null) => void;

  // Logic
  next: () => void;
  previous: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
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
      sleepTimer: null,

      setCurrentSong: (song) => {
        const { history, currentSong } = get();
        const newHistory = currentSong ? [...history, currentSong] : history;
        set({ currentSong: song, isPlaying: true, currentTime: 0, history: newHistory });
      },
      setCurrentTime: (time) => set({ currentTime: time }),
      toggleFullscreen: () => set({ isFullscreen: !get().isFullscreen }),
      setFullscreen: (val) => set({ isFullscreen: val }),
      togglePlayerMode: () => {
        const next = get().playerMode === 'video' ? 'audio' : 'video';
        set({ playerMode: next });
        toast.info(next === 'audio' ? '🎧 Chế độ Audio Only' : '🎬 Chế độ Video');
      },
      setPlayerMode: (mode) => set({ playerMode: mode }),

      addToQueue: (song) => {
        const { queue, currentSong } = get();
        if (currentSong?.id === song.id) {
          toast.warning(`"${song.title}" đang được phát`);
          return;
        }
        if (queue.some((s) => s.id === song.id)) {
          toast.warning(`"${song.title}" đã có trong hàng chờ`);
          return;
        }
        set({ queue: [...queue, song] });
        toast.success(`Đã thêm "${song.title}" vào hàng chờ`);
      },

      removeFromQueue: (songId) => {
        const { queue } = get();
        const song = queue.find((s) => s.id === songId);
        set({ queue: queue.filter((s) => s.id !== songId) });
        if (song) toast.info(`Đã xóa "${song.title}"`);
      },

      playNext: (song) => {
        const { queue } = get();
        const filtered = queue.filter((s) => s.id !== song.id);
        set({ queue: [song, ...filtered] });
        toast.success(`"${song.title}" sẽ phát tiếp theo`);
      },

      clearQueue: () => set({ queue: [] }),

      setPlaying: (isPlaying) => set({ isPlaying }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
      setVolume: (volume) => set({ volume }),
      toggleShuffle: () => {
        const next = !get().isShuffle;
        set({ isShuffle: next });
        toast.info(next ? '🔀 Shuffle bật' : 'Shuffle tắt');
      },
      setRepeatMode: (mode) => set({ repeatMode: mode }),

      setSleepTimer: (minutes) => {
        if (minutes === null) {
          set({ sleepTimer: null });
          toast.info('Đã tắt hẹn giờ ngủ');
        } else {
          const ts = Date.now() + minutes * 60 * 1000;
          set({ sleepTimer: ts });
          toast.success(`⏰ Hẹn ngủ sau ${minutes} phút`);
        }
      },

      next: () => {
        const { queue, currentSong, history, repeatMode, isShuffle } = get();

        if (repeatMode === 'one' && currentSong) return;

        if (queue.length === 0) {
          if (repeatMode === 'all' && history.length > 0) {
            const allSongs = [...history];
            set({ queue: allSongs, history: [] });
            get().next();
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
        set({ currentSong: nextSong, queue: newQueue, history: newHistory, isPlaying: true });
      },

      previous: () => {
        const { history, currentSong, queue } = get();
        if (history.length === 0) return;

        const prevSong = history[history.length - 1];
        const newHistory = history.slice(0, -1);

        if (currentSong) {
          set({ queue: [currentSong, ...queue], currentSong: prevSong, history: newHistory, isPlaying: true });
        } else {
          set({ currentSong: prevSong, history: newHistory, isPlaying: true });
        }
      },
    }),
    {
      name: 'music-room-player',
      // Không persist isFullscreen, currentTime, isPlaying
      partialize: (state) => ({
        queue: state.queue,
        history: state.history,
        currentSong: state.currentSong,
        volume: state.volume,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        playerMode: state.playerMode,
      }),
    }
  )
);
