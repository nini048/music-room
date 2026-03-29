'use client';

import Header from '@/components/layout/Header';
import PlayerContainer from '@/components/player/PlayerContainer';
import Sidebar from '@/components/sidebar/Sidebar';
import FullscreenOverlay from '@/components/player/FullscreenOverlay';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className="container relative overflow-hidden">
      {/* Background Mesh */}
      <div className="bg-mesh" />

      <div className="main-grid">
        {/* Left Column: Header, Player & Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          <Header />
          <PlayerContainer />
        </div>

        {/* Right Column: Queue/History/Playlists */}
        <div className="lg:col-span-4 min-h-[500px] lg:min-h-0">
          <Sidebar />
        </div>
      </div>

      <FullscreenOverlay />
    </main>
  );
}
