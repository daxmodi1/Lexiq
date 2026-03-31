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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateString = thirtyDaysAgo.toISOString();

    // Set in_review_queue to true for user_words that haven't been reviewed recently
    const { data, error } = await supabase
      .from('user_words')
      .update({ in_review_queue: true })
      .lt('last_reviewed_at', dateString)
      .eq('in_review_queue', false)
      .select('id');

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      message: `Added ${data?.length || 0} words to review queue.`
    });
  } catch (error: any) {
    console.error('Review queue update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
