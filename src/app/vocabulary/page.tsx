import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
import VocabularyContent from '@/components/vocabulary/VocabularyContent';
import { redirect } from 'next/navigation';

export default async function VocabularyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userWords } = await supabase
    .from('user_words')
    .select('*, words(*)')
    .eq('user_id', user.id)
    .order('date_added', { ascending: false });

  return (
    <AppShell>
      <VocabularyContent initialWords={userWords || []} />
    </AppShell>
  );
}
