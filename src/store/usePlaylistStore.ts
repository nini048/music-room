import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song } from './usePlayerStore';
import { toast } from './useToastStore';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: number;
}

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => string; // returns new id
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderSong: (playlistId: string, fromIdx: number, toIdx: number) => void;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: [],

      createPlaylist: (name) => {
        const id = `pl_${Date.now()}`;
        set((s) => ({
          playlists: [...s.playlists, { id, name, songs: [], createdAt: Date.now() }],
        }));
        toast.success(`Đã tạo playlist "${name}"`);
        return id;
      },

      deletePlaylist: (id) => {
        const pl = get().playlists.find((p) => p.id === id);
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) }));
        if (pl) toast.info(`Đã xóa playlist "${pl.name}"`);
      },

      renamePlaylist: (id, name) => {
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? { ...p, name } : p)),
        }));
      },

      addSongToPlaylist: (playlistId, song) => {
        const pl = get().playlists.find((p) => p.id === playlistId);
        if (!pl) return;
        if (pl.songs.some((s) => s.id === song.id)) {
          toast.warning(`"${song.title}" đã có trong playlist này`);
          return;
        }
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, songs: [...p.songs, song] } : p
          ),
        }));
        toast.success(`Đã thêm vào playlist "${pl.name}"`);
      },

      removeSongFromPlaylist: (playlistId, songId) => {
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
              : p
          ),
        }));
        toast.info('Đã xóa bài khỏi playlist');
      },

      reorderSong: (playlistId, fromIdx, toIdx) => {
        set((s) => ({
          playlists: s.playlists.map((p) => {
            if (p.id !== playlistId) return p;
            const songs = [...p.songs];
            const [moved] = songs.splice(fromIdx, 1);
            songs.splice(toIdx, 0, moved);
            return { ...p, songs };
          }),
        }));
      },
    }),
    { name: 'music-room-playlists' }
  )
);
