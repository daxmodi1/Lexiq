'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Word } from '@/lib/types';
import Link from 'next/link';

interface QuizWord {
  id: string;
  mastery_score: number;
  word_id?: string;
  words: Word;
}

interface DailyQuizContentProps {
  userWords: QuizWord[];
}

type QuizState = 'idle' | 'playing' | 'answered' | 'complete';

export default function DailyQuizContent({ userWords }: DailyQuizContentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Array<{ word: string; word_id: string; correct: boolean; user_answer: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [masteryUpdates, setMasteryUpdates] = useState<Array<{ word_id: string; old_score: number; new_score: number }>>([]);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const quizWords = useMemo(() => {
    if (userWords.length === 0) return [];
    const available = [...userWords].slice(0, 10);
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    return available.slice(0, Math.min(5, available.length));
  }, [userWords]);

  const fallbackDefinitions = [
    'To move or act with great speed and urgency, often recklessly',
    'A deep feeling of sadness or grief, often prolonged and reflective',
    'Extremely small or insignificant in size, amount, or degree',
    'To speak or write about someone or something with great enthusiasm and praise',
    'Showing a willingness to take surprisingly bold risks; audaciously daring',
    'The state of being pleasantly lost in one\'s thoughts; a daydream',
    'Lasting only for a very short time; transient and fleeting',
    'Characterized by a calm, peaceful, and untroubled disposition',
    'To weaken or damage something, especially gradually or insidiously',
    'An intense and passionate feeling of deep affection or devotion',
    'The ability to understand and share the feelings of another person',
    'Something that is complicated, detailed, and hard to understand',
  ];

  const currentQuestion = useMemo(() => {
    if (quizWords.length === 0 || currentIndex >= quizWords.length) return null;

    const correctWord = quizWords[currentIndex];
    const correctDef = correctWord.words?.definition || '';

    const distractors = userWords
      .filter((w) => w.id !== correctWord.id && w.words?.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.words?.definition || '');

    const shuffledFallbacks = [...fallbackDefinitions].sort(() => Math.random() - 0.5);
    let fallbackIdx = 0;
    while (distractors.length < 3 && fallbackIdx < shuffledFallbacks.length) {
      const candidate = shuffledFallbacks[fallbackIdx];
      if (candidate !== correctDef && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      fallbackIdx++;
    }

    const options = [correctDef, ...distractors].sort(() => Math.random() - 0.5);

    return {
      word: correctWord.words?.word || '',
      word_id: correctWord.words?.id || '',
      correctDefinition: correctDef,
      options,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizWords, currentIndex]);

  const submitResults = useCallback(async (finalResults: typeof results) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_type: 'definition_match',
          results: finalResults.map((r) => ({
            word_id: r.word_id,
            is_correct: r.correct,
            user_answer: r.user_answer,
          })),
        }),
      });
      const data = await res.json();
      if (data.masteryUpdates) setMasteryUpdates(data.masteryUpdates);
      if (data.newAchievements) setNewAchievements(data.newAchievements);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleAnswer = (answer: string) => {
    if (quizState === 'answered') return;
    setSelectedAnswer(answer);
    setQuizState('answered');
    const isCorrect = answer === currentQuestion?.correctDefinition;
    if (isCorrect) setScore((s) => s + 1);
    setResults((prev) => [
      ...prev,
      { word: currentQuestion?.word || '', word_id: currentQuestion?.word_id || '', correct: isCorrect, user_answer: answer },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= quizWords.length) {
      const finalResults = [
        ...results,
      ];
      setQuizState('complete');
      submitResults(finalResults);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setQuizState('playing');
    }
  };

  // Empty state
  if (userWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-outline text-4xl">quiz</span>
        </div>
        <h1 className="text-headline-lg text-on-surface mb-3">No words to quiz</h1>
        <p className="text-body-lg text-on-surface-variant mb-6">
          Add some words to your vocabulary first, then come back for your daily challenge.
        </p>
        <Link href="/dashboard/search" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
          <span className="material-symbols-outlined text-[20px]">search</span>
          Explore words
        </Link>
      </div>
    );
  }

  // Complete state
  if (quizState === 'complete') {
    const BADGE_MAP: Record<string, string> = {
      first_word: '⭐ First Step', ten_words: '📚 Word Collector', fifty_words: '📖 Lexicon Builder',
      hundred_words: '🏆 Centurion', first_mastery: '🎯 First Mastery', ten_mastered: '🎖️ Expert',
      first_quiz: '📝 Quiz Taker', ten_quizzes: '🎓 Quiz Pro', streak_3: '🔥 On Fire',
      streak_7: '⚡ Weekly Warrior', streak_30: '💎 Monthly Master',
    };

    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
          <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-2">Challenge Complete!</h1>
        <p className="text-headline-md text-primary mb-8">
          {score} / {quizWords.length} correct
        </p>

        {/* Results */}
        <div className="bg-surface-low rounded-2xl p-6 mb-6 text-left space-y-3">
          {results.map((result, i) => {
            const update = masteryUpdates.find((u) => u.word_id === result.word_id);
            return (
              <div key={i} className="flex items-center gap-3 py-2">
                <span className={`material-symbols-outlined text-[20px] ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.correct ? 'check_circle' : 'cancel'}
                </span>
                <span className="text-title-md text-on-surface flex-1">{result.word}</span>
                {update && (
                  <span className={`text-body-sm font-medium ${update.new_score > update.old_score ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {update.old_score} → {update.new_score}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* New Achievements */}
        {newAchievements.length > 0 && (
          <div className="bg-amber-400/10 rounded-2xl p-6 mb-6 animate-slide-up">
            <h3 className="text-title-md text-amber-400 mb-3">🎉 New Achievements Unlocked!</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {newAchievements.map((badge) => (
                <span key={badge} className="px-4 py-2 bg-amber-400/15 text-amber-300 rounded-full text-body-sm font-medium">
                  {BADGE_MAP[badge] || badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {submitting && (
          <p className="text-body-sm text-on-surface-variant mb-4">Saving results...</p>
        )}

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-surface-high text-on-surface rounded-xl text-title-sm hover:bg-surface-highest transition-colors"
          >
            Try again
          </button>
          <Link href="/dashboard/quiz/timed" className="px-6 py-3 bg-amber-500/15 text-amber-400 rounded-xl text-title-sm hover:bg-amber-500/20 transition-colors">
            ⏱ Timed Challenge
          </Link>
          <Link href="/dashboard" className="px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm">
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Idle state
  if (quizState === 'idle') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-amber-400 text-4xl">workspace_premium</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-3">Daily Challenge</h1>
        <p className="text-body-lg text-on-surface-variant mb-2">
          Test your knowledge with {quizWords.length} questions from your vocabulary
        </p>
        <p className="text-body-md text-on-surface-variant mb-8">
          Correct answers boost mastery, wrong answers decrease it
        </p>
        <button
          onClick={() => setQuizState('playing')}
          className="px-8 py-4 bg-primary-container text-white rounded-xl text-title-lg hover:brightness-110 transition-all shadow-glow animate-glow-pulse"
        >
          Begin Challenge
        </button>
      </div>
    );
  }

  // Playing / Answered
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-label-md text-on-surface-variant normal-case">
          Question {currentIndex + 1} of {quizWords.length}
        </span>
        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + (quizState === 'answered' ? 1 : 0)) / quizWords.length) * 100}%` }}
          />
        </div>
        <span className="text-title-sm text-primary">{score} pts</span>
      </div>

      {currentQuestion && (
        <div className="bg-surface-low rounded-2xl p-8 lg:p-12 mb-6">
          <p className="text-label-md text-on-surface-variant mb-4 normal-case">What does this word mean?</p>
          <h2 className="text-display-md text-on-surface">
            {currentQuestion.word}
          </h2>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {currentQuestion?.options.map((option, i) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = option === currentQuestion.correctDefinition;
          const showResult = quizState === 'answered';

          let optionClass = 'bg-surface-low hover:bg-surface-container';
          if (showResult && isCorrect) {
            optionClass = 'bg-emerald-400/15 border-emerald-400/30';
          } else if (showResult && isSelected && !isCorrect) {
            optionClass = 'bg-rose-400/15 border-rose-400/30';
          } else if (isSelected) {
            optionClass = 'bg-primary/15 border-primary/30';
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(option)}
              disabled={quizState === 'answered'}
              className={`w-full text-left p-5 rounded-xl border border-transparent transition-all ${optionClass} disabled:cursor-default`}
            >
              <div className="flex items-start gap-3">
                <span className="text-label-lg text-on-surface-variant mt-0.5 w-6">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="text-body-lg text-on-surface flex-1">{option}</span>
                {showResult && isCorrect && (
                  <span className="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
                )}
                {showResult && isSelected && !isCorrect && (
                  <span className="material-symbols-outlined text-rose-400 text-[20px]">cancel</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {quizState === 'answered' && (
        <div className="text-center animate-slide-up">
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
          >
            {currentIndex + 1 >= quizWords.length ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
