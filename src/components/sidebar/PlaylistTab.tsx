'use client';

import { useState } from 'react';
import { usePlaylistStore, Playlist } from '@/store/usePlaylistStore';
import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { Trash2, Play, Plus, ListMusic, ChevronLeft, GripVertical } from 'lucide-react';
import styles from './Tabs.module.css';

export default function PlaylistTab() {
  const { playlists, deletePlaylist, removeSongFromPlaylist, reorderPlaylist, playPlaylist } = usePlaylistStore();
  const { setCurrentSong, addToQueue, currentSong } = usePlayerStore();
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  // --- PLAYLIST LIST VIEW ---
  if (!activePlaylistId) {
    if (playlists.length === 0) {
      return (
        <div className={styles.emptyState}>
          <ListMusic size={32} className={styles.emptyIcon} />
          <p>Chưa có playlist</p>
          <p className={styles.emptySubtext}>Tạo playlist bằng cách thêm bài hát từ tìm kiếm</p>
        </div>
      );
    }

    return (
      <div className={styles.container} style={{ gap: '12px' }}>
        {playlists.map(pl => (
          <div key={pl.id} className={styles.songRow} onClick={() => setActivePlaylistId(pl.id)}>
            <div className={styles.thumbContainer} style={{ background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListMusic size={20} color="white" opacity={0.5} />
            </div>
            <div className={styles.songInfo}>
              <p className={styles.songTitleActive}>{pl.name}</p>
              <p className={styles.songArtist}>{pl.songs.length} bài hát</p>
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
              className={styles.menuBtn}
              title="Xóa playlist"
              style={{ color: '#f87171' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // --- SINGLE PLAYLIST VIEW ---
  if (!activePlaylist) {
    setActivePlaylistId(null);
    return null;
  }

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    reorderPlaylist(activePlaylist.id, dragIdx, toIdx);
    setDragIdx(null);
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={() => setActivePlaylistId(null)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#a1a1aa' }}>
          <ChevronLeft size={16} /> Quay lại
        </button>
        <button onClick={() => playPlaylist(activePlaylist.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'white', color: 'black', padding: '6px 12px', borderRadius: '16px', fontWeight: 600 }}>
          <Play size={12} fill="black" /> Phát tất cả
        </button>
      </div>

      <h3 className={styles.songTitleActive} style={{ fontSize: '18px', marginBottom: '4px' }}>{activePlaylist.name}</h3>
      <p className={styles.songArtist} style={{ marginBottom: '16px' }}>{activePlaylist.songs.length} bài hát</p>

      {activePlaylist.songs.length === 0 ? (
        <div className={styles.emptyState}>
          <ListMusic size={32} className={styles.emptyIcon} />
          <p>Playlist trống</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {activePlaylist.songs.map((song, idx) => (
            <div
              key={`${song.id}-${idx}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              style={{ transition: 'opacity 0.2s', opacity: dragIdx === idx ? 0.4 : 1 }}
            >
              <SongRow
                song={song}
                isActive={currentSong?.id === song.id}
                onPlay={() => setCurrentSong(song)}
                onRemove={() => removeSongFromPlaylist(activePlaylist.id, idx)}
                onAddToQueue={() => addToQueue(song)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SongRow({ song, isActive, onPlay, onRemove, onAddToQueue }: { song: Song; isActive: boolean; onPlay: () => void; onRemove: () => void; onAddToQueue: () => void; }) {
  return (
    <div className={`${styles.songRow} ${isActive ? styles.songRowActive : ''}`}>
      <GripVertical size={14} className={styles.dragHandle} />
      <div onClick={onPlay} className={styles.thumbContainer}>
        <img src={song.thumbnail || song.cover} alt={song.title} className={styles.thumbImg} />
        {isActive ? (
          <div className={styles.thumbOverlayActive}>
             <span className={styles.visualizerBox}>
              {[0, 0.2, 0.4].map((d, i) => (
                <span key={i} className={styles.visualizerBar} style={{ animationDelay: `${d}s`, height: '60%' }} />
              ))}
            </span>
          </div>
        ) : (
          <div className={styles.thumbOverlayHover}>
            <Play size={12} fill="white" color="white" />
          </div>
        )}
      </div>
      <div className={styles.songInfo} onClick={onPlay}>
        <p className={`${styles.songTitle} ${isActive ? styles.songTitleActive : styles.songTitleInactive}`}>{song.title}</p>
        <p className={styles.songArtist}>{song.artist}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0 }} className={styles.menuBtn}>
        <button onClick={onAddToQueue} style={{ padding: '6px', color: '#a1a1aa' }} title="Add to queue">
          <Plus size={14} />
        </button>
        <button onClick={onRemove} style={{ padding: '6px', color: '#f87171' }} title="Remove">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
