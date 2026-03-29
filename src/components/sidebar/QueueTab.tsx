'use client';

import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { Trash2, Plus, Play, MoreVertical } from 'lucide-react';
import styles from './Tabs.module.css';

export default function QueueTab() {
  const { queue, removeFromQueue, playNext, setCurrentSong, currentSong } = usePlayerStore();

  const emptyState = (
    <div className={styles.empty}>
      <Play size={40} className="mb-4 opacity-20" />
      <p>Hàng chờ đang trống</p>
    </div>
  );

  return (
    <div className={styles.queueList}>
      {/* Current Song Highlight */}
      {currentSong && (
        <div className={`${styles.songItem} ${styles.active}`} onClick={() => setCurrentSong(currentSong)}>
           <div className={styles.coverWrapper}>
             <img src={currentSong.thumbnail || currentSong.cover} alt={currentSong.title} className={styles.cover} />
             <div className={styles.activeIndicator}>
               <div className={styles.bar} style={{ animationDelay: '0s' }} />
               <div className={styles.bar} style={{ animationDelay: '0.2s' }} />
               <div className={styles.bar} style={{ animationDelay: '0.4s' }} />
             </div>
           </div>
           <div className={styles.info}>
             <h4 className={styles.title}>{currentSong.title}</h4>
             <p className={styles.artist}>Đang phát</p>
           </div>
        </div>
      )}

      {/* Queue Items */}
      {queue.map((song) => (
        <div key={song.id} className={styles.songItem}>
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

      {queue.length === 0 && !currentSong && emptyState}
    </div>
  );
}
