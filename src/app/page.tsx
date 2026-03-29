import Header from '@/components/layout/Header';
import PlayerContainer from '@/components/player/PlayerContainer';
import Sidebar from '@/components/sidebar/Sidebar';
import FullscreenOverlay from '@/components/player/FullscreenOverlay';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className="container">
      <div className={styles.mainContent}>
        <Header />
        <PlayerContainer />
      </div>
      <Sidebar />
      <FullscreenOverlay />
    </main>
  );
}
