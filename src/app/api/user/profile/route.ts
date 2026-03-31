import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: any };

  // Quiz history
  const { data: quizSessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Word count
  const { count: totalWords } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Mastered count
  const { count: masteredCount } = await supabase
    .from('user_words')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('mastery_score', 95);

  // Achievement count
  const { count: achievementCount } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return NextResponse.json({
    profile,
    email: user.email,
    quizHistory: quizSessions || [],
    stats: {
      totalWords: totalWords || 0,
      masteredCount: masteredCount || 0,
      achievementCount: achievementCount || 0,
      bestTimedScore: profile?.best_timed_score || 0,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const updates = await request.json();
  const allowed = ['display_name', 'auto_add_enabled'];
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in updates) filtered[key] = updates[key];
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ ...filtered, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
