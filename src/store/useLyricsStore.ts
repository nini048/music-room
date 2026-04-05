import { create } from 'zustand';
import type { Song } from './usePlayerStore';

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

  fetchLyrics: (song: Song) => Promise<void>;
  updateCurrentLine: (time: number) => void;
  clearLyrics: () => void;
}

// ─── Metadata cleaning ────────────────────────────────────────────────────────

const NOISE_TAGS = [
  '\\[vietsub\\]', '\\[engsub\\]', '\\[lyrics?\\]', '\\[official\\s*(?:video|audio|mv)?\\]',
  '\\[mv\\]', '\\[audio\\]', '\\[video\\]', '\\[hd\\]', '\\[4k\\]', '\\[live\\]',
  '\\(vietsub\\)', '\\(engsub\\)', '\\(lyrics?\\)', '\\(official.*?\\)',
  'vietsub', 'engsub', 'lyrics?\\s*video', 'lyric\\s*video',
  'official\\s*(?:video|audio|mv|music\\s*video)?',
  'color\\s*coded\\s*lyrics?',
  'official', 'audio', '(?:full\\s*)?mv', '4k', 'hd',
  'prod\\.?', 'feat\\.?', 'ft\\.?',
  'live\\s*(?:performance|session)?',
  'acoustic\\s*(?:version)?', 'instrumental', 'cover',
  'remix', 'version', 'ver\\.?',
].join('|');

const NOISE_RE = new RegExp(`(?:${NOISE_TAGS})`, 'gi');

const cleanMetadata = (s: string): string =>
  s
    .replace(/\[[^\]]{0,60}\]/g, ' ') // strip all [bracketed] tags
    .replace(/\([^)]{0,60}\)/g, ' ')  // strip all (parenthesized) tags
    .replace(NOISE_RE, ' ')
    .replace(/[@#]/g, '')
    .replace(/^\d+[.\-\s]+/, '') // leading track numbers
    .replace(/\s{2,}/g, ' ')
    .trim();

const stripParens = (s: string): string =>
  s.replace(/[\(\[].*?[\)\]]/g, ' ').replace(/\s+/g, ' ').trim();

const getCoreTitle = (s: string): string => {
  const parts = s.split(/\s+(?:ft\.?|feat\.?|x|&|with)\b/i);
  return cleanMetadata(parts[0]);
};

// Remove channel noise suffixes
const cleanChannel = (ch: string): string =>
  ch
    .replace(/\s*(VEVO|Official|Topic|Music|Channel|Records?|Entertainment|Production)\s*/gi, '')
    .trim();

// ─── LRC parser ──────────────────────────────────────────────────────────────

const parseLRC = (lrc: string): LyricLine[] => {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split('\n')) {
    const stripped = raw.replace(/\[\d{1,3}:\d{2}\.\d{2,3}\]/g, '').trim();
    if (!stripped) continue;
    const re = /\[(\d{1,3}):(\d{2})\.(\d{2,3})\]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
      const time =
        parseInt(m[1]) * 60 +
        parseInt(m[2]) +
        parseInt(m[3].padEnd(3, '0')) / 1000;
      lines.push({ time, text: stripped });
    }
  }
  lines.sort((a, b) => a.time - b.time);
  return lines;
};

// ─── Search helpers ───────────────────────────────────────────────────────────

type Candidate = { a?: string; t?: string; q?: string };

async function searchLrclib(
  artist: string,
  track: string,
  q?: string,
  signal?: AbortSignal
): Promise<any[] | null> {
  try {
    const url = q
      ? `https://lrclib.net/api/search?q=${encodeURIComponent(q)}`
      : `https://lrclib.net/api/search?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const arr = await res.json();
    return Array.isArray(arr) && arr.length > 0 ? arr : null;
  } catch {
    return null;
  }
}

function pickBest(arr: any[]): { synced: LyricLine[] | null; plain: string | null } {
  const item = arr.find((x) => x.syncedLyrics) || arr.find((x) => x.plainLyrics);
  if (!item) return { synced: null, plain: null };
  return {
    synced: item.syncedLyrics ? parseLRC(item.syncedLyrics) : null,
    plain: item.plainLyrics || null,
  };
}

// ─── Waterfall search ─────────────────────────────────────────────────────────
// Tries candidates in priority order; stops as soon as synced lyrics found.
// Falls back to best plain lyrics if no synced found.

async function fetchLyricsWaterfall(
  candidates: Candidate[],
  signal?: AbortSignal
): Promise<{ synced: LyricLine[] | null; plain: string | null; found: boolean }> {
  let bestPlain: string | null = null;

  for (const cand of candidates) {
    if (signal?.aborted) break;
    const arr = await searchLrclib(cand.a || '', cand.t || '', cand.q, signal);
    if (!arr) continue;
    const best = pickBest(arr);
    if (best.synced && best.synced.length > 0) {
      return { synced: best.synced, plain: best.plain, found: true };
    }
    if (best.plain && !bestPlain) {
      bestPlain = best.plain;
    }
  }

  if (bestPlain) {
    return { synced: null, plain: bestPlain, found: true };
  }
  return { synced: null, plain: null, found: false };
}

// ─── Main fetch function ──────────────────────────────────────────────────────

async function fetchLyricsForSong(
  song: Song,
  signal?: AbortSignal
): Promise<{ synced: LyricLine[] | null; plain: string | null; found: boolean }> {
  try {
    // 1. Raw title — strip leading section like "[Vietsub] ..." or "HOT TIK TOK |"
    const rawTitle = song.title.split('|')[0].split('·')[0];

    // 2. Produce multiple cleaned variants
    const aggressiveCleaned = cleanMetadata(rawTitle);
    const softCleaned = stripParens(rawTitle).trim();
    const coreCleaned = getCoreTitle(aggressiveCleaned);

    // 3. Dash-splits for "Artist - Title" patterns
    const splitAggressive = aggressiveCleaned.split(/\s+-\s+/).map(s => s.trim()).filter(Boolean);
    const splitSoft = softCleaned.split(/\s+-\s+/).map(s => s.trim()).filter(Boolean);

    // Artist candidates
    const artistField = song.artist ? cleanMetadata(song.artist) : '';
    const channelField = song.channel ? cleanChannel(song.channel) : '';

    const candidates: Candidate[] = [];

    // ── TIER 1: Exact artist+title (highest confidence) ──────────────────────
    if (artistField) {
      if (splitAggressive.length >= 2) {
        candidates.push({ a: artistField, t: splitAggressive[1] });
        candidates.push({ a: artistField, t: splitAggressive[splitAggressive.length - 1] });
      }
      candidates.push({ a: artistField, t: aggressiveCleaned });
      candidates.push({ a: artistField, t: coreCleaned });
    }

    // ── TIER 2: Dash-split both ways ─────────────────────────────────────────
    if (splitAggressive.length >= 2) {
      const p0 = splitAggressive[0];
      const p1 = splitAggressive[splitAggressive.length - 1];
      candidates.push({ a: p0, t: p1 });
      candidates.push({ a: p1, t: p0 });
      candidates.push({ a: getCoreTitle(p0), t: getCoreTitle(p1) });
    }
    if (splitSoft.length >= 2 && splitSoft.join('') !== splitAggressive.join('')) {
      const p0 = splitSoft[0];
      const p1 = splitSoft[splitSoft.length - 1];
      candidates.push({ a: p0, t: p1 });
      candidates.push({ a: p1, t: p0 });
    }

    // ── TIER 3: Channel as artist ─────────────────────────────────────────────
    if (channelField && channelField !== artistField) {
      if (splitAggressive.length >= 2) {
        candidates.push({ a: channelField, t: splitAggressive[1] });
      }
      candidates.push({ a: channelField, t: aggressiveCleaned });
    }

    // ── TIER 4: Free-text query fallbacks ────────────────────────────────────
    candidates.push({ q: aggressiveCleaned });
    candidates.push({ q: softCleaned });
    if (artistField && splitAggressive.length >= 2) {
      candidates.push({ q: `${artistField} ${splitAggressive[1]}` });
    }
    candidates.push({ q: coreCleaned });
    // Raw title stripped of only brackets
    const rawStripped = rawTitle.replace(/[\[\(].*?[\]\)]/g, '').trim();
    if (rawStripped !== softCleaned) candidates.push({ q: rawStripped });

    // ── Deduplicate ───────────────────────────────────────────────────────────
    const seen = new Set<string>();
    const unique = candidates.filter((c) => {
      const key = JSON.stringify(c);
      if (seen.has(key)) return false;
      seen.add(key);
      // Skip empty candidates
      if (!c.q && !c.t) return false;
      return true;
    });

    return await fetchLyricsWaterfall(unique, signal);
  } catch (err: any) {
    if (err.name === 'AbortError') throw err;
    return { synced: null, plain: null, found: false };
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useLyricsStore = create<LyricsState>((set, get) => ({
  lyrics: [],
  plainLyrics: null,
  isLoading: false,
  error: null,
  currentLineIndex: -1,

  fetchLyrics: async (song: Song) => {
    set({ isLoading: true, error: null, lyrics: [], plainLyrics: null, currentLineIndex: -1 });
    try {
      const { synced, plain, found } = await fetchLyricsForSong(song);
      if (!found) {
        set({ error: 'Lyrics not found.', isLoading: false });
      } else if (synced && synced.length > 0) {
        set({ lyrics: synced, plainLyrics: plain, isLoading: false });
      } else if (plain) {
        set({ lyrics: [], plainLyrics: plain, isLoading: false });
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
      if (time >= lyrics[i].time) index = i;
      else break;
    }
    if (index !== get().currentLineIndex) {
      set({ currentLineIndex: index });
    }
  },

  clearLyrics: () =>
    set({ lyrics: [], plainLyrics: null, error: null, isLoading: false, currentLineIndex: -1 }),
}));
