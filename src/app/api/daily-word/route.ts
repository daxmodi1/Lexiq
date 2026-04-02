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
    // Generate a random word via AI if the cron job hasn't run or table is empty
    const { generateRandomWord } = await import('@/lib/groq');
    
    try {
      const aiWord = await generateRandomWord();

      // Check if the word already exists
      let { data: wordRecord } = await supabase
        .from('words')
        .select('id, definition')
        .ilike('word', aiWord.word)
        .maybeSingle() as any;

      if (!wordRecord) {
        // Insert it
        const { data: insertedWord } = await supabase
          .from('words')
          .insert({
            word: aiWord.word,
            definition: aiWord.definition,
            synonyms: aiWord.synonyms,
            antonyms: aiWord.antonyms,
            word_family: aiWord.word_family || [],
            difficulty: aiWord.difficulty || 'intermediate',
            part_of_speech: aiWord.part_of_speech || null,
            phonetic: aiWord.phonetic || null,
            examples: aiWord.examples || []
          } as any)
          .select('id, definition')
          .single() as any;

        wordRecord = insertedWord;
      }

      if (wordRecord) {
        // Generate distractors
        const { data: otherWords } = await supabase
          .from('words')
          .select('id, definition')
          .neq('id', wordRecord.id)
          .limit(10) as any;

        const distractors = (otherWords || [])
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
          
        const allOptions = [
          { id: wordRecord.id, text: wordRecord.definition, isCorrect: true },
          ...distractors.map((d: any) => ({ id: d.id, text: d.definition, isCorrect: false }))
        ].sort(() => 0.5 - Math.random());

        const { data: created } = await supabase
          .from('daily_word')
          .insert({
            word_id: wordRecord.id,
            date: today,
            options: allOptions,
          } as any)
          .select('*, words(*)')
          .single() as any;

        dailyWord = created;
      }
    } catch (e) {
      console.error('Failed to generate daily word on fallback', e);
      return NextResponse.json({ error: 'Failed to generate word' }, { status: 500 });
    }
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
