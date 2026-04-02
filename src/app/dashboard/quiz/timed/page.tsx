import { createClient } from '@/lib/supabase/server';
import { normalizeWord } from '@/lib/supabase/normalize';
import TimedChallengeContent from '@/components/quiz/TimedChallengeContent';
import { redirect } from 'next/navigation';

export default async function TimedChallengePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: userWords }, { data: profile }] = await Promise.all([
    supabase
      .from('user_words')
      .select('id, mastery_score, words(id, word, definition)')
      .eq('user_id', user.id),
    supabase
      .from('user_profiles')
      .select('best_timed_score')
      .eq('id', user.id)
      .single(),
  ]);

  const normalizedUserWords = (userWords || []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ''),
    mastery_score: Number(item.mastery_score ?? 0),
    words: normalizeWord(item.words),
  }));

  return (
    <TimedChallengeContent
      userWords={normalizedUserWords}
      bestScore={profile?.best_timed_score || 0}
    />
  );
}
