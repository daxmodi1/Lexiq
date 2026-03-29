import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty');
  const sort = searchParams.get('sort') || 'date_added';
  const order = searchParams.get('order') || 'desc';
  const search = searchParams.get('search');

  let query = supabase
    .from('user_words')
    .select('*, words(*)')
    .eq('user_id', user.id);

  // Apply filters
  if (difficulty) {
    query = query.eq('words.difficulty', difficulty);
  }

  // Apply sorting
  switch (sort) {
    case 'mastery':
      query = query.order('mastery_score', { ascending: order === 'asc' });
      break;
    case 'alphabetical':
      query = query.order('word_id', { ascending: order === 'asc' });
      break;
    case 'date_added':
    default:
      query = query.order('date_added', { ascending: order === 'asc' });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch vocabulary:', error);
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 });
  }

  // Client-side search filter (since Supabase text search on joined tables is limited)
  let filteredData = data || [];
  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter((item: Record<string, unknown>) => {
      const words = item.words as Record<string, unknown> | null;
      return words && typeof words.word === 'string' && words.word.toLowerCase().includes(searchLower);
    });
  }

  return NextResponse.json({ vocabulary: filteredData });
}
