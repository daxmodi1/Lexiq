import { createClient } from '@/lib/supabase/server';
import { normalizeWord } from '@/lib/supabase/normalize';
import DailyQuizContent from '@/components/quiz/DailyQuizContent';
import { redirect } from 'next/navigation';

export default async function DailyQuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's words for personal quiz
  const { data: userWords } = await supabase
    .from('user_words')
    .select('id, mastery_score, words(id, word, definition)')
    .eq('user_id', user.id)
    .order('mastery_score', { ascending: true })
    .limit(20);

  const normalizedUserWords = (userWords || []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ''),
    mastery_score: Number(item.mastery_score ?? 0),
    words: normalizeWord(item.words),
  }));

  return <DailyQuizContent userWords={normalizedUserWords} />;
}
