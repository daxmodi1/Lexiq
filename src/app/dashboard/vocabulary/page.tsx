import { createClient } from '@/lib/supabase/server';
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

  return <VocabularyContent initialWords={userWords || []} />;
}
