'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface FillBlankQuestion {
  word_id: string;
  word: string;
  definition: string;
  sentence: string;
  hint: string;
  mastery_score: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FillBlankContent({ userWords }: { userWords: any[] }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'answered' | 'complete'>('idle');
  const [questions, setQuestions] = useState<FillBlankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Array<{ word: string; correct: boolean; userAnswer: string }>>([]);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch('/api/quiz/fill-blank');
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setState('playing');
      } else {
        setState('idle');
      }
    } catch {
      setState('idle');
    }
  }, []);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || !questions[currentIndex]) return;
    
    const correct = userAnswer.trim().toLowerCase() === questions[currentIndex].word.toLowerCase();
    setIsCorrect(correct);
    setState('answered');
    if (correct) setScore((s) => s + 1);
    setResults((prev) => [...prev, {
      word: questions[currentIndex].word,
      correct,
      userAnswer: userAnswer.trim(),
    }]);
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= questions.length) {
      // Submit all results
      setSubmitting(true);
      try {
        await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_type: 'definition_match',
            results: results.map((r) => ({
              word_id: questions[results.indexOf(r)]?.word_id,
              is_correct: r.correct,
              user_answer: r.userAnswer,
            })),
          }),
        });
      } catch (e) {
        console.error(e);
      }
      setSubmitting(false);
      setState('complete');
    } else {
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
      setIsCorrect(null);
      setShowHint(false);
      setState('playing');
    }
  };

  // Not enough words
  if (userWords.length < 1) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-outline text-4xl">edit_note</span>
        </div>
        <h1 className="text-headline-lg text-on-surface mb-3">No words available</h1>
        <p className="text-body-lg text-on-surface-variant mb-6">Add words to your vocabulary to unlock fill-in-the-blank practice.</p>
        <Link href="/dashboard/search" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
          <span className="material-symbols-outlined text-[20px]">search</span>Explore words
        </Link>
      </div>
    );
  }

  // Idle
  if (state === 'idle') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-purple-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-purple-400 text-4xl">edit_note</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-3">Fill in the Blank</h1>
        <p className="text-body-lg text-on-surface-variant mb-2">AI generates unique sentences for your words.</p>
        <p className="text-body-md text-on-surface-variant mb-8">Type the missing word to complete each sentence.</p>
        <button onClick={fetchQuestions} className="px-8 py-4 bg-purple-500 text-white rounded-xl text-title-lg hover:brightness-110 transition-all shadow-glow animate-glow-pulse">
          Generate Questions
        </button>
      </div>
    );
  }

  // Loading
  if (state === 'loading') {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="w-16 h-16 rounded-full border-3 border-purple-400 border-t-transparent animate-spin mx-auto mb-6" />
        <h2 className="text-headline-md text-on-surface mb-2">Crafting your questions...</h2>
        <p className="text-body-lg text-on-surface-variant">Our AI is writing unique sentences for your words</p>
      </div>
    );
  }

  // Complete
  if (state === 'complete') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-purple-400/15 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
          <span className="material-symbols-outlined text-purple-400 text-4xl">task_alt</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-2">Practice Complete!</h1>
        <p className="text-headline-md text-purple-400 mb-8">{score} / {questions.length} correct</p>

        <div className="bg-surface-low rounded-2xl p-6 mb-8 text-left space-y-3">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className={`material-symbols-outlined text-[20px] ${r.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {r.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className="text-title-md text-on-surface flex-1">{r.word}</span>
              {!r.correct && <span className="text-body-sm text-on-surface-variant">You typed: {r.userAnswer}</span>}
            </div>
          ))}
        </div>

        {submitting && <p className="text-body-sm text-on-surface-variant mb-4">Saving results...</p>}

        <div className="flex items-center justify-center gap-4">
          <button onClick={() => { setState('idle'); setCurrentIndex(0); setScore(0); setResults([]); setQuestions([]); setUserAnswer(''); setIsCorrect(null); }}
            className="px-6 py-3 bg-surface-high text-on-surface rounded-xl text-title-sm hover:bg-surface-highest transition-colors">
            Try Again
          </button>
          <Link href="/dashboard" className="px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">Dashboard</Link>
        </div>
      </div>
    );
  }

  // Playing / Answered
  const q = questions[currentIndex];
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-label-md text-on-surface-variant normal-case">Question {currentIndex + 1} of {questions.length}</span>
        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full bg-purple-400 rounded-full transition-all duration-500" style={{ width: `${((currentIndex + (state === 'answered' ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
        <span className="text-title-sm text-purple-400">{score} pts</span>
      </div>

      {/* Sentence */}
      <div className="bg-surface-low rounded-2xl p-8 lg:p-10 mb-6">
        <p className="text-label-md text-on-surface-variant mb-4 normal-case">Complete the sentence</p>
        <p className="text-headline-md text-on-surface leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
          {q.sentence.split('[____]').map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block mx-1 px-3 py-1 bg-purple-400/15 rounded-lg text-purple-400 font-sans text-title-md min-w-[80px] text-center">
                  {state === 'answered' ? q.word : '____'}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Answer Input */}
      {state === 'playing' && (
        <div className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }}>
            <div className="flex gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type the missing word..."
                className="flex-1 px-5 py-4 bg-surface-low rounded-xl text-headline-sm text-on-surface placeholder:text-outline focus:shadow-glow-sm"
                autoFocus
                autoComplete="off"
              />
              <button type="submit" disabled={!userAnswer.trim()} className="px-6 py-4 bg-purple-500 text-white rounded-xl text-title-sm hover:brightness-110 transition-all disabled:opacity-50">
                Submit
              </button>
            </div>
          </form>

          {/* Hint */}
          <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[16px]">lightbulb</span>
            {showHint ? q.hint : 'Show hint'}
          </button>
        </div>
      )}

      {/* Feedback */}
      {state === 'answered' && (
        <div className="space-y-4 animate-slide-up">
          <div className={`flex items-center gap-3 p-5 rounded-xl ${isCorrect ? 'bg-emerald-400/15' : 'bg-rose-400/15'}`}>
            <span className={`material-symbols-outlined text-2xl ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isCorrect ? 'check_circle' : 'cancel'}
            </span>
            <div>
              <p className={`text-title-md ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isCorrect ? 'Correct!' : 'Not quite'}
              </p>
              {!isCorrect && (
                <p className="text-body-md text-on-surface-variant">
                  The answer was <strong className="text-on-surface font-bold">{q.word}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Definition reminder */}
          <div className="bg-surface-low rounded-xl p-4">
            <p className="text-body-sm text-on-surface-variant mb-1">Definition</p>
            <p className="text-body-lg text-on-surface">{q.definition}</p>
          </div>

          <div className="text-center">
            <button onClick={handleNext} className="px-8 py-3 bg-purple-500 text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
