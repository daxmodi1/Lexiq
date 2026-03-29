import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch user words with word data
  const { data: userWords } = await supabase
    .from('user_words')
    .select('*, words(*)')
    .eq('user_id', user.id)
    .order('date_added', { ascending: false });

  // Calculate stats
  const totalWords = userWords?.length || 0;
  let totalMastery = 0;
  const masteryDistribution = { learning: 0, familiar: 0, practiced: 0, proficient: 0, mastered: 0 };
  const difficultyBreakdown = { beginner: 0, intermediate: 0, advanced: 0, rare: 0 };

  userWords?.forEach((uw: Record<string, unknown>) => {
    const score = uw.mastery_score as number;
    totalMastery += score;

    if (score < 30) masteryDistribution.learning++;
    else if (score < 60) masteryDistribution.familiar++;
    else if (score < 80) masteryDistribution.practiced++;
    else if (score < 95) masteryDistribution.proficient++;
    else masteryDistribution.mastered++;

    const words = uw.words as Record<string, unknown> | null;
    if (words && typeof words.difficulty === 'string') {
      const diff = words.difficulty as keyof typeof difficultyBreakdown;
      if (diff in difficultyBreakdown) difficultyBreakdown[diff]++;
    }
  });

  const averageMastery = totalWords > 0 ? Math.round(totalMastery / totalWords) : 0;
  const recentWords = (userWords || []).slice(0, 5);

  // Get review queue count
  const reviewQueueCount = userWords?.filter((uw: Record<string, unknown>) => uw.in_review_queue).length || 0;

  return (
    <AppShell>
      <DashboardContent
        displayName={profile?.display_name || user.email || 'Learner'}
        streakCount={profile?.streak_count || 0}
        totalWords={totalWords}
        averageMastery={averageMastery}
        masteryDistribution={masteryDistribution}
        difficultyBreakdown={difficultyBreakdown}
        reviewQueueCount={reviewQueueCount}
        recentWords={recentWords}
      />
    </AppShell>
  );
}
