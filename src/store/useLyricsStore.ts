import { create } from 'zustand';

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

interface LyricsState {
  lyrics: LyricLine[];
  plainLyrics: string | null;
  isLoading: boolean;
  error: string | null;
  currentLineIndex: number;
  
  fetchLyrics: (artist: string, track: string) => Promise<void>;
  updateCurrentLine: (time: number) => void;
  clearLyrics: () => void;
}

const cleanMetadata = (text: string): string => {
  return text
    .replace(/\(Official Video\)/gi, '')
    .replace(/\[Official Video\]/gi, '')
    .replace(/\(Lyric Video\)/gi, '')
    .replace(/\[Lyric Video\]/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .replace(/\(Music Video\)/gi, '')
    .replace(/\[Music Video\]/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/\[feat\..*?\]/gi, '')
    .replace(/\(with.*?\)/gi, '')
    .replace(/\d{4} - /g, '')
    .trim();
};

const parseLRC = (lrc: string): LyricLine[] => {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d+):(\d+\.\d+)\]/;

  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseFloat(match[2]);
      const time = minutes * 60 + seconds;
      const text = line.replace(timeRegex, '').trim();
      if (text) {
        result.push({ time, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
};

export const useLyricsStore = create<LyricsState>((set, get) => ({
  lyrics: [],
  plainLyrics: null,
  isLoading: false,
  error: null,
  currentLineIndex: -1,

  fetchLyrics: async (artist: string, track: string) => {
    const cleanArtist = cleanMetadata(artist);
    const cleanTrack = cleanMetadata(track);
    
    set({ isLoading: true, error: null, lyrics: [], plainLyrics: null, currentLineIndex: -1 });
    try {
      const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTrack)}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (data.syncedLyrics) {
          set({ lyrics: parseLRC(data.syncedLyrics), plainLyrics: data.plainLyrics, isLoading: false });
        } else {
          set({ plainLyrics: data.plainLyrics || 'No lyrics found.', isLoading: false });
        }
      } else {
        // Fallback to search if get fails
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanArtist} ${cleanTrack}`)}`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          if (searchData && searchData.length > 0) {
            const bestMatch = searchData[0];
            if (bestMatch.syncedLyrics) {
               set({ lyrics: parseLRC(bestMatch.syncedLyrics), plainLyrics: bestMatch.plainLyrics, isLoading: false });
            } else {
               set({ plainLyrics: bestMatch.plainLyrics || 'No lyrics found.', isLoading: false });
            }
          } else {
             set({ error: 'Lyrics not found.', isLoading: false });
          }
        } else {
          set({ error: 'Failed to fetch lyrics.', isLoading: false });
        }
      }
    } catch (err) {
      set({ error: 'An error occurred while fetching lyrics.', isLoading: false });
    }
  },

  updateCurrentLine: (time: number) => {
    const { lyrics } = get();
    if (lyrics.length === 0) return;
    
    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
       if (time >= lyrics[i].time) {
         index = i;
       } else {
         break;
       }
    }
    
    if (index !== get().currentLineIndex) {
      set({ currentLineIndex: index });
    }
  },

  clearLyrics: () => set({ lyrics: [], plainLyrics: null, error: null, isLoading: false, currentLineIndex: -1 })
}));
