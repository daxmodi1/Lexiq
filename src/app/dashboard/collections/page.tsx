import { createClient } from '@/lib/supabase/server';
import CollectionsContent from '@/components/collections/CollectionsContent';
import { redirect } from 'next/navigation';

type CollectionPreviewWord = {
  word: string;
  definition: string;
  difficulty: string;
};

function normalizeCollectionWord(value: unknown): CollectionPreviewWord {
  const relation = Array.isArray(value) ? value[0] : value;

  if (!relation || typeof relation !== 'object') {
    return {
      word: '',
      definition: '',
      difficulty: 'beginner',
    };
  }

  const record = relation as Partial<CollectionPreviewWord>;

  return {
    word: record.word ?? '',
    definition: record.definition ?? '',
    difficulty: record.difficulty ?? 'beginner',
  };
}

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: collections } = await supabase
    .from('collections')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const collectionIds = (collections || []).map((collection) => collection.id);

  let collectionsWithWords = (collections || []).map((collection) => ({
    ...collection,
    words: [] as Array<{
      id: string;
      words: {
        word: string;
        definition: string;
        difficulty: string;
      };
    }>,
    wordCount: 0,
  }));

  if (collectionIds.length > 0) {
    const { data: collectionWords } = await supabase
      .from('collection_words')
      .select('id, collection_id, added_at, words(word, definition, difficulty)')
      .in('collection_id', collectionIds)
      .order('added_at', { ascending: false });

    const groupedWords = new Map<string, Array<{
      id: string;
      words: {
        word: string;
        definition: string;
        difficulty: string;
      };
    }>>();
    const wordCounts = new Map<string, number>();

    for (const item of collectionWords || []) {
      const group = groupedWords.get(item.collection_id) || [];
      wordCounts.set(item.collection_id, (wordCounts.get(item.collection_id) || 0) + 1);

      if (group.length < 5) {
        group.push({
          id: item.id,
          words: normalizeCollectionWord(item.words),
        });
      }

      groupedWords.set(item.collection_id, group);
    }

    collectionsWithWords = collectionsWithWords.map((collection) => ({
      ...collection,
      words: groupedWords.get(collection.id) || [],
      wordCount: wordCounts.get(collection.id) || 0,
    }));
  }

  // Get user's vocabulary for adding to collections
  const { data: userWords } = await supabase
    .from('user_words')
    .select('word_id, words(id, word)')
    .eq('user_id', user.id);

  return (
    <CollectionsContent
      initialCollections={collectionsWithWords}
      userWords={userWords || []}
    />
  );
}
