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
    <div className={styles.wrapper} ref={wrapperRef}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm bài hát, nghệ sĩ..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchIconBtn}>
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </div>
      </form>

      {showResults && (
        <div className={`${styles.resultsDropdown} glass-heavy`}>
          {results.length > 0 ? (
            <div className={styles.resultsList}>
              {results.map((song) => (
                <div key={song.id} className={styles.resultItem} onClick={() => addItem(song)}>
                  <img src={song.thumbnail || song.cover} alt={song.title} className={styles.resultThumb} />
                  <div className={styles.resultInfo}>
                    <p className={styles.resultTitle}>{song.title}</p>
                    <p className={styles.resultArtist}>{song.artist} • {song.duration}</p>
                  </div>
                  <div className={styles.addIcon}>
                    <Plus size={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyResults}>
              {isLoading ? <p>Đang tìm kiếm...</p> : <p>Không tìm thấy kết quả</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
