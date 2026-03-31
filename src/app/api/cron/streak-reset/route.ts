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

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 2);
    // Any user whose streak_last_date is strictly less than "today - 2 days" 
    // did not do a quiz "yesterday" nor "today". Their streak is broken.
    const cutoffString = cutoff.toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ streak_count: 0 })
      .lt('streak_last_date', cutoffString)
      .gt('streak_count', 0)
      .select('id');

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      message: `Reset streaks for ${data?.length || 0} users.`
    });
  } catch (error: any) {
    console.error('Streak reset error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
