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
    { id: 'queue', label: 'Hàng chờ', count: queue.length },
    { id: 'playlist', label: 'Playlist' },
    { id: 'history', label: 'Đã phát', count: history.length },
    { id: 'lyrics', label: 'Lyrics' },
  ];

  const tabBtn = (t: Tab, label: string, badge?: number) => (
    <button
      onClick={() => setActiveTab(t)}
      className={`text-sm font-semibold transition-all relative whitespace-nowrap py-2 ${activeTab === t ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
          {badge}
        </span>
      )}
      {activeTab === t && (
        <span className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-primary rounded-t-full shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
      )}
    </button>
  );

  return (
    <aside className="glass-dark rounded-3xl p-5 md:p-6 flex flex-col h-full border border-white/5 shadow-xl min-h-0">
      <div className="flex items-center gap-4 mb-4 shrink-0 pb-1 border-b border-white/10 overflow-x-auto custom-scrollbar-hidden">
        {tabs.map((tab) => (
          <div key={tab.id}>
            {tabBtn(tab.id as Tab, tab.label, tab.count)}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar min-h-0 pt-2 relative">
        {activeTab === 'queue' && <QueueTab />}
        {activeTab === 'lyrics' && <LyricsTab />}
        {activeTab === 'playlist' && <div className="text-center py-10 text-zinc-500 text-sm">Playlist đang trống</div>}
        {activeTab === 'history' && <PlaylistTab />}
      </div>
    </aside>
  );
}
