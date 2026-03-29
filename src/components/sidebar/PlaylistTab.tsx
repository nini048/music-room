'use client';

import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { Play, Plus, History } from 'lucide-react';
import styles from './Tabs.module.css';

export default function PlaylistTab() {
  const { history, setCurrentSong, addToQueue } = usePlayerStore();

  if (history.length === 0) {
    return (
      <div className={styles.empty}>
        <History size={40} className="mb-4 opacity-20" />
        <p>Lịch sử nghe đang trống</p>
      </div>
    );
  }

  return (
    <div className={styles.historyList}>
      {history.map((song, index) => (
        <div key={`${song.id}-${index}`} className={styles.songItem}>
          <div className={styles.coverWrapper} onClick={() => setCurrentSong(song)}>
            <img src={song.thumbnail || song.cover} alt={song.title} className={styles.cover} />
            <div className={styles.playOverlay}>
              <Play size={16} fill="white" />
            </div>
          </div>
          <div className={styles.info} onClick={() => setCurrentSong(song)}>
            <h4 className={styles.title}>{song.title}</h4>
            <p className={styles.artist}>{song.artist}</p>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.actionBtn} 
              title="Thêm vào hàng chờ"
              onClick={() => addToQueue(song)}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
