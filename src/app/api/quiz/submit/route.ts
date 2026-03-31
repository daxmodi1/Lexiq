import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateMasteryWithStreak } from '@/lib/mastery';

interface QuizResult {
  word_id: string;
  is_correct: boolean;
  user_answer: string;
  time_taken_ms?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { session_type, results, duration_seconds } = await request.json() as {
    session_type: 'daily_personal' | 'timed' | 'definition_match';
    results: QuizResult[];
    duration_seconds?: number;
  };

  if (!results || results.length === 0) {
    return NextResponse.json({ error: 'No results provided' }, { status: 400 });
  }

  const correctCount = results.filter((r) => r.is_correct).length;

  // Create quiz session
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      session_type,
      score: correctCount,
      words_tested: results.length,
      duration_seconds: duration_seconds || null,
    })
    .select()
    .single();

  if (sessionError) {
    console.error('Failed to create quiz session:', sessionError);
    return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 });
  }

  // Save individual answers and update mastery scores
  let consecutiveCorrect = 0;
  const masteryUpdates: Array<{ word_id: string; old_score: number; new_score: number }> = [];

  for (const result of results) {
    // Save answer
    await supabase.from('quiz_answers').insert({
      session_id: session.id,
      word_id: result.word_id,
      user_answer: result.user_answer,
      is_correct: result.is_correct,
      time_taken_ms: result.time_taken_ms || null,
    });

    // Update mastery score
    const { data: userWord } = await supabase
      .from('user_words')
      .select('mastery_score')
      .eq('user_id', user.id)
      .eq('word_id', result.word_id)
      .single();

    if (userWord) {
      const oldScore = userWord.mastery_score;
      if (result.is_correct) {
        consecutiveCorrect++;
      } else {
        consecutiveCorrect = 0;
      }

      const event = result.is_correct ? 'correct_first' : 'wrong';
      const newScore = calculateMasteryWithStreak(oldScore, event, consecutiveCorrect);

      await supabase
        .from('user_words')
        .update({
          mastery_score: newScore,
          last_reviewed_at: new Date().toISOString(),
          in_review_queue: false,
        })
        .eq('user_id', user.id)
        .eq('word_id', result.word_id);

      masteryUpdates.push({ word_id: result.word_id, old_score: oldScore, new_score: newScore });
    }
  }

  // Update streak
  await updateStreak(supabase, user.id);

  // Update best timed score if applicable
  if (session_type === 'timed' && correctCount > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('best_timed_score')
      .eq('id', user.id)
      .single() as { data: any };

    if (profile && correctCount > (profile.best_timed_score || 0)) {
      await supabase
        .from('user_profiles')
        .update({ best_timed_score: correctCount })
        .eq('id', user.id);
    }
  }

  // Check for new achievements
  const newAchievements = await checkAchievements(supabase, user.id);

  return NextResponse.json({
    session,
    masteryUpdates,
    newAchievements,
    streakUpdated: true,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateStreak(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('streak_count, streak_last_date')
    .eq('id', userId)
    .single();

  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = profile.streak_last_date;

  if (lastDate === today) return; // Already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let newStreak: number;
  if (lastDate === yesterdayStr) {
    newStreak = (profile.streak_count || 0) + 1;
  } else {
    newStreak = 1; // Reset streak
  }

  await supabase
    .from('user_profiles')
    .update({
      streak_count: newStreak,
      streak_last_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAchievements(supabase: any, userId: string) {
  const newAchievements: string[] = [];

  // Get existing achievements
  const { data: existing } = await supabase
    .from('achievements')
    .select('badge_type')
    .eq('user_id', userId);

  const earned = new Set((existing || []).map((a: { badge_type: string }) => a.badge_type));

  // Get stats
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('streak_count')
    .eq('id', userId)
    .single();

  const { count: totalWords } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: masteredCount } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('mastery_score', 95);

  const { count: quizCount } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Define badge conditions
  const badges: Array<{ type: string; condition: boolean }> = [
    { type: 'first_word', condition: (totalWords || 0) >= 1 },
    { type: 'ten_words', condition: (totalWords || 0) >= 10 },
    { type: 'fifty_words', condition: (totalWords || 0) >= 50 },
    { type: 'hundred_words', condition: (totalWords || 0) >= 100 },
    { type: 'first_mastery', condition: (masteredCount || 0) >= 1 },
    { type: 'ten_mastered', condition: (masteredCount || 0) >= 10 },
    { type: 'first_quiz', condition: (quizCount || 0) >= 1 },
    { type: 'ten_quizzes', condition: (quizCount || 0) >= 10 },
    { type: 'streak_3', condition: (profile?.streak_count || 0) >= 3 },
    { type: 'streak_7', condition: (profile?.streak_count || 0) >= 7 },
    { type: 'streak_30', condition: (profile?.streak_count || 0) >= 30 },
  ];

  for (const badge of badges) {
    if (badge.condition && !earned.has(badge.type)) {
      await supabase.from('achievements').insert({
        user_id: userId,
        badge_type: badge.type,
      });
      newAchievements.push(badge.type);
    }
  }

  return newAchievements;
}
