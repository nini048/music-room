'use client';

import { useState } from 'react';
import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { usePlaylistStore } from '@/store/usePlaylistStore';
import { Trash2, Play, SkipForward, ListMusic, GripVertical, X } from 'lucide-react';
import styles from './Tabs.module.css';

export default function QueueTab() {
  const { queue, removeFromQueue, playNext, setCurrentSong, currentSong, clearQueue, loadDefaultSongs, saveQueueAsDefault } = usePlayerStore();
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylistStore();
  const [playlistPickSong, setPlaylistPickSong] = useState<Song | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDrop = (toIdx: number) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    const newQueue = [...queue];
    const [moved] = newQueue.splice(dragIdx, 1);
    newQueue.splice(toIdx, 0, moved);
    usePlayerStore.setState({ queue: newQueue });
    setDragIdx(null);
  };

  const emptyState = (
    <div className={styles.emptyState}>
      <Play size={32} className={styles.emptyIcon} />
      <p>Hàng chờ đang trống</p>
      <p className={styles.emptySubtext}>Tìm kiếm và thêm bài hát</p>
      <button
        onClick={loadDefaultSongs}
        className={styles.loadDefaultBtn}
      >
        ✦ Load nhạc mặc định
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Queue header with clear + load default */}
      {(queue.length > 0 || currentSong) && (
        <div className={styles.queueHeader}>
          <button onClick={loadDefaultSongs} className={styles.queueHeaderBtn} title="Nạp nhạc mặc định">
            ✦ Nạp mặc định
          </button>
          <button onClick={saveQueueAsDefault} className={styles.queueHeaderBtn} title="Lưu danh sách hiện tại làm mặc định">
            ✦ Lưu mặc định
          </button>
          {queue.length > 0 && (
            <button onClick={clearQueue} className={`${styles.queueHeaderBtn} ${styles.queueHeaderBtnDanger}`} title="Xoá hàng chờ">
              Xoá tất cả
            </button>
          )}
        </div>
      )}

      {/* Current Song */}
      {currentSong && (
        <div style={{ marginBottom: '8px' }}>
          <p className={styles.sectionTitle}>Đang phát</p>
          <SongRow
            song={currentSong}
            isActive
            onPlay={() => setCurrentSong(currentSong)}
          />
        </div>
      )}

      {/* Queue */}
      {queue.length > 0 && (
        <div>
          <p className={styles.sectionTitle}>
            Hàng chờ · {queue.length} bài
          </p>
          {queue.map((song, idx) => (
            <div
              key={song.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(idx)}
              style={{ transition: 'opacity 0.2s', opacity: dragIdx === idx ? 0.4 : 1 }}
            >
              <SongRow
                song={song}
                onPlay={() => setCurrentSong(song)}
                onPlayNext={() => playNext(song)}
                onAddToPlaylist={() => setPlaylistPickSong(song)}
                onRemove={() => removeFromQueue(song.id)}
                showDrag
              />
            </div>
          ))}
        </div>
      )}

      {queue.length === 0 && !currentSong && emptyState}

      {/* Playlist picker */}
      {playlistPickSong && (
        <PlaylistPicker
          song={playlistPickSong}
          playlists={playlists}
          newName={newPlaylistName}
          setNewName={setNewPlaylistName}
          onAdd={(pid) => { addSongToPlaylist(pid, playlistPickSong); setPlaylistPickSong(null); }}
          onCreate={(name) => { const pid = createPlaylist(name); addSongToPlaylist(pid, playlistPickSong); setPlaylistPickSong(null); setNewPlaylistName(''); }}
          onClose={() => setPlaylistPickSong(null)}
        />
      )}
    </div>
  );
}

// ─── Song Row ─────────────────────────────────────────────────────────────────
function SongRow({ song, isActive, onPlay, onPlayNext, onAddToPlaylist, onRemove, showDrag }: {
  song: Song;
  isActive?: boolean;
  onPlay: () => void;
  onPlayNext?: () => void;
  onAddToPlaylist?: () => void;
  onRemove?: () => void;
  showDrag?: boolean;
}) {
  return (
    <div className={`${styles.songRow} ${isActive ? styles.songRowActive : ''}`}>
      {showDrag && <GripVertical size={14} className={styles.dragHandle} />}
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
      {!isActive && (
        <div className={styles.hoverActions}>
          {onPlayNext && (
            <button onClick={onPlayNext} className={styles.hoverActionBtn} title="Phát tiếp theo">
              <SkipForward size={13} />
            </button>
          )}
          {onAddToPlaylist && (
            <button onClick={onAddToPlaylist} className={styles.hoverActionBtn} title="Thêm vào playlist">
              <ListMusic size={13} />
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} className={`${styles.hoverActionBtn} ${styles.hoverActionBtnDanger}`} title="Xóa">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Playlist Picker ──────────────────────────────────────────────────────────
import type { Playlist } from '@/store/usePlaylistStore';

function PlaylistPicker({ song, playlists, newName, setNewName, onAdd, onCreate, onClose }: {
  song: Song; playlists: Playlist[]; newName: string; setNewName: (v: string) => void;
  onAdd: (id: string) => void; onCreate: (name: string) => void; onClose: () => void;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '320px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', background: 'rgba(12,12,16,0.98)', zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>Thêm Playlist</h3>
          <button onClick={onClose} style={{ color: '#71717a' }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: '11px', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '12px' }}>{song.title}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px', maxHeight: '160px', overflowY: 'auto' }}>
          {playlists.map((pl) => (
            <button key={pl.id} onClick={() => onAdd(pl.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#d4d4d8', fontSize: '12px', textAlign: 'left' }}>
              <ListMusic size={12} style={{ flexShrink: 0, color: 'white' }} />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
              <span style={{ fontSize: '12px', color: '#71717a' }}>{pl.songs.length}</span>
            </button>
          ))}
          {playlists.length === 0 && <p style={{ fontSize: '12px', color: '#71717a', textAlign: 'center', padding: '8px 0' }}>Chưa có playlist</p>}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Tạo playlist mới..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px', color: 'white' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) onCreate(newName.trim()); }} />
          <button onClick={() => { if (newName.trim()) onCreate(newName.trim()); }} disabled={!newName.trim()}
            style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '12px', fontWeight: 500, opacity: !newName.trim() ? 0.4 : 1 }}>
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}
