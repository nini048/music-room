'use client';

import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { History, Play, Plus, SkipForward, Trash2 } from 'lucide-react';
import styles from './Tabs.module.css';

export default function HistoryTab() {
  const { history, setCurrentSong, addToQueue, playNext, clearHistory } = usePlayerStore();

  const emptyState = (
    <div className={styles.emptyState}>
      <History size={32} className={styles.emptyIcon} />
      <p>Lịch sử trống</p>
      <p className={styles.emptySubtext}>Bạn chưa nghe bài hát nào</p>
    </div>
  );

  return (
    <div className={styles.container}>
      {history.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p className={styles.sectionTitle}>
            Đã nghe · {history.length} bài
          </p>
          <button
            onClick={clearHistory}
            style={{ fontSize: '10px', color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '4px' }}
          >
            Xóa
          </button>
        </div>
      )}

      {history.length > 0 ? (
        history.slice().reverse().map((song) => (
          <HistoryRow
            key={song.id}
            song={song}
            onPlay={() => setCurrentSong(song)}
            onAddToQueue={() => addToQueue(song)}
            onPlayNext={() => playNext(song)}
          />
        ))
      ) : (
        emptyState
      )}
    </div>
  );
}

function HistoryRow({ song, onPlay, onAddToQueue, onPlayNext }: {
  song: Song;
  onPlay: () => void;
  onAddToQueue: () => void;
  onPlayNext: () => void;
}) {
  return (
    <div className={styles.songRow}>
      <div onClick={onPlay} className={styles.thumbContainer}>
        <img src={song.thumbnail || song.cover} alt={song.title} className={styles.thumbImg} />
        <div className={styles.thumbOverlayHover}>
          <Play size={12} fill="white" color="white" />
        </div>
      </div>
      <div className={styles.songInfo} onClick={onPlay}>
        <p className={`${styles.songTitle} ${styles.songTitleInactive}`}>{song.title}</p>
        <p className={styles.songArtist}>{song.artist}</p>
      </div>
      <div className={styles.hoverActions}>
        <button onClick={onAddToQueue} className={styles.hoverActionBtn} title="Thêm vào hàng chờ">
          <Plus size={13} />
        </button>
        <button onClick={onPlayNext} className={styles.hoverActionBtn} title="Phát tiếp theo">
          <SkipForward size={13} />
        </button>
      </div>
    </div>
  );
}
