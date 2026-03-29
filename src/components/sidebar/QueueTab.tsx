'use client';

import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { Trash2, Plus, Play, MoreVertical } from 'lucide-react';
import styles from './Tabs.module.css';

export default function QueueTab() {
  const { queue, removeFromQueue, playNext, setCurrentSong } = usePlayerStore();

  if (queue.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <Play size={40} className={styles.mutedIcon} />
        </div>
        <p>Hàng chờ đang trống</p>
      </div>
    );
  }

  return (
    <div className={styles.queueList}>
      {queue.map((song) => (
        <div key={song.id} className={styles.songItem}>
          <div className={styles.coverWrapper}>
            <img src={song.thumbnail || song.cover} alt={song.title} className={styles.cover} />
            <div className={styles.playOverlay} onClick={() => setCurrentSong(song)}>
              <Play size={14} fill="white" />
            </div>
          </div>
          <div className={styles.info}>
            <h4 className={styles.title}>{song.title}</h4>
            <p className={styles.artist}>{song.artist}</p>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              title="Phát kế tiếp"
              onClick={() => playNext(song)}
            >
              <Plus size={16} />
            </button>
            <button 
              className={`${styles.actionBtn} ${styles.danger}`} 
              title="Xóa khỏi hàng chờ"
              onClick={() => removeFromQueue(song.id)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
