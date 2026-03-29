'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

export function useKeyboardShortcuts() {
  const store = usePlayerStore;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const { togglePlay, next, previous, setVolume, volume, toggleFullscreen, setFullscreen, isFullscreen } = store.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.altKey) { e.preventDefault(); next(); }
          break;
        case 'ArrowLeft':
          if (e.altKey) { e.preventDefault(); previous(); }
          break;
        case 'KeyM':
          setVolume(volume > 0 ? 0 : 0.5);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) setFullscreen(false);
          break;
        case 'ArrowUp':
          if (e.altKey) { e.preventDefault(); setVolume(Math.min(1, volume + 0.1)); }
          break;
        case 'ArrowDown':
          if (e.altKey) { e.preventDefault(); setVolume(Math.max(0, volume - 0.1)); }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store]);
}
