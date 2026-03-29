'use client';

import { useState, useMemo } from 'react';
import MasteryBadge from '@/components/word/MasteryBadge';
import type { Word } from '@/lib/types';
import Link from 'next/link';

interface QuizWord {
  id: string;
  mastery_score: number;
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
  const [results, setResults] = useState<Array<{ word: string; correct: boolean }>>([]);

  // Pick 3 quiz words - priority: review queue, low mastery, random
  const quizWords = useMemo(() => {
    if (userWords.length === 0) return [];
    const available = [...userWords].slice(0, 10);
    // Shuffle and take 3
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    return available.slice(0, Math.min(3, available.length));
  }, [userWords]);

  // Generate options for current question
  const currentQuestion = useMemo(() => {
    if (quizWords.length === 0 || currentIndex >= quizWords.length) return null;
    
    const correctWord = quizWords[currentIndex];
    const correctDef = correctWord.words?.definition || '';
    
    // Get distractor definitions from other words
    const distractors = userWords
      .filter((w) => w.id !== correctWord.id && w.words?.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((w) => w.words?.definition || '');

    // If not enough distractors, add generic ones
    while (distractors.length < 3) {
      distractors.push('A quality or characteristic of something');
    }

    // Shuffle options
    const options = [correctDef, ...distractors].sort(() => Math.random() - 0.5);

    return {
      word: correctWord.words?.word || '',
      correctDefinition: correctDef,
      options,
      mastery: correctWord.mastery_score,
    };
  }, [quizWords, currentIndex, userWords]);

  const handleAnswer = (answer: string) => {
    if (quizState === 'answered') return;
    
    setSelectedAnswer(answer);
    setQuizState('answered');
    
    const isCorrect = answer === currentQuestion?.correctDefinition;
    if (isCorrect) setScore((s) => s + 1);
    
    setResults((prev) => [
      ...prev,
      { word: currentQuestion?.word || '', correct: isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= quizWords.length) {
      setQuizState('complete');
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setQuizState('playing');
    }
  };

  // No words state
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
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          Explore words
        </Link>
      </div>
    );
  }

  // Complete state
  if (quizState === 'complete') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
          <span className="material-symbols-outlined text-primary text-4xl">emoji_events</span>
        </div>
        <h1 className="text-display-sm text-on-surface mb-2">Challenge Complete!</h1>
        <p className="text-headline-md text-primary mb-8">
          {score} / {quizWords.length} correct
        </p>

        <div className="bg-surface-low rounded-2xl p-6 mb-8 text-left space-y-3">
          {results.map((result, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <span className={`material-symbols-outlined text-[20px] ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.correct ? 'check_circle' : 'cancel'}
              </span>
              <span className="text-title-md text-on-surface font-serif italic">{result.word}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setQuizState('idle');
              setSelectedAnswer(null);
              setScore(0);
              setResults([]);
            }}
            className="px-6 py-3 bg-surface-high text-on-surface rounded-xl text-title-sm hover:bg-surface-highest transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
          >
            Back to Dashboard
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
          Match each word to its correct definition
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

  // Playing / Answered state
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Progress */}
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

      {/* Question */}
      {currentQuestion && (
        <div className="bg-surface-low rounded-2xl p-8 lg:p-12 mb-6">
          <p className="text-label-md text-on-surface-variant mb-4 normal-case">What does this word mean?</p>
          <h2 className="text-display-md text-on-surface mb-2 italic" style={{ fontFamily: 'var(--font-serif)' }}>
            {currentQuestion.word}
          </h2>
          <MasteryBadge score={currentQuestion.mastery} size="sm" showScore={false} />
        </div>
      )}

      {/* Options */}
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

      {/* Next Button */}
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
