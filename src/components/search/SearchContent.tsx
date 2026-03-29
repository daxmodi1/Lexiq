'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import WordCard from '@/components/word/WordCard';
import type { Word, UserWord } from '@/lib/types';

export default function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [word, setWord] = useState<Word | null>(null);
  const [userWord, setUserWord] = useState<UserWord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');

  const searchWord = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setWord(null);
    setUserWord(null);

    try {
      const res = await fetch(`/api/words/lookup?word=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to look up word');

      setWord(data.word);
      setUserWord(data.userWord);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      searchWord(initialQuery);
    }
  }, [initialQuery, searchWord]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchWord(query);
  };

  const handleAddToVocabulary = async () => {
    if (!word) return;
    setIsAdding(true);

    try {
      const res = await fetch('/api/words/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: word.id }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setUserWord(data.userWord);
    } catch (err) {
      console.error('Failed to add word:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromVocabulary = async () => {
    if (!word) return;

    try {
      await fetch(`/api/words/add?word_id=${word.id}`, { method: 'DELETE' });
      setUserWord(null);
    } catch (err) {
      console.error('Failed to remove word:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Hero Search */}
      <div className="text-center mb-10">
        <h1 className="text-display-md text-on-surface mb-3">
          Explore the <span className="italic">lexicon</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant mb-8">
          Discover the depth, origin, and beauty of any word
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline text-[24px] transition-colors group-focus-within:text-primary">
              search
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type any word to begin..."
              className="w-full pl-14 pr-32 py-4 bg-surface-low rounded-2xl text-headline-sm text-on-surface placeholder:text-outline transition-all focus:shadow-glow font-serif"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all disabled:opacity-50"
            >
              {loading ? 'Looking up...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-surface-low rounded-2xl p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p className="text-body-lg text-on-surface-variant">
                Consulting the oracle for &ldquo;{query}&rdquo;...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-container/10 rounded-2xl p-6 text-center animate-fade-in">
          <span className="material-symbols-outlined text-error text-3xl mb-3 block">error</span>
          <p className="text-body-lg text-error">{error}</p>
        </div>
      )}

      {/* Word Card Result */}
      {word && !loading && (
        <WordCard
          word={word}
          masteryScore={userWord?.mastery_score}
          isInVocabulary={!!userWord}
          onAddToVocabulary={handleAddToVocabulary}
          onRemoveFromVocabulary={handleRemoveFromVocabulary}
          isAdding={isAdding}
        />
      )}

      {/* Empty State */}
      {!word && !loading && !error && !initialQuery && (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-outline text-4xl">auto_stories</span>
          </div>
          <p className="text-headline-sm text-on-surface-variant mb-2 italic" style={{ fontFamily: 'var(--font-serif)' }}>
            &ldquo;A word after a word after a word is power.&rdquo;
          </p>
          <p className="text-label-md text-outline">— Margaret Atwood</p>
        </div>
      )}
    </div>
  );
}
