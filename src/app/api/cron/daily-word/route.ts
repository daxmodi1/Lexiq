import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if entry already exists to avoid duplicate entries / errors if run multiple times
    const { data: existing } = await supabase
      .from('daily_word')
      .select('id, word_id')
      .eq('date', today)
      .maybeSingle() as any;

    if (existing) {
      return NextResponse.json({ message: 'Daily word already selected for today', wordId: existing.word_id });
    }

    // Use AI to generate a brand new random word
    const { generateRandomWord } = await import('@/lib/groq');
    const aiWord = await generateRandomWord();
    
    // Check if the word already exists in the words table
    let { data: wordRecord } = await supabase
      .from('words')
      .select('id, word, definition')
      .ilike('word', aiWord.word)
      .maybeSingle() as any;

    if (!wordRecord) {
      // Insert the AI-curated word into words table
      const { data: insertedWord, error: wordInsertErr } = await supabase
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
        .select('id, word, definition')
        .single() as any;
        
      if (wordInsertErr || !insertedWord) {
        throw new Error('Failed to insert newly generated word into global pool');
      }
      wordRecord = insertedWord;
    }

    if (!wordRecord) {
        throw new Error('Failed to resolve wordRecord');
    }

    // Now, generate distractors for the daily word (multiple choice options)
    // We can just pull random definitions from the database for distractors
    const { data: otherWords } = await supabase
      .from('words')
      .select('id, definition')
      .neq('id', wordRecord.id)
      .limit(10) as any;
      
    const distractors = (otherWords || [])
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    // Mix the correct definition and distractors
    const allOptions = [
      { id: wordRecord.id, text: wordRecord.definition, isCorrect: true },
      ...distractors.map((d: any) => ({ id: d.id, text: d.definition, isCorrect: false }))
    ].sort(() => 0.5 - Math.random());

    const { error: insertError } = await supabase
      .from('daily_word')
      .insert({
        word_id: wordRecord.id,
        date: today,
        options: allOptions
      } as any);

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, wordId: wordRecord.id, date: today });
  } catch (error: any) {
    console.error('Daily word error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
