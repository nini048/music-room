'use client';

import Header from '@/components/layout/Header';
import PlayerContainer from '@/components/player/PlayerContainer';
import Sidebar from '@/components/sidebar/Sidebar';
import { useColorStore } from '@/store/useColorStore';
import styles from './page.module.css';

export default function Home() {
  const { dominantColor } = useColorStore();

  return (
    <main className={styles.main}>
      
      {/* Ultra Soft Ambient Backdrop */}
      <div 
        className={styles.ambientTopRight}
        style={{ background: `radial-gradient(circle, ${dominantColor} 0%, transparent 70%)` }}
      />
      <div 
        className={styles.ambientBottomLeft}
        style={{ background: `radial-gradient(circle, ${dominantColor} 0%, transparent 70%)` }}
      />

      <Header />

      <div className={styles.contentWrapper}>
        
        {/* Left Area (Player, Controls, Search) */}
        <div id="main-scroll-container" className={styles.leftColumn}>
          <PlayerContainer />
        </div>

        {/* Right Area (Sidebar / Queue) */}
        <div className={styles.rightColumn}>
          <Sidebar />
        </div>
      </div>
    </main>
  );
}
