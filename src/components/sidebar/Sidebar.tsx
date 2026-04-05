'use client';

import { useState } from 'react';
import QueueTab from './QueueTab';
import LyricsTab from './LyricsTab';
import PlaylistTab from './PlaylistTab';
import HistoryTab from './HistoryTab';
import { usePlayerStore } from '@/store/usePlayerStore';
import styles from './Sidebar.module.css';

type Tab = 'queue' | 'playlist' | 'history' | 'lyrics';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const { queue, history } = usePlayerStore();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'queue', label: 'Up Next', count: queue.length },
    { id: 'history', label: 'History', count: history.length },
    { id: 'lyrics', label: 'Lyrics' },
    { id: 'playlist', label: 'Playlists' },
  ];

  return (
    <aside className={styles.sidebar}>
      
      {/* Tab Bar - Super minimalist border-bottom style */}
      <div className={`${styles.tabBar} scrollbar-hide`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabBtn} ${isActive ? styles.tabActive : styles.tabInactive}`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`${styles.badge} ${isActive ? styles.badgeActive : styles.badgeInactive}`}>
                  {tab.count}
                </span>
              )}

              {/* Active Indicator Line */}
              {isActive && (
                <span className={styles.activeLine} />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={`${activeTab === 'lyrics' ? 'scrollbar-hide' : 'custom-scrollbar'} ${styles.tabContent}`}>
        {activeTab === 'queue' && <QueueTab />}
        {activeTab === 'lyrics' && <LyricsTab />}
        {activeTab === 'playlist' && <PlaylistTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </aside>
  );
}
