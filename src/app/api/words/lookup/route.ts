import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lookupWord } from '@/lib/groq';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')?.toLowerCase().trim();

  if (!word) {
    return NextResponse.json({ error: 'Word parameter is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Check if word exists in cache (DB)
  const { data: existingWord } = await supabase
    .from('words')
    .select('*')
    .eq('word', word)
    .single();

  if (existingWord) {
    // Check if user has this word in their vocabulary
    const { data: { user } } = await supabase.auth.getUser();
    let userWord = null;
    
    if (user) {
      const { data } = await supabase
        .from('user_words')
        .select('*')
        .eq('user_id', user.id)
        .eq('word_id', existingWord.id)
        .single();
      userWord = data;
    }

    return NextResponse.json({ word: existingWord, userWord });
  }

  // Look up via Groq API
  try {
    const lookupResult = await lookupWord(word);

    // Insert into words table
    const { data: newWord, error } = await supabase
      .from('words')
      .insert({
        word: lookupResult.word,
        definition: lookupResult.definition,
        synonyms: lookupResult.synonyms,
        antonyms: lookupResult.antonyms,
        word_family: lookupResult.word_family,
        difficulty: lookupResult.difficulty,
        part_of_speech: lookupResult.part_of_speech,
        phonetic: lookupResult.phonetic,
        examples: lookupResult.examples,
      })
      .select()
      .single();

    if (error) {
      // Word might have been inserted by another request
      const { data: retryWord } = await supabase
        .from('words')
        .select('*')
        .eq('word', word)
        .single();
      
      if (retryWord) {
        return NextResponse.json({ word: retryWord, userWord: null });
      }
      throw error;
    }

    return NextResponse.json({ word: newWord, userWord: null });
  } catch (error) {
    console.error('Word lookup failed:', error);
    return NextResponse.json(
      { error: 'Failed to look up word. Please try again.' },
      { status: 500 }
    );
  }
}
