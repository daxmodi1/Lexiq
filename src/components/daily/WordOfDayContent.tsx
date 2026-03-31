'use client';

import { useState } from 'react';
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function WordOfDayContent({ dailyWord, userAnswer }: { dailyWord: any; userAnswer: any }) {
  const [answered, setAnswered] = useState(!!userAnswer);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  if (!dailyWord) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-amber-400 text-4xl">today</span>
        </div>
        <h1 className="text-headline-lg text-on-surface mb-3">No Word of the Day yet</h1>
        <p className="text-body-lg text-on-surface-variant mb-6">
          Add some words via search first. The Word of the Day is selected from the global word pool.
        </p>
        <Link href="/dashboard/search" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
          <span className="material-symbols-outlined text-[20px]">search</span>Explore words
        </Link>
      </div>
    );
  }

  const word = dailyWord.words;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleAddToVocab = async () => {
    setAdding(true);
    try {
      const res = await fetch('/api/words/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word_id: word.id }),
      });
      if (res.ok) setAdded(true);
    } catch (e) {
      console.error(e);
    }
    setAdding(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-label-lg text-amber-400 mb-2 normal-case flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">today</span>
          {today}
        </p>
        <h1 className="text-display-sm text-on-surface">Word of the Day</h1>
      </div>

      {/* Word Card */}
      <div className="bg-surface-low rounded-3xl p-8 lg:p-12 mb-6">
        {/* Word */}
        <div className="text-center mb-8">
          <h2 className="text-display-lg text-on-surface mb-3 italic" style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem' }}>
            {word?.word}
          </h2>
          {word?.phonetic && (
            <p className="text-body-lg text-on-surface-variant mb-2">{word.phonetic}</p>
          )}
          {word?.part_of_speech && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-label-sm capitalize">
              {word.part_of_speech}
            </span>
          )}
        </div>

        {/* Definition */}
        <div className="mb-6">
          <h3 className="text-label-lg text-on-surface-variant mb-2 normal-case">Definition</h3>
          <p className="text-headline-sm text-on-surface leading-relaxed">{word?.definition}</p>
        </div>

        {/* Examples */}
        {word?.examples && word.examples.length > 0 && (
          <div className="mb-6">
            <h3 className="text-label-lg text-on-surface-variant mb-2 normal-case">Examples</h3>
            <ul className="space-y-2">
              {word.examples.map((ex: string, i: number) => (
                <li key={i} className="text-body-lg text-on-surface-variant italic pl-4 border-l-2 border-primary/30">
                  &ldquo;{ex}&rdquo;
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Etymology */}
        {word?.etymology && (
          <div className="mb-6">
            <h3 className="text-label-lg text-on-surface-variant mb-2 normal-case">Etymology</h3>
            <p className="text-body-lg text-on-surface-variant">{word.etymology}</p>
          </div>
        )}

        {/* Synonyms / Antonyms */}
        <div className="grid grid-cols-2 gap-4">
          {word?.synonyms && word.synonyms.length > 0 && (
            <div>
              <h3 className="text-label-lg text-on-surface-variant mb-2 normal-case">Synonyms</h3>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((s: string, i: number) => (
                  <Link key={i} href={`/dashboard/search?q=${encodeURIComponent(s)}`} className="px-3 py-1 bg-emerald-400/10 text-emerald-400 rounded-full text-body-sm hover:bg-emerald-400/20 transition-colors">
                    {s}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {word?.antonyms && word.antonyms.length > 0 && (
            <div>
              <h3 className="text-label-lg text-on-surface-variant mb-2 normal-case">Antonyms</h3>
              <div className="flex flex-wrap gap-2">
                {word.antonyms.map((a: string, i: number) => (
                  <Link key={i} href={`/dashboard/search?q=${encodeURIComponent(a)}`} className="px-3 py-1 bg-rose-400/10 text-rose-400 rounded-full text-body-sm hover:bg-rose-400/20 transition-colors">
                    {a}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        {!added ? (
          <button
            onClick={handleAddToVocab}
            disabled={adding || added}
            className="flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">{adding ? 'hourglass_top' : 'add'}</span>
            {adding ? 'Adding...' : 'Add to Vocabulary'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-6 py-3 bg-emerald-400/15 text-emerald-400 rounded-xl text-title-sm">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Added to vocabulary!
          </div>
        )}
        <Link href="/dashboard/quiz/daily" className="flex items-center gap-2 px-6 py-3 bg-surface-high text-on-surface rounded-xl text-title-sm hover:bg-surface-highest transition-colors">
          <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
          Daily Quiz
        </Link>
      </div>

      {/* Already answered banner */}
      {answered && (
        <div className="mt-6 bg-surface-low rounded-xl p-4 text-center animate-fade-in">
          <p className="text-body-md text-on-surface-variant">
            You&apos;ve already interacted with today&apos;s word. Come back tomorrow for a new one!
          </p>
        </div>
      )}
    </div>
  );
}
