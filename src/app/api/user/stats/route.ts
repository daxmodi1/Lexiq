import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get vocabulary stats
  const { data: userWords } = await supabase
    .from('user_words')
    .select('mastery_score, words(difficulty)')
    .eq('user_id', user.id);

  const totalWords = userWords?.length || 0;
  
  // Mastery distribution
  const masteryDistribution = {
    learning: 0,
    familiar: 0,
    practiced: 0,
    proficient: 0,
    mastered: 0,
  };

  const difficultyBreakdown = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    rare: 0,
  };

  let totalMastery = 0;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userWords?.forEach((uw: any) => {
    const score = uw.mastery_score as number;
    totalMastery += score;

    if (score < 30) masteryDistribution.learning++;
    else if (score < 60) masteryDistribution.familiar++;
    else if (score < 80) masteryDistribution.practiced++;
    else if (score < 95) masteryDistribution.proficient++;
    else masteryDistribution.mastered++;

    const wordData = uw.words;
    if (wordData && typeof wordData.difficulty === 'string') {
      const diff = wordData.difficulty as keyof typeof difficultyBreakdown;
      if (diff in difficultyBreakdown) {
        difficultyBreakdown[diff]++;
      }
    }
  });

  const averageMastery = totalWords > 0 ? Math.round(totalMastery / totalWords) : 0;

  // Review queue count
  const { count: reviewQueueCount } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('in_review_queue', true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileData = profile as any;

  return NextResponse.json({
    profile: profileData,
    stats: {
      totalWords,
      averageMastery,
      masteryDistribution,
      difficultyBreakdown,
      reviewQueueCount: reviewQueueCount || 0,
      streakCount: profileData?.streak_count || 0,
    },
  });
}
