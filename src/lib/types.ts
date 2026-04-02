export type Database = {
  public: {
    Tables: {
      words: {
        Row: {
          id: string;
          word: string;
          definition: string;
          synonyms: string[];
          antonyms: string[];
          word_family: string[];
          difficulty: 'beginner' | 'intermediate' | 'advanced' | 'rare';
          part_of_speech: string | null;
          phonetic: string | null;
          examples: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['words']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['words']['Insert']>;
      };
      user_words: {
        Row: {
          id: string;
          user_id: string;
          word_id: string;
          mastery_score: number;
          date_added: string;
          last_reviewed_at: string | null;
          in_review_queue: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: string;
          mastery_score?: number;
          date_added?: string;
          last_reviewed_at?: string;
          in_review_queue?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          word_id?: string;
          mastery_score?: number;
          date_added?: string;
          last_reviewed_at?: string;
          in_review_queue?: boolean;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['collections']['Insert']>;
      };
      collection_words: {
        Row: {
          id: string;
          collection_id: string;
          word_id: string;
          added_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          word_id: string;
          added_at?: string;
        };
        Update: Partial<Database['public']['Tables']['collection_words']['Insert']>;
      };
      quiz_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: 'daily_global' | 'daily_personal' | 'timed' | 'definition_match';
          score: number;
          duration_seconds: number | null;
          words_tested: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: 'daily_global' | 'daily_personal' | 'timed' | 'definition_match';
          score?: number;
          duration_seconds?: number;
          words_tested?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_sessions']['Insert']>;
      };
      quiz_answers: {
        Row: {
          id: string;
          session_id: string;
          word_id: string;
          user_answer: string | null;
          is_correct: boolean;
          time_taken_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          word_id: string;
          user_answer?: string;
          is_correct?: boolean;
          time_taken_ms?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_answers']['Insert']>;
      };
      daily_word: {
        Row: {
          id: string;
          word_id: string;
          date: string;
          options: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          word_id: string;
          date?: string;
          options?: unknown;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_word']['Insert']>;
      };
      daily_word_answers: {
        Row: {
          id: string;
          user_id: string;
          daily_word_id: string;
          user_answer: string | null;
          is_correct: boolean;
          answered_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_word_id: string;
          user_answer?: string;
          is_correct?: boolean;
          answered_at?: string;
        };
        Update: Partial<Database['public']['Tables']['daily_word_answers']['Insert']>;
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string | null;
          streak_count: number;
          streak_last_date: string | null;
          best_timed_score: number;
          auto_add_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          streak_count?: number;
          streak_last_date?: string;
          best_timed_score?: number;
          auto_add_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          streak_count?: number;
          streak_last_date?: string;
          best_timed_score?: number;
          auto_add_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_type: string;
          earned_at?: string;
        };
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
    };
  };
};

// Derived types for convenience
export type Word = Database['public']['Tables']['words']['Row'];
export type UserWord = Database['public']['Tables']['user_words']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type Collection = Database['public']['Tables']['collections']['Row'];
export type QuizSession = Database['public']['Tables']['quiz_sessions']['Row'];
export type QuizAnswer = Database['public']['Tables']['quiz_answers']['Row'];
export type DailyWord = Database['public']['Tables']['daily_word']['Row'];
export type Achievement = Database['public']['Tables']['achievements']['Row'];

// Extended types with relations
export type UserWordWithWord = UserWord & { words: Word };

// Mastery tiers
export type MasteryTier = 'Learning' | 'Familiar' | 'Practiced' | 'Proficient' | 'Mastered';

export function getMasteryTier(score: number): MasteryTier {
  if (score < 30) return 'Learning';
  if (score < 60) return 'Familiar';
  if (score < 80) return 'Practiced';
  if (score < 95) return 'Proficient';
  return 'Mastered';
}

export function getMasteryColor(tier: MasteryTier): string {
  switch (tier) {
    case 'Learning': return 'text-red-400 bg-red-400/15';
    case 'Familiar': return 'text-orange-400 bg-orange-400/15';
    case 'Practiced': return 'text-blue-400 bg-blue-400/15';
    case 'Proficient': return 'text-emerald-400 bg-emerald-400/15';
    case 'Mastered': return 'text-purple-400 bg-purple-400/15';
  }
}

export function getDifficultyColor(difficulty: Word['difficulty']): string {
  switch (difficulty) {
    case 'beginner': return 'text-emerald-400 bg-emerald-400/15';
    case 'intermediate': return 'text-amber-400 bg-amber-400/15';
    case 'advanced': return 'text-rose-400 bg-rose-400/15';
    case 'rare': return 'text-violet-400 bg-violet-400/15';
  }
}
