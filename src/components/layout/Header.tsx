import { Radio } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={`${styles.header} glass`}>
      <div className={styles.logoContainer}>
        <div className={`${styles.icon} animate-glow`}>
          <Radio size={24} color="#fff" />
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>nini's room</h1>
          <div className={styles.statusIndicator}>
            <span className={styles.pulse} />
            <p className={styles.status}>LIVE MUSIC SESSION</p>
          </div>
        </div>
      </div>
    </header>
  );
}
