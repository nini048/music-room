'use client';

import { useState } from 'react';
import { ListMusic, Bookmark, History, Quote } from 'lucide-react';
import styles from './Sidebar.module.css';
import QueueTab from './QueueTab';
import LyricsTab from './LyricsTab';
import PlaylistTab from './PlaylistTab';
import SearchBar from './SearchBar';
import { usePlayerStore } from '@/store/usePlayerStore';

type Tab = 'queue' | 'playlist' | 'history' | 'lyrics';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const { queue, history } = usePlayerStore();

  const tabs = [
    { id: 'queue', label: 'Hàng chờ', icon: <ListMusic size={16} />, count: queue.length },
    { id: 'playlist', label: 'Playlist', icon: <Bookmark size={16} /> },
    { id: 'history', label: 'Đã phát', icon: <History size={16} />, count: history.length },
    { id: 'lyrics', label: 'Lyrics', icon: <Quote size={16} /> },
  ];

  return (
    <aside className={`${styles.sidebar} glass`}>
      <div className={styles.searchSection}>
        <SearchBar />
      </div>

      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id as Tab)}
          >
            <div className={styles.tabIcon}>{tab.icon}</div>
            <span className={styles.tabLabel}>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={styles.badge}>{tab.count}</span>
            )}
            {activeTab === tab.id && <div className={styles.indicator} />}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'queue' && <QueueTab />}
        {activeTab === 'lyrics' && <LyricsTab />}
        {activeTab === 'playlist' && <div className={styles.emptyState}>Playlist đang trống</div>}
        {activeTab === 'history' && <PlaylistTab />}
      </div>
    </aside>
  );
}
