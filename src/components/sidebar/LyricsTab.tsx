'use client';

import { useEffect, useRef } from 'react';
import { useLyricsStore } from '@/store/useLyricsStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { motion } from 'framer-motion';
import { Music, Loader2 } from 'lucide-react';
import styles from './LyricsTab.module.css';

export default function LyricsTab() {
  const { currentSong, currentTime, seekTo } = usePlayerStore();
  const { lyrics, isLoading, plainLyrics } = useLyricsStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the active lyric line
  const activeIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  // Auto-scroll to active line
  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeEl = containerRef.current.children[activeIndex + 1] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!currentSong) {
    return (
      <div className={styles.empty}>
        <Music size={36} className={styles.emptyIcon} />
        <p>Chọn bài hát để xem lời</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.empty}>
        <Loader2 size={28} className={styles.spinner} />
        <p>Đang tìm lời bài hát...</p>
      </div>
    );
  }

  if (lyrics.length === 0) {
    return (
      <div className={styles.empty}>
        <Music size={36} className={styles.emptyIcon} />
        <p>Không tìm thấy lời bài hát</p>
        {plainLyrics && (
          <div className={styles.plainLyrics}>
            {plainLyrics.split('\n').map((line, i) => (
              <p key={i} className={styles.plainLine}>{line || '\u00a0'}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Song header */}
      <div className={styles.songHeader}>
        <h3 className={styles.songTitle}>{currentSong.title}</h3>
        <p className={styles.songArtist}>{currentSong.artist}</p>
      </div>

      {/* Synced lyrics */}
      {lyrics.map((line, index) => {
        const isActive = activeIndex === index;
        return (
          <motion.div
            key={index}
            className={`${styles.lyricLine} ${isActive ? styles.active : styles.inactive}`}
            animate={{
              opacity: isActive ? 1 : 0.38,
              scale: isActive ? 1.03 : 1,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => seekTo(line.time)}
            title="Nhấn để tua tới đây"
          >
            {line.text}
          </motion.div>
        );
      })}
    </div>
  );
}
