import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFillInTheBlank } from '@/lib/groq';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get a mix of user's words, weighted toward lower mastery
  const { data: userWords } = await supabase
    .from('user_words')
    .select('word_id, mastery_score, words(word, definition)')
    .eq('user_id', user.id)
    .order('mastery_score', { ascending: true })
    .limit(15);

  if (!userWords || userWords.length === 0) {
    return NextResponse.json({ error: 'Add words to your vocabulary first' }, { status: 404 });
  }

  // Pick 5 words, biased toward low mastery
  const shuffled = [...userWords].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(5, shuffled.length));

  // Generate fill-in-the-blank for each
  const questions = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selected.map(async (uw: any) => {
      try {
        const q = await generateFillInTheBlank(uw.words.word, uw.words.definition);
        return {
          word_id: uw.word_id,
          word: uw.words.word,
          definition: uw.words.definition,
          sentence: q.sentence,
          hint: q.hint,
          mastery_score: uw.mastery_score,
        };
      } catch {
        return null;
      }
    })
  );

  const validQuestions = questions.filter(Boolean);

  if (validQuestions.length === 0) {
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }

  return NextResponse.json({ questions: validQuestions });
}
