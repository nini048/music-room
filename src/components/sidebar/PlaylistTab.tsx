'use client';

import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { Play, Plus, Clock } from 'lucide-react';
import styles from './Tabs.module.css';

export default function PlaylistTab() {
  const { history, setCurrentSong, addToQueue } = usePlayerStore();

  if (history.length === 0) {
    return (
      <div className={styles.empty}>
        <Clock size={48} className={styles.mutedIcon} />
        <p>Lịch sử đang trống</p>
      </div>
    );
  }

  return (
    <div className={styles.playlistList}>
      <h3 className={styles.sectionTitle}>Gần đây</h3>
      {history.slice().reverse().map((song, index) => (
        <div key={`${song.id}-${index}`} className={styles.songItem}>
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
