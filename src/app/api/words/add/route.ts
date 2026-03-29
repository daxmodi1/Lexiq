import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { word_id } = await request.json();

  if (!word_id) {
    return NextResponse.json({ error: 'word_id is required' }, { status: 400 });
  }

  // Check if already added
  const { data: existing } = await supabase
    .from('user_words')
    .select('id')
    .eq('user_id', user.id)
    .eq('word_id', word_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Word already in your vocabulary' }, { status: 409 });
  }

  // Add word with initial mastery score of 50
  const { data: userWord, error } = await supabase
    .from('user_words')
    .insert({
      user_id: user.id,
      word_id: word_id,
      mastery_score: 50,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to add word:', error);
    return NextResponse.json({ error: 'Failed to add word' }, { status: 500 });
  }

  return NextResponse.json({ userWord });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const wordId = searchParams.get('word_id');

  if (!wordId) {
    return NextResponse.json({ error: 'word_id is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_words')
    .delete()
    .eq('user_id', user.id)
    .eq('word_id', wordId);

  if (error) {
    return NextResponse.json({ error: 'Failed to remove word' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
