import { createClient } from '@/lib/supabase/server';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const [{ data: profile }, { data: userWords }] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('display_name, streak_count')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_words')
      .select('id, mastery_score, in_review_queue, date_added, words(id, word, definition, difficulty)')
      .eq('user_id', user.id)
      .order('date_added', { ascending: false }),
  ]);

  // Calculate stats from the current snapshot instead of mutating data during render.
  const userWordsData = userWords || [];
  const totalWords = userWordsData.length;
  let totalMastery = 0;
  const masteryDistribution = { learning: 0, familiar: 0, practiced: 0, proficient: 0, mastered: 0 };

  userWordsData.forEach((uw: Record<string, unknown>) => {
    const score = uw.mastery_score as number;
    totalMastery += score;

    if (score < 30) masteryDistribution.learning++;
    else if (score < 60) masteryDistribution.familiar++;
    else if (score < 80) masteryDistribution.practiced++;
    else if (score < 95) masteryDistribution.proficient++;
    else masteryDistribution.mastered++;
  });

  const averageMastery = totalWords > 0 ? Math.round(totalMastery / totalWords) : 0;
  const recentWords = userWordsData.slice(0, 5);
  const reviewQueueCount = userWordsData.filter((uw: Record<string, unknown>) => uw.in_review_queue).length;

  return (
    <DashboardContent
      displayName={profile?.display_name || user.email || 'Learner'}
      streakCount={profile?.streak_count || 0}
      totalWords={totalWords}
      averageMastery={averageMastery}
      masteryDistribution={masteryDistribution}
      reviewQueueCount={reviewQueueCount}
      recentWords={recentWords}
    />
  );
}
