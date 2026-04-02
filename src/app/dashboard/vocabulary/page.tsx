import { createClient } from '@/lib/supabase/server';
import { normalizeWord } from '@/lib/supabase/normalize';
import VocabularyContent from '@/components/vocabulary/VocabularyContent';
import { redirect } from 'next/navigation';

export default async function VocabularyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userWords } = await supabase
    .from('user_words')
    .select('id, mastery_score, date_added, in_review_queue, words(id, word, definition, difficulty, part_of_speech)')
    .eq('user_id', user.id)
    .order('date_added', { ascending: false });

  const normalizedUserWords = (userWords || []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ''),
    mastery_score: Number(item.mastery_score ?? 0),
    date_added: String(item.date_added ?? ''),
    in_review_queue: Boolean(item.in_review_queue),
    words: normalizeWord(item.words),
  }));

  return <VocabularyContent initialWords={normalizedUserWords} />;
}
