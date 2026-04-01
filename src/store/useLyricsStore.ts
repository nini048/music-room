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
    .replace(/\(Official.*?Video\)/gi, '')
    .replace(/\[Official.*?Video\]/gi, '')
    .replace(/\(Lyric.*?Video\)/gi, '')
    .replace(/\[Lyric.*?Video\]/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\[Official Audio\]/gi, '')
    .replace(/\(Music Video\)/gi, '')
    .replace(/\[Music Video\]/gi, '')
    .replace(/\(?Official.*?\)?/gi, '')
    .replace(/\[?Official.*?\]?/gi, '')
    .replace(/\(?Lyrics?\)?/gi, '')
    .replace(/\[?Lyrics?\]?/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/\[feat\..*?\]/gi, '')
    .replace(/\(with.*?\)/gi, '')
    .replace(/\d{4} - /g, '')
    .replace(/MV/gi, '')
    .trim();
};

const extractArtistAndTitle = (rawArtist: string, rawTrack: string) => {
  let cleanTitle = cleanMetadata(rawTrack);
  let finalArtist = rawArtist;
  let finalTrack = cleanTitle;

  if (cleanTitle.includes('-')) {
    const parts = cleanTitle.split('-');
    finalArtist = parts[0].trim();
    finalTrack = parts.slice(1).join('-').trim();
  } else if (cleanTitle.includes('|')) {
    const parts = cleanTitle.split('|');
    finalTrack = parts[0].trim();
    finalArtist = parts.length > 1 ? parts[1].trim() : rawArtist;
  }
  return { artist: finalArtist, track: finalTrack };
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
    // Treat the track text as potentially containing both artist and track, falling back to 'artist'
    const { artist: finalArtist, track: finalTrack } = extractArtistAndTitle(artist || '', track || '');
    const cleanArtist = finalArtist || '';
    const cleanTrack = finalTrack || '';

    set({ isLoading: true, error: null, lyrics: [], plainLyrics: null, currentLineIndex: -1 });

    const tryGetLyrics = async (a: string, t: string): Promise<{ syncedLyrics?: string; plainLyrics?: string } | null> => {
      const getUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(a)}&track_name=${encodeURIComponent(t)}&album_name=`;
      const res = await fetch(getUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics || data.plainLyrics) return data;
      }
      // Fallback to search
      const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${a} ${t}`)}`);
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (Array.isArray(results) && results.length > 0) return results[0];
      }
      return null;
    };

    try {
      let data: { syncedLyrics?: string; plainLyrics?: string } | null = null;

      // Attempt 1: clean artist + clean track
      data = await tryGetLyrics(cleanArtist, cleanTrack);

      // Attempt 2: original artist + clean track (if channel name was different)
      if (!data) {
        data = await tryGetLyrics(cleanMetadata(artist), cleanTrack);
      }

      // Attempt 3: search track-only (no artist constraint)
      if (!data) {
        const trackOnlyRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanTrack)}`);
        if (trackOnlyRes.ok) {
          const results = await trackOnlyRes.json();
          if (Array.isArray(results) && results.length > 0) data = results[0];
        }
      }

      if (data) {
        if (data.syncedLyrics) {
          set({ lyrics: parseLRC(data.syncedLyrics), plainLyrics: data.plainLyrics || null, isLoading: false });
        } else if (data.plainLyrics) {
          set({ plainLyrics: data.plainLyrics, lyrics: [], isLoading: false });
        } else {
          set({ error: 'Lyrics not found.', isLoading: false });
        }
      } else {
        set({ error: 'Lyrics not found.', isLoading: false });
      }
    } catch {
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
