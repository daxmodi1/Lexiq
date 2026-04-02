import { createClient } from '@/lib/supabase/server';
import ProfileContent from '@/components/profile/ProfileContent';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: userWords }, { data: quizSessions }, { data: achievements }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('display_name, created_at, streak_count, best_timed_score')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_words')
      .select('mastery_score, date_added, words(difficulty)')
      .eq('user_id', user.id)
      .order('date_added', { ascending: true }),
    supabase
      .from('quiz_sessions')
      .select('id, session_type, score, words_tested, duration_seconds, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('achievements')
      .select('badge_type, earned_at')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false }),
  ]);

  return (
    <ProfileContent
      profile={profile}
      email={user.email || ''}
      userWords={userWords || []}
      quizHistory={quizSessions || []}
      achievements={achievements || []}
    />
  );
}
