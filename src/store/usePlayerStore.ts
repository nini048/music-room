import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from './useToastStore';

import _DEFAULT_SONGS_DATA from './defaultSongs.json';

// Handle both array format and object format (localStorage dump)
export const DEFAULT_SONGS: Song[] = Array.isArray(_DEFAULT_SONGS_DATA) 
  ? _DEFAULT_SONGS_DATA as Song[]
  : (_DEFAULT_SONGS_DATA as any).queue as Song[] || [];

export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  thumbnail: string;
  duration: number | string;
  channel?: string; // YouTube channel name, used as fallback artist in lyrics search
}

interface PlayerState {
  defaultSongs: Song[];
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
  seekTo: (time: number) => void;
  registerSeek: (fn: (t: number) => void) => void;
  toggleFullscreen: () => void;
  setFullscreen: (val: boolean) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  playNext: (song: Song) => void;
  clearQueue: () => void;
  clearHistory: () => void;
  loadDefaultSongs: () => void;
  saveQueueAsDefault: () => void;
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
      defaultSongs: DEFAULT_SONGS,
      queue: DEFAULT_SONGS,
      history: [],
      currentSong: { "id": "XKZQ3wlS9aI", "title": "ENHYPEN (엔하이픈) 'No Doubt' (Color Coded Lyrics)", "channel": "Jaeguchi", "thumbnail": "https://i.ytimg.com/vi/XKZQ3wlS9aI/hq720.jpg", "duration": "2:46", "artist": "ENHYPEN", "cover": "" },
      isPlaying: false,
      volume: 0.8,
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
      seekTo: (time) => {
        const { _seekFn } = get() as any;
        if (_seekFn) _seekFn(time);
        set({ currentTime: time });
      },
      registerSeek: (fn) => (set as any)({ _seekFn: fn }),
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
          toast.warning(`"${song.title}" đang được phát`, { thumbnail: song.thumbnail || song.cover });
          return;
        }
        if (queue.some((s) => s.id === song.id)) {
          toast.warning(`"${song.title}" đã có trong hàng chờ`, { thumbnail: song.thumbnail || song.cover });
          return;
        }
        set({ queue: [...queue, song] });
        toast.success(`Đã thêm vào hàng chờ`, { thumbnail: song.thumbnail || song.cover });
      },

      removeFromQueue: (songId) => {
        const { queue } = get();
        const song = queue.find((s) => s.id === songId);
        set({ queue: queue.filter((s) => s.id !== songId) });
        if (song) toast.info(`Đã xóa "${song.title}"`, { thumbnail: song.thumbnail || song.cover });
      },

      playNext: (song) => {
        const { queue } = get();
        const filtered = queue.filter((s) => s.id !== song.id);
        set({ queue: [song, ...filtered] });
        toast.success(`Phát tiếp theo: "${song.title}"`, { thumbnail: song.thumbnail || song.cover });
      },

      clearQueue: () => set({ queue: [] }),
      clearHistory: () => set({ history: [] }),

      loadDefaultSongs: () => {
        const { queue, currentSong, defaultSongs } = get();
        // Merge the master json file with whatever was saved in local storage
        const mergedDefaults = [...DEFAULT_SONGS, ...defaultSongs];
        const uniqueSource = Array.from(new Map(mergedDefaults.map(item => [item.id, item])).values());
        
        const existingIds = new Set([...queue.map(s => s.id), currentSong?.id].filter(Boolean));
        const toAdd = uniqueSource.filter(s => !existingIds.has(s.id));
        
        if (toAdd.length === 0) {
          toast.info('Tất cả bài mặc định đã có trong hàng chờ');
          return;
        }
        set({ queue: [...queue, ...toAdd] });
        toast.success(`Đã thêm ${toAdd.length} bài vào hàng chờ`);
      },

      saveQueueAsDefault: () => {
        const { queue, currentSong } = get();
        const fullList = currentSong ? [currentSong, ...queue] : queue;
        if (fullList.length === 0) {
          toast.warning('Danh sách trống, không thể lưu');
          return;
        }
        // Ensure no duplicates just in case
        const unique = Array.from(new Map(fullList.map(item => [item.id, item])).values());
        set({ defaultSongs: unique });
        toast.success(`Đã lưu ${unique.length} bài hát làm mặc định`);
      },

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
        defaultSongs: state.defaultSongs,
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
