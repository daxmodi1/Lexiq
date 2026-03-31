import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
import ProfileContent from '@/components/profile/ProfileContent';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: any };

  // User words for mastery chart
  const { data: userWords } = await supabase
    .from('user_words')
    .select('mastery_score, date_added, words(difficulty)')
    .eq('user_id', user.id)
    .order('date_added', { ascending: true });

  // Quiz history
  const { data: quizSessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false });

  return (
    <AppShell>
      <ProfileContent
        profile={profile}
        email={user.email || ''}
        userWords={userWords || []}
        quizHistory={quizSessions || []}
        achievements={achievements || []}
      />
    </AppShell>
  );
}
