import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const BADGE_INFO: Record<string, { name: string; description: string; icon: string }> = {
  first_word: { name: 'First Step', description: 'Added your first word', icon: 'star' },
  ten_words: { name: 'Word Collector', description: 'Added 10 words', icon: 'collections_bookmark' },
  fifty_words: { name: 'Lexicon Builder', description: 'Added 50 words', icon: 'library_books' },
  hundred_words: { name: 'Centurion', description: 'Added 100 words', icon: 'emoji_events' },
  first_mastery: { name: 'First Mastery', description: 'Mastered your first word', icon: 'workspace_premium' },
  ten_mastered: { name: 'Expert', description: 'Mastered 10 words', icon: 'military_tech' },
  first_quiz: { name: 'Quiz Taker', description: 'Completed your first quiz', icon: 'quiz' },
  ten_quizzes: { name: 'Quiz Pro', description: 'Completed 10 quizzes', icon: 'school' },
  streak_3: { name: 'On Fire', description: '3-day streak', icon: 'local_fire_department' },
  streak_7: { name: 'Weekly Warrior', description: '7-day streak', icon: 'bolt' },
  streak_30: { name: 'Monthly Master', description: '30-day streak', icon: 'diamond' },
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false });

  const enriched = (achievements || []).map((a: { badge_type: string; earned_at: string }) => ({
    ...a,
    ...(BADGE_INFO[a.badge_type] || { name: a.badge_type, description: '', icon: 'emoji_events' }),
  }));

  // All possible badges with earned status
  const allBadges = Object.entries(BADGE_INFO).map(([type, info]) => ({
    type,
    ...info,
    earned: enriched.some((e: { badge_type: string }) => e.badge_type === type),
    earned_at: enriched.find((e: { badge_type: string }) => e.badge_type === type)?.earned_at || null,
  }));

  return NextResponse.json({ achievements: enriched, allBadges });
}
