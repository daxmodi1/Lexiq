'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Word } from '@/lib/types';
import Link from 'next/link';

interface QuizWord {
  id: string;
  mastery_score: number;
  words: Word;
}

interface TimedChallengeContentProps {
  userWords: QuizWord[];
  bestScore: number;
}

const TIMER_DURATION = 60;

const FALLBACK_DEFS = [
  'To move or act with great speed and urgency',
  'A deep feeling of sadness or grief, often prolonged',
  'Extremely small or insignificant in size or degree',
  'Showing a willingness to take surprisingly bold risks',
  'Lasting only for a very short time; transient and fleeting',
  'Characterized by a calm, peaceful disposition',
  'To weaken or damage something gradually',
  'An intense and passionate feeling of affection',
  'The ability to understand and share feelings of another',
  'Something complex, detailed, and hard to understand',
  'Bold and daring; displaying fearless courage',
  'A sudden, intense burst of light or energy',
];

export default function TimedChallengeContent({ userWords, bestScore }: TimedChallengeContentProps) {
  const [state, setState] = useState<'idle' | 'playing' | 'complete'>('idle');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [results, setResults] = useState<Array<{ word: string; word_id: string; correct: boolean; user_answer: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Shuffle all words for the timed challenge
  const allQuestions = useMemo(() => {
    const shuffled = [...userWords].sort(() => Math.random() - 0.5);
    return shuffled;
  }, [userWords]);

  const currentQuestion = useMemo(() => {
    if (currentIndex >= allQuestions.length) return null;
    const correct = allQuestions[currentIndex];
    const correctDef = correct.words?.definition || '';

    const distractors = userWords
      .filter((w) => w.id !== correct.id && w.words?.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.words?.definition || '');

    const shuffledFallbacks = [...FALLBACK_DEFS].sort(() => Math.random() - 0.5);
    let idx = 0;
    while (distractors.length < 3 && idx < shuffledFallbacks.length) {
      const c = shuffledFallbacks[idx];
      if (c !== correctDef && !distractors.includes(c)) distractors.push(c);
      idx++;
    }

    return {
      word: correct.words?.word || '',
      word_id: correct.words?.id || '',
      correctDefinition: correctDef,
      options: [correctDef, ...distractors].sort(() => Math.random() - 0.5),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, allQuestions]);

  // Timer effect
  useEffect(() => {
    if (state !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setState('complete');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  // Submit when complete
  useEffect(() => {
    if (state === 'complete' && results.length > 0 && !submitting) {
      submitResults();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const submitResults = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: 'timed',
          duration_seconds: TIMER_DURATION - timeLeft,
          results: results.map((r) => ({
            word_id: r.word_id,
            is_correct: r.correct,
            user_answer: r.user_answer,
          })),
        }),
      });
      await res.json();
      if (score > bestScore) setIsNewBest(true);
    } catch (e) {
      console.error('Submit failed:', e);
    } finally {
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, score, bestScore, timeLeft]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    const isCorrect = answer === currentQuestion.correctDefinition;

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreak((b) => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setResults((prev) => [
      ...prev,
      { word: currentQuestion.word, word_id: currentQuestion.word_id, correct: isCorrect, user_answer: answer },
    ]);

    // Immediately advance
    if (currentIndex + 1 >= allQuestions.length) {
      setState('complete');
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const timerPercent = (timeLeft / TIMER_DURATION) * 100;
  const timerColor = timeLeft > 30 ? 'bg-emerald-400' : timeLeft > 10 ? 'bg-amber-400' : 'bg-rose-400';

  // Minimum words required
  if (userWords.length < 2) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-outline text-4xl">timer</span>
        </div>
        <h1 className="text-headline-lg text-on-surface mb-3">Need more words</h1>
        <p className="text-body-lg text-on-surface-variant mb-6">
          Add at least 2 words to your vocabulary to start the timed challenge.
        </p>
        <Link href="/dashboard/search" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
          <span className="material-symbols-outlined text-[20px]">search</span>Explore words
        </Link>
      </div>
    );
  }

  // Complete
  if (state === 'complete') {
    const correctCount = results.filter((r) => r.correct).length;
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-amber-400/15 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
          <span className="material-symbols-outlined text-amber-400 text-4xl">timer</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-2">Time&apos;s Up!</h1>

        {isNewBest && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/15 rounded-full text-amber-400 text-title-sm mb-4 animate-slide-up">
            <span className="material-symbols-outlined text-[18px]">celebration</span>
            New Personal Best!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
          <div className="bg-surface-low rounded-2xl p-5">
            <p className="text-display-sm text-primary" style={{ fontSize: '2rem' }}>{correctCount}</p>
            <p className="text-label-md text-on-surface-variant normal-case">Correct</p>
          </div>
          <div className="bg-surface-low rounded-2xl p-5">
            <p className="text-display-sm text-amber-400" style={{ fontSize: '2rem' }}>{bestStreak}</p>
            <p className="text-label-md text-on-surface-variant normal-case">Best Streak</p>
          </div>
          <div className="bg-surface-low rounded-2xl p-5">
            <p className="text-display-sm text-on-surface" style={{ fontSize: '2rem' }}>{results.length}</p>
            <p className="text-label-md text-on-surface-variant normal-case">Attempted</p>
          </div>
        </div>

        {submitting && <p className="text-body-sm text-on-surface-variant mb-4">Saving results...</p>}

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-surface-high text-on-surface rounded-xl text-title-sm hover:bg-surface-highest transition-colors">
            Play Again
          </button>
          <Link href="/dashboard" className="px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Idle
  if (state === 'idle') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-rose-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-rose-400 text-4xl">timer</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-3">Timed Challenge</h1>
        <p className="text-body-lg text-on-surface-variant mb-2">
          60 seconds. As many words as you can.
        </p>
        <p className="text-body-md text-on-surface-variant mb-2">
          No second chances — each answer immediately advances.
        </p>
        {bestScore > 0 && (
          <p className="text-title-sm text-amber-400 mb-8">
            🏆 Personal best: {bestScore} correct
          </p>
        )}
        <button
          onClick={() => setState('playing')}
          className="px-8 py-4 bg-rose-500 text-white rounded-xl text-title-lg hover:brightness-110 transition-all shadow-glow animate-glow-pulse mt-4"
        >
          Start Timer
        </button>
      </div>
    );
  }

  // Playing
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Timer Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">timer</span>
            <span className={`text-title-lg font-mono ${timeLeft <= 10 ? 'text-rose-400' : 'text-on-surface'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex items-center gap-4">
            {streak >= 2 && (
              <span className="text-amber-400 text-title-sm animate-fade-in">🔥 {streak} streak</span>
            )}
            <span className="text-title-sm text-primary">{score} pts</span>
          </div>
        </div>
        <div className="h-2 bg-surface-container rounded-full overflow-hidden">
          <div
            className={`h-full ${timerColor} rounded-full transition-all duration-1000 ease-linear`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <>
          <div className="bg-surface-low rounded-2xl p-8 lg:p-10 mb-5">
            <p className="text-label-md text-on-surface-variant mb-3 normal-case">Define this word</p>
            <h2 className="text-display-md text-on-surface italic" style={{ fontFamily: 'var(--font-serif)' }}>
              {currentQuestion.word}
            </h2>
          </div>

          <div className="space-y-2">
            {currentQuestion.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(option)}
                className="w-full text-left p-4 bg-surface-low rounded-xl border border-transparent hover:bg-surface-container hover:border-primary/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-label-lg text-on-surface-variant mt-0.5 w-6">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <span className="text-body-lg text-on-surface flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
