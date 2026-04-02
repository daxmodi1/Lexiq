import { createClient } from '@/lib/supabase/server';
import FillBlankContent from '@/components/quiz/FillBlankContent';
import { redirect } from 'next/navigation';

export default async function FillBlankPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userWords } = await supabase
    .from('user_words')
    .select('word_id, mastery_score, words(id, word, definition)')
    .eq('user_id', user.id)
    .order('mastery_score', { ascending: true })
    .limit(15);

  return <FillBlankContent userWords={userWords || []} />;
}
