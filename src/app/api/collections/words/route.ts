import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collection_id');
  if (!collectionId) return NextResponse.json({ error: 'collection_id required' }, { status: 400 });

  const { data, error } = await supabase
    .from('collection_words')
    .select('*, words(*)')
    .eq('collection_id', collectionId)
    .order('added_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ words: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { collection_id, word_id } = await request.json();
  if (!collection_id || !word_id) {
    return NextResponse.json({ error: 'collection_id and word_id required' }, { status: 400 });
  }

  // Check if already in collection
  const { data: existing } = await supabase
    .from('collection_words')
    .select('id')
    .eq('collection_id', collection_id)
    .eq('word_id', word_id)
    .single();

  if (existing) return NextResponse.json({ error: 'Word already in collection' }, { status: 409 });

  const { data, error } = await supabase
    .from('collection_words')
    .insert({ collection_id, word_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ collectionWord: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collection_id');
  const wordId = searchParams.get('word_id');
  if (!collectionId || !wordId) {
    return NextResponse.json({ error: 'collection_id and word_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('collection_words')
    .delete()
    .eq('collection_id', collectionId)
    .eq('word_id', wordId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
