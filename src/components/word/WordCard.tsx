'use client';

import { type Word, getDifficultyColor } from '@/lib/types';
import MasteryBadge from './MasteryBadge';

interface WordCardProps {
  word: Word;
  masteryScore?: number;
  isInVocabulary?: boolean;
  onAddToVocabulary?: () => void;
  onRemoveFromVocabulary?: () => void;
  isAdding?: boolean;
}

export default function WordCard({
  word,
  masteryScore,
  isInVocabulary = false,
  onAddToVocabulary,
  onRemoveFromVocabulary,
  isAdding = false,
}: WordCardProps) {
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Hero Word Section */}
      <div className="relative bg-surface-low rounded-2xl p-8 lg:p-12 overflow-hidden">
        {/* Subtle glow behind word */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          {/* Word + Phonetic */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-display-lg text-on-surface mb-2">{word.word}</h1>
              <div className="flex items-center gap-3">
                {word.phonetic && (
                  <span className="text-label-md text-on-surface-variant tracking-widest normal-case">
                    {word.phonetic}
                  </span>
                )}
                <button
                  onClick={handleSpeak}
                  className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-high transition-colors"
                  title="Listen to pronunciation"
                >
                  <span className="material-symbols-outlined text-primary text-[18px]">volume_up</span>
                </button>
              </div>
            </div>

            {/* Mastery + Difficulty */}
            <div className="flex flex-col items-end gap-2">
              {masteryScore !== undefined && <MasteryBadge score={masteryScore} size="lg" />}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(word.difficulty)}`}>
                {word.difficulty}
              </span>
            </div>
          </div>

          {/* Part of Speech */}
          {word.part_of_speech && (
            <span className="inline-block text-label-sm text-primary/70 mb-6 normal-case tracking-wider">
              {word.part_of_speech}
            </span>
          )}

          {/* Definition */}
          <div className="mb-8">
            <p className="text-headline-sm text-on-surface/90 italic leading-relaxed" style={{ fontFamily: 'var(--font-serif)' }}>
              &ldquo;{word.definition}&rdquo;
            </p>
          </div>

          {/* Add / Remove Button */}
          <div className="flex gap-3">
            {!isInVocabulary ? (
              <button
                onClick={onAddToVocabulary}
                disabled={isAdding}
                className="flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isAdding ? 'hourglass_empty' : 'add'}
                </span>
                {isAdding ? 'Adding...' : 'Add to My List'}
              </button>
            ) : (
              <button
                onClick={onRemoveFromVocabulary}
                className="flex items-center gap-2 px-6 py-3 bg-surface-high text-on-surface-variant rounded-xl text-title-sm hover:bg-error/20 hover:text-error transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">bookmark_added</span>
                In My List
              </button>
            )}
            <button
              onClick={handleSpeak}
              className="flex items-center gap-2 px-4 py-3 bg-surface-high text-on-surface-variant rounded-xl text-title-sm hover:bg-surface-highest transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">volume_up</span>
              Listen
            </button>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Examples */}
        {word.examples && word.examples.length > 0 && (
          <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[20px]">format_quote</span>
              <h3 className="text-title-md text-on-surface">Usage Examples</h3>
            </div>
            <div className="space-y-4">
              {word.examples.map((example, i) => (
                <blockquote key={i} className="pl-4 border-l-2 border-primary/20">
                  <p className="text-body-lg text-on-surface/80 italic" style={{ fontFamily: 'var(--font-serif)' }}>
                    &ldquo;{example}&rdquo;
                  </p>
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {/* Synonyms & Antonyms */}
        <div className="space-y-4">
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="bg-surface-low rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-emerald-400 text-[20px]">swap_horiz</span>
                <h3 className="text-title-md text-on-surface">Synonyms</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((syn, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-400/10 text-emerald-400 rounded-full text-body-sm">
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}
          {word.antonyms && word.antonyms.length > 0 && (
            <div className="bg-surface-low rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-rose-400 text-[20px]">compare_arrows</span>
                <h3 className="text-title-md text-on-surface">Antonyms</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {word.antonyms.map((ant, i) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-400/10 text-rose-400 rounded-full text-body-sm">
                    {ant}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Etymology */}
        {word.etymology && (
          <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">history_edu</span>
              <h3 className="text-title-md text-on-surface">Etymology</h3>
            </div>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">{word.etymology}</p>
          </div>
        )}

        {/* Mnemonic */}
        {word.mnemonic && (
          <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-purple-400 text-[20px]">lightbulb</span>
              <h3 className="text-title-md text-on-surface">Mnemonic</h3>
            </div>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">{word.mnemonic}</p>
          </div>
        )}

        {/* Word Family */}
        {word.word_family && word.word_family.length > 0 && (
          <div className="bg-surface-low rounded-2xl p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
              <h3 className="text-title-md text-on-surface">Word Family</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {word.word_family.map((fam, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-body-sm">
                  {fam}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
