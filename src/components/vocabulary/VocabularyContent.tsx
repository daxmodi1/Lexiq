'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import MasteryBadge from '@/components/word/MasteryBadge';
import { getDifficultyColor } from '@/lib/types';
import type { Word } from '@/lib/types';

interface VocabularyItem {
  id: string;
  mastery_score: number;
  date_added: string;
  in_review_queue: boolean;
  words: Word;
}

interface VocabularyContentProps {
  initialWords: VocabularyItem[];
}

type SortField = 'date_added' | 'mastery' | 'alphabetical';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced' | 'rare';

export default function VocabularyContent({ initialWords }: VocabularyContentProps) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date_added');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredWords = useMemo(() => {
    let result = [...initialWords];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        item.words?.word?.toLowerCase().includes(q) ||
        item.words?.definition?.toLowerCase().includes(q)
      );
    }

    // Filter by difficulty
    if (difficulty !== 'all') {
      result = result.filter((item) => item.words?.difficulty === difficulty);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'mastery':
          comparison = a.mastery_score - b.mastery_score;
          break;
        case 'alphabetical':
          comparison = (a.words?.word || '').localeCompare(b.words?.word || '');
          break;
        case 'date_added':
        default:
          comparison = new Date(a.date_added).getTime() - new Date(b.date_added).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [initialWords, search, sortBy, difficulty, sortOrder]);

  const handleRemoveWord = async (wordId: string) => {
    try {
      await fetch(`/api/words/add?word_id=${wordId}`, { method: 'DELETE' });
      window.location.reload();
    } catch (err) {
      console.error('Failed to remove word:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-sm text-on-surface mb-2">
          My Words <span className="text-on-surface-variant">({initialWords.length})</span>
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Your personal curated sanctuary of language. Master these expressions through consistent review.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 w-full lg:max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter words..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-lowest rounded-xl text-body-md text-on-surface placeholder:text-outline transition-all focus:shadow-glow-sm"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'beginner', 'intermediate', 'advanced', 'rare'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-full text-body-sm capitalize transition-all ${
                difficulty === d
                  ? 'bg-primary/15 text-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-high'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="bg-surface-container text-on-surface-variant rounded-xl px-3 py-2 text-body-sm border-0 focus:shadow-glow-sm"
          >
            <option value="date_added">Date Added</option>
            <option value="mastery">Mastery Score</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-9 h-9 flex items-center justify-center bg-surface-container rounded-xl text-on-surface-variant hover:bg-surface-high transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
          </button>
        </div>
      </div>

      {/* Words List */}
      {filteredWords.length > 0 ? (
        <div className="space-y-2">
          {filteredWords.map((item, index) => (
            <div
              key={item.id}
              className="bg-surface-low rounded-xl p-4 lg:p-5 flex items-center gap-4 hover:bg-surface-container transition-colors group"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {/* Word */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <Link
                    href={`/search?q=${encodeURIComponent(item.words?.word || '')}`}
                    className="text-title-lg text-on-surface font-serif italic hover:text-primary transition-colors"
                  >
                    {item.words?.word}
                  </Link>
                  {item.words?.part_of_speech && (
                    <span className="text-label-sm text-on-surface-variant normal-case">{item.words.part_of_speech}</span>
                  )}
                  {item.in_review_queue && (
                    <span className="px-2 py-0.5 bg-amber-400/10 text-amber-400 rounded-full text-[10px] font-medium">
                      REVIEW
                    </span>
                  )}
                </div>
                <p className="text-body-sm text-on-surface-variant truncate max-w-lg">
                  {item.words?.definition}
                </p>
              </div>

              {/* Difficulty */}
              <span className={`hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${getDifficultyColor(item.words?.difficulty || 'intermediate')}`}>
                {item.words?.difficulty}
              </span>

              {/* Mastery */}
              <MasteryBadge score={item.mastery_score} size="sm" />

              {/* Date */}
              <span className="hidden lg:block text-body-sm text-outline w-24 text-right">
                {new Date(item.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>

              {/* Actions */}
              <button
                onClick={() => handleRemoveWord(item.words?.id)}
                className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-error/10 hover:text-error transition-all"
                title="Remove from vocabulary"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-low rounded-2xl">
          <span className="material-symbols-outlined text-outline text-5xl mb-4 block">menu_book</span>
          {initialWords.length === 0 ? (
            <>
              <h3 className="text-headline-sm text-on-surface mb-2">Your lexicon awaits</h3>
              <p className="text-body-lg text-on-surface-variant mb-6">
                Start exploring words to build your personal vocabulary
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Explore words
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-headline-sm text-on-surface mb-2">No matches found</h3>
              <p className="text-body-lg text-on-surface-variant">
                Try adjusting your filters or search term
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
