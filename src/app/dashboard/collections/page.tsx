import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/layout/AppShell';
import CollectionsContent from '@/components/collections/CollectionsContent';
import { redirect } from 'next/navigation';

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: collections } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get words for each collection
  const collectionsWithWords = await Promise.all(
    (collections || []).map(async (col: { id: string; name: string; created_at: string }) => {
      const { data: words, count } = await supabase
        .from('collection_words')
        .select('*, words(word, definition, difficulty)', { count: 'exact' })
        .eq('collection_id', col.id)
        .order('added_at', { ascending: false })
        .limit(5);

      return { ...col, words: words || [], wordCount: count || 0 };
    })
  );

  // Get user's vocabulary for adding to collections
  const { data: userWords } = await supabase
    .from('user_words')
    .select('word_id, words(id, word)')
    .eq('user_id', user.id);

  return (
    <AppShell>
      <CollectionsContent
        initialCollections={collectionsWithWords}
        userWords={userWords || []}
      />
    </AppShell>
  );
}
