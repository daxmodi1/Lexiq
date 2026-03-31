import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
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
    .select('*, words(*)')
    .eq('user_id', user.id)
    .order('mastery_score', { ascending: true })
    .limit(20);

  return (
    <AppShell>
      <DailyQuizContent userWords={userWords || []} />
    </AppShell>
  );
}
