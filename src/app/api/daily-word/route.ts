import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = new Date().toISOString().split('T')[0];

  // Check if daily word exists for today
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let { data: dailyWord } = await supabase
    .from('daily_word')
    .select('*, words(*)')
    .eq('date', today)
    .single() as { data: any };

  if (!dailyWord) {
    // Pick a random word from the global pool
    const { data: allWords } = await supabase
      .from('words')
      .select('id')
      .limit(100);

    if (!allWords || allWords.length === 0) {
      return NextResponse.json({ error: 'No words available' }, { status: 404 });
    }

    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];

    // Generate 3 distractor definitions
    const { data: distractors } = await supabase
      .from('words')
      .select('definition')
      .neq('id', randomWord.id)
      .limit(3);

    const options = distractors?.map((d: { definition: string }) => d.definition) || [];

    const { data: created } = await supabase
      .from('daily_word')
      .insert({
        word_id: randomWord.id,
        date: today,
        options: options,
      })
      .select('*, words(*)')
      .single();

    dailyWord = created;
  }

  // Check if user already answered today
  let userAnswer = null;
  if (dailyWord) {
    const { data: answer } = await supabase
      .from('daily_word_answers')
      .select('*')
      .eq('user_id', user.id)
      .eq('daily_word_id', dailyWord.id)
      .single();

    userAnswer = answer;
  }

  return NextResponse.json({ dailyWord, userAnswer });
}
