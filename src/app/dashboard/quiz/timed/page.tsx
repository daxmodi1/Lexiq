import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
import TimedChallengeContent from '@/components/quiz/TimedChallengeContent';
import { redirect } from 'next/navigation';

export default async function TimedChallengePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: userWords } = await supabase
    .from('user_words')
    .select('*, words(*)')
    .eq('user_id', user.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('best_timed_score')
    .eq('id', user.id)
    .single() as { data: any };

  return (
    <AppShell>
      <TimedChallengeContent
        userWords={userWords || []}
        bestScore={profile?.best_timed_score || 0}
      />
    </AppShell>
  );
}
