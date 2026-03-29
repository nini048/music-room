'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Plus, Music } from 'lucide-react';
import { usePlayerStore, Song } from '@/store/usePlayerStore';
import styles from './SearchBar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { addToQueue } = usePlayerStore();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close results on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (song: Song) => {
    addToQueue(song);
    // Visual feedback could be added here
  };

  return (
    <div className={styles.searchWrapper} ref={wrapperRef}>
      <form onSubmit={handleSearch} className={styles.searchContainer}>
        <div className={styles.searchIcon}>
          {isLoading ? <Loader2 className={styles.loader} size={18} /> : <Search size={18} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm bài hát, nghệ sĩ hoặc dán link YouTube..."
          className={styles.input}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
        />
        <button type="submit" className="hidden" />
      </form>

      {showResults && (
        <div className={styles.resultsDropdown}>
          {results.length > 0 ? (
            results.map((song) => (
              <div key={song.id} className={styles.resultItem} onClick={() => addItem(song)}>
                <img src={song.thumbnail || song.cover} alt={song.title} className={styles.resultThumbnail} />
                <div className={styles.resultInfo}>
                  <p className={styles.resultTitle}>{song.title}</p>
                  <p className={styles.resultArtist}>{song.artist} {song.duration && `• ${song.duration}`}</p>
                </div>
                <Plus size={16} className="text-zinc-500 hover:text-primary transition-colors" />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 text-sm">
              {isLoading ? <p>Đang tìm kiếm...</p> : <p>Không tìm thấy kết quả</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
