import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, streak_count')
    .eq('id', user.id)
    .single();

  const streakCount = profile?.streak_count ?? 0;
  const userName = profile?.display_name ?? user.email ?? undefined;

  return (
    <div className="min-h-screen bg-surface-base">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar streakCount={streakCount} userName={userName} />
        <main className="px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
