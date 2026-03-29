'use client';

import { useEffect, useRef } from 'react';
import { useLyricsStore } from '@/store/useLyricsStore';
import { usePlayerStore } from '@/store/usePlayerStore';
import { motion } from 'framer-motion';
import styles from './Tabs.module.css';

export default function LyricsTab() {
  const { lyrics, currentLineIndex, isLoading, error } = useLyricsStore();
  const { currentTime } = usePlayerStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex !== -1 && scrollRef.current) {
      const activeLine = scrollRef.current.children[currentLineIndex] as HTMLElement;
      if (activeLine) {
        activeLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentLineIndex]);

  if (isLoading) return <div className={styles.center}>Loading lyrics...</div>;
  if (error) return <div className={styles.center}>{error}</div>;
  if (lyrics.length === 0) return <div className={styles.center}>No lyrics found for this song.</div>;

  return (
    <div className={styles.lyricsContainer} ref={scrollRef}>
      {lyrics.map((line, index) => (
        <motion.p
          key={index}
          className={`${styles.lyricLine} ${currentLineIndex === index ? styles.active : ''}`}
          animate={{
            opacity: currentLineIndex === index ? 1 : 0.4,
            scale: currentLineIndex === index ? 1.05 : 1
          }}
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  );
}
