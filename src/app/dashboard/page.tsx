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

  // --- Review Queue Automation ---
  // Flag words not reviewed in 30+ days as needing review
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Update words that are stale (not reviewed in 30 days, or never reviewed but added 7+ days ago)
  await supabase
    .from('user_words')
    .update({ in_review_queue: true })
    .eq('user_id', user.id)
    .eq('in_review_queue', false)
    .lt('mastery_score', 95)
    .not('last_reviewed_at', 'is', null)
    .lt('last_reviewed_at', thirtyDaysAgo.toISOString());

  await supabase
    .from('user_words')
    .update({ in_review_queue: true })
    .eq('user_id', user.id)
    .eq('in_review_queue', false)
    .lt('mastery_score', 95)
    .is('last_reviewed_at', null)
    .lt('date_added', sevenDaysAgo.toISOString());

  // Re-fetch after updates
  const { data: updatedUserWords } = await supabase
    .from('user_words')
    .select('*, words(*)')
    .eq('user_id', user.id)
    .order('date_added', { ascending: false });

  // Calculate stats
  const userWordsData = updatedUserWords || [];
  const totalWords = userWordsData.length;
  let totalMastery = 0;
  const masteryDistribution = { learning: 0, familiar: 0, practiced: 0, proficient: 0, mastered: 0 };
  const difficultyBreakdown = { beginner: 0, intermediate: 0, advanced: 0, rare: 0 };

  userWordsData.forEach((uw: Record<string, unknown>) => {
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
  const recentWords = userWordsData.slice(0, 5);

  // Get review queue count
  const reviewQueueCount = userWordsData.filter((uw: Record<string, unknown>) => uw.in_review_queue).length;

  return (
    <AppShell>
      <DashboardContent
        displayName={profile?.display_name || user.email || 'Learner'}
        streakCount={profile?.streak_count || 0}
        totalWords={totalWords}
        averageMastery={averageMastery}
        masteryDistribution={masteryDistribution}
        reviewQueueCount={reviewQueueCount}
        recentWords={recentWords}
      />
    </AppShell>
  );
}
