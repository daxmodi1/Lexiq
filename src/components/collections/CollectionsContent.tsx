'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDifficultyColor } from '@/lib/types';

interface CollectionWord {
  id: string;
  words: {
    word: string;
    definition: string;
    difficulty: string;
  };
}

interface Collections {
  id: string;
  name: string;
  created_at: string;
  words: CollectionWord[];
  wordCount: number;
}

interface CollectionsContentProps {
  initialCollections: Collections[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userWords: any[];
}

export default function CollectionsContent({ initialCollections, userWords }: CollectionsContentProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingWord, setAddingWord] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.collection) {
        setCollections([{ ...data.collection, words: [], wordCount: 0 }, ...collections]);
        setNewName('');
        setShowCreate(false);
      }
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await fetch(`/api/collections?id=${id}`, { method: 'DELETE' });
      setCollections(collections.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddWord = async (collectionId: string) => {
    if (!selectedWordId) return;
    try {
      const res = await fetch('/api/collections/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collectionId, word_id: selectedWordId }),
      });
      if (res.ok) {
        window.location.reload(); // Refresh to get updated data
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveWord = async (collectionId: string, wordId: string) => {
    try {
      await fetch(`/api/collections/words?collection_id=${collectionId}&word_id=${wordId}`, { method: 'DELETE' });
      setCollections(collections.map((c) =>
        c.id === collectionId
          ? { ...c, words: c.words.filter((w) => w.words?.word !== wordId), wordCount: c.wordCount - 1 }
          : c
      ));
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm text-on-surface mb-2">Collections</h1>
          <p className="text-body-lg text-on-surface-variant">Organize your words into themed groups</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-5 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Collection
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-surface-low rounded-2xl p-6 mb-6 animate-slide-up">
          <label className="text-label-lg text-on-surface-variant block mb-2">Collection name</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. SAT Vocabulary, Business Terms..."
              className="flex-1 px-4 py-3 bg-surface-lowest rounded-xl text-body-lg text-on-surface placeholder:text-outline focus:shadow-glow-sm"
              autoFocus
            />
            <button type="submit" disabled={creating || !newName.trim()} className="px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Collections List */}
      {collections.length > 0 ? (
        <div className="space-y-4">
          {collections.map((col) => {
            const isExpanded = expandedId === col.id;
            return (
              <div key={col.id} className="bg-surface-low rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">folder</span>
                    </div>
                    <div>
                      <h3 className="text-title-lg text-on-surface">{col.name}</h3>
                      <p className="text-body-sm text-on-surface-variant">{col.wordCount} words</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(col.id); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-error/10 hover:text-error transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 animate-slide-up">
                    {/* Add word to collection */}
                    <div className="flex gap-2 mb-4">
                      <select
                        value={selectedWordId}
                        onChange={(e) => setSelectedWordId(e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-lowest rounded-xl text-body-md text-on-surface focus:shadow-glow-sm"
                      >
                        <option value="">Select a word to add...</option>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {userWords.map((uw: any) => (
                          <option key={uw.word_id} value={uw.word_id}>{uw.words?.word}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => { setAddingWord(col.id); handleAddWord(col.id); }}
                        disabled={!selectedWordId || addingWord === col.id}
                        className="px-4 py-2 bg-primary-container text-white rounded-xl text-body-sm hover:brightness-110 disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>

                    {/* Words */}
                    {col.words.length > 0 ? (
                      <div className="space-y-2">
                        {col.words.map((w) => (
                          <div key={w.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-container group">
                            <Link href={`/dashboard/search?q=${encodeURIComponent(w.words?.word)}`} className="flex-1">
                              <span className="text-title-sm text-on-surface font-serif italic">{w.words?.word}</span>
                              <span className="text-body-sm text-on-surface-variant ml-3">{w.words?.definition?.slice(0, 60)}...</span>
                            </Link>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${getDifficultyColor(w.words?.difficulty as 'beginner')}`}>
                              {w.words?.difficulty}
                            </span>
                            <button
                              onClick={() => handleRemoveWord(col.id, w.words?.word)}
                              className="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ))}
                        {col.wordCount > 5 && (
                          <p className="text-body-sm text-on-surface-variant text-center pt-2">
                            +{col.wordCount - 5} more words
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-body-md text-on-surface-variant text-center py-4">
                        No words yet — select one above to add
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-low rounded-2xl">
          <span className="material-symbols-outlined text-outline text-5xl mb-4 block">folder_open</span>
          <h3 className="text-headline-sm text-on-surface mb-2">No collections yet</h3>
          <p className="text-body-lg text-on-surface-variant">
            Create your first collection to organize words by theme
          </p>
        </div>
      )}
    </div>
  );
}
