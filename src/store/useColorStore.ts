import { create } from 'zustand';
import { FastAverageColor } from 'fast-average-color';

interface ColorStore {
  dominantColor: string;
  setDominantColor: (url: string) => Promise<void>;
}

export const useColorStore = create<ColorStore>((set) => ({
  dominantColor: '#09090b', // Default dark
  setDominantColor: async (url: string) => {
    if (!url) {
      set({ dominantColor: '#09090b' });
      return;
    }
    try {
      const fac = new FastAverageColor();
      // Use proxy or crossOrigin to avoid canvas CORS, but usually youtube thumbnails are fine with crossOrigin="anonymous" 
      // if fetched directly, but we might get a CORS error.
      // Easiest is to bypass CORS with an image object or just try it.
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const color = fac.getColor(img, { algorithm: 'dominant' });
      set({ dominantColor: color.hex });
    } catch (error) {
      console.error('Failed to extract color:', error);
      set({ dominantColor: '#09090b' }); // Fallback
    }
  },
}));
