import { createClient } from '@/lib/supabase/server';
import HeroPage from '@/components/layout/HeroPage';
import { redirect } from 'next/navigation';

export default async function IndexPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return <HeroPage />;
}
