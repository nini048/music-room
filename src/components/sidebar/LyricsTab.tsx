'use client';

import { useEffect, useRef } from 'react';
import { useLyricsStore } from '@/store/useLyricsStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';
import styles from './Tabs.module.css';

export default function LyricsTab() {
  const { currentSong, currentTime } = usePlayerStore();
  const { lyrics, isLoading } = useLyricsStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  const activeIndex = lyrics.findIndex((line, i) => {
    const nextLine = lyrics[i + 1];
    return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
  });

  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.children[activeIndex + 1] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (!currentSong) {
    return (
      <div className={styles.empty}>
        <Music size={40} className="mb-4 opacity-20" />
        <p>Chọn bài hát để xem lời</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.empty}>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Đang tìm lời bài hát...</p>
      </div>
    );
  }

  if (lyrics.length === 0) {
    return (
      <div className={styles.empty}>
        <Music size={40} className="mb-4 opacity-20" />
        <p>Không tìm thấy lời bài hát</p>
      </div>
    );
  }

  return (
    <div className={styles.lyricsContainer} ref={containerRef}>
      <div className="mb-6 px-2">
        <h3 className="text-white font-bold text-lg leading-tight truncate">{currentSong.title}</h3>
        <p className="text-zinc-500 text-sm truncate">{currentSong.artist}</p>
      </div>
      {lyrics.map((line, index) => (
        <motion.div
          key={index}
          className={`${styles.lyricLine} ${activeIndex === index ? styles.active : ''}`}
          animate={{
            opacity: activeIndex === index ? 1 : 0.4,
            scale: activeIndex === index ? 1.05 : 1
          }}
        >
          {line.text}
        </motion.div>
      ))}
    </div>
  );
}
