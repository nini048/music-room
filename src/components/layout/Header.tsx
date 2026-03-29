'use client';

import { useColorStore } from '@/store/useColorStore';
import { Radio } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const { dominantColor } = useColorStore();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div 
          className={styles.iconBox}
          style={{ 
            background: dominantColor !== '#09090b' ? dominantColor : 'rgba(255,255,255,0.1)',
            boxShadow: dominantColor !== '#09090b' ? `0 0 25px ${dominantColor}50` : undefined
          }}
        >
          <Radio size={20} className={styles.icon} />
          <span className={styles.ping} />
        </div>
        <div className={styles.titleBox}>
          <h1 className={styles.title}>nini's room</h1>
          <div className={styles.statusRow}>
            <span className={styles.redDot} />
            <p className={styles.statusText}>LIVE SESSION</p>
          </div>
        </div>
      </div>
      
      {/* Could add user profile or settings here later */}
    </header>
  );
}
