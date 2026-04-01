'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Loader2, Play, Plus, SkipForward, ListMusic, X, Music } from 'lucide-react';
import { usePlayerStore, Song } from '@/store/usePlayerStore';
import { usePlaylistStore, Playlist } from '@/store/usePlaylistStore';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [addToPlaylistSong, setAddToPlaylistSong] = useState<Song | null>(null);

  const { setCurrentSong, addToQueue, playNext } = usePlayerStore();
  const { playlists, addSongToPlaylist, createPlaylist } = usePlaylistStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 280);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    fetchSuggestions(val);
  };

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setShowSuggestions(false);
    setIsLoading(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSearch(query); };

  const clearSearch = () => { setQuery(''); setSuggestions([]); setShowResults(false); setResults([]); };

  const handlePlayNow = (song: Song) => {
    setCurrentSong(song);
    // Removed clearSearch() to keep results visible as requested
  };

  return (
    <div ref={wrapperRef} className={styles.searchContainer}>
      {/* Search Input */}
      <div>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.searchIcon}>
            {isLoading ? <Loader2 size={16} className={styles.loaderIcon} /> : <Search size={16} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            placeholder="Tìm bài hát, nghệ sĩ hoặc YouTube..."
            className={styles.searchInput}
          />
          {query && (
            <button type="button" onClick={clearSearch} className={styles.clearBtn}>
              <X size={15} />
            </button>
          )}
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className={styles.suggestionsDropdown}>
            {suggestions.map((s, i) => (
              <button key={i} onMouseDown={() => doSearch(s)} className={styles.suggestionItem}>
                <Search size={12} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {showResults && (
        <div className={styles.resultsArea}>
          {isLoading ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={styles.skeletonThumb} />
                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonLine1} />
                    <div className={styles.skeletonLine2} />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className={styles.emptyResults}>
              <Music size={30} className={styles.emptyIcon} />
              <p>Không tìm thấy kết quả</p>
            </div>
          ) : (
            <div className={`custom-scrollbar ${styles.resultsGrid}`}>
              {results.map((song) => (
                <SearchResultCard
                  key={song.id}
                  song={song}
                  onPlayNow={() => handlePlayNow(song)}
                  onAddToQueue={() => addToQueue(song)}
                  onPlayNext={() => playNext(song)}
                  onAddToPlaylist={() => setAddToPlaylistSong(song)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add to Playlist Modal */}
      {addToPlaylistSong && (
        <AddToPlaylistModal
          song={addToPlaylistSong}
          playlists={playlists}
          onAdd={(pid) => { addSongToPlaylist(pid, addToPlaylistSong); setAddToPlaylistSong(null); }}
          onCreateAndAdd={(name) => {
            const pid = createPlaylist(name);
            addSongToPlaylist(pid, addToPlaylistSong);
            setAddToPlaylistSong(null);
          }}
          onClose={() => setAddToPlaylistSong(null)}
        />
      )}
    </div>
  );
}

// ─── Search Result Card ───────────────────────────────────────────────────────
function SearchResultCard({ song, onPlayNow, onAddToQueue, onPlayNext, onAddToPlaylist }: {
  song: Song;
  onPlayNow: () => void;
  onAddToQueue: () => void;
  onPlayNext: () => void;
  onAddToPlaylist: () => void;
}) {
  return (
    <div className={styles.resultCard}>
      <div onClick={onPlayNow} className={styles.resultThumb}>
        <img src={song.thumbnail || song.cover} alt={song.title} />
        <div className={styles.resultThumbOverlay}>
          <div className={styles.playCircle}>
            <Play size={16} fill="black" />
          </div>
        </div>
      </div>

      <div className={styles.resultInfo}>
        <p className={styles.resultTitle}>{song.title}</p>
        <p className={styles.resultArtist}>{song.artist}{song.duration ? ` · ${song.duration}` : ''}</p>
        <div className={styles.resultActions}>
          <ActionBtn onClick={onAddToQueue} icon={<Plus size={11} />} label="Queue" />
          <ActionBtn onClick={onPlayNext} icon={<SkipForward size={11} />} label="Tiếp" />
          <ActionBtn onClick={onAddToPlaylist} icon={<ListMusic size={11} />} label="Playlist" />
        </div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={styles.actionBtn}>
      {icon}<span>{label}</span>
    </button>
  );
}

// ─── Add To Playlist Modal ────────────────────────────────────────────────────
// Using inline styles/generic structures for modal to avoid complex CSS files for simple components
function AddToPlaylistModal({ song, playlists, onAdd, onCreateAndAdd, onClose }: {
  song: Song; playlists: Playlist[]; onAdd: (id: string) => void; onCreateAndAdd: (name: string) => void; onClose: () => void;
}) {
  const [newName, setNewName] = useState('');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '384px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', background: 'rgba(10,10,15,0.98)', zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>Thêm vào Playlist</h3>
          <button onClick={onClose} style={{ color: '#71717a', padding: '4px' }}><X size={16} /></button>
        </div>
        <p style={{ fontSize: '12px', color: '#71717a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{song.title}</p>

        {playlists.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px', maxHeight: '192px', overflowY: 'auto' }}>
            {playlists.map((pl) => (
              <button key={pl.id} onClick={() => onAdd(pl.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#d4d4d8', fontSize: '14px', textAlign: 'left', border: '1px solid transparent' }}>
                <ListMusic size={13} style={{ flexShrink: 0, color: 'white' }} />
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.name}</span>
                <span style={{ fontSize: '12px', color: '#71717a' }}>{pl.songs.length} bài</span>
              </button>
            ))}
          </div>
        )}
        {playlists.length === 0 && <p style={{ fontSize: '12px', color: '#71717a', textAlign: 'center', padding: '12px 0', marginBottom: '12px' }}>Chưa có playlist nào</p>}

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Tạo playlist mới..."
            style={{ flex: 1, padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', color: 'white' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) onCreateAndAdd(newName.trim()); }}
          />
          <button
            onClick={() => { if (newName.trim()) onCreateAndAdd(newName.trim()); }}
            disabled={!newName.trim()}
            style={{ padding: '8px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '14px', fontWeight: 500, opacity: !newName.trim() ? 0.4 : 1 }}>
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}
