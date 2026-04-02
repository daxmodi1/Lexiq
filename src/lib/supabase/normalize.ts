import type { Word } from '@/lib/types';

export function normalizeWord(value: unknown): Word {
  const relation = Array.isArray(value) ? value[0] : value;

  if (!relation || typeof relation !== 'object') {
    return {
      id: '',
      word: '',
      definition: '',
      synonyms: [],
      antonyms: [],
      word_family: [],
      difficulty: 'beginner',
      part_of_speech: null,
      phonetic: null,
      examples: [],
      created_at: '',
    };
  }

  const record = relation as Partial<Word>;

  return {
    id: record.id ?? '',
    word: record.word ?? '',
    definition: record.definition ?? '',
    synonyms: Array.isArray(record.synonyms) ? record.synonyms : [],
    antonyms: Array.isArray(record.antonyms) ? record.antonyms : [],
    word_family: Array.isArray(record.word_family) ? record.word_family : [],
    difficulty: record.difficulty ?? 'beginner',
    part_of_speech: record.part_of_speech ?? null,
    phonetic: record.phonetic ?? null,
    examples: Array.isArray(record.examples) ? record.examples : [],
    created_at: record.created_at ?? '',
  };
}
