import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
import WordOfDayContent from '@/components/daily/WordOfDayContent';
import { redirect } from 'next/navigation';

export default async function WordOfDayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch daily word
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let dailyWord: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userAnswer: any = null;

  const today = new Date().toISOString().split('T')[0];

  const { data: dw } = await supabase
    .from('daily_word')
    .select('*, words(*)')
    .eq('date', today)
    .single();

  if (dw) {
    dailyWord = dw;
    const { data: ans } = await supabase
      .from('daily_word_answers')
      .select('*')
      .eq('user_id', user.id)
      .eq('daily_word_id', dw.id)
      .single();
    userAnswer = ans;
  }

  return (
    <AppShell>
      <WordOfDayContent dailyWord={dailyWord} userAnswer={userAnswer} />
    </AppShell>
  );
}
