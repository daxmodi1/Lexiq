'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface TopBarProps {
  streakCount?: number;
  userName?: string;
}

export default function TopBar({ streakCount = 0, userName }: TopBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-ghost">
      <div className="flex items-center justify-between px-6 py-4 lg:px-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] transition-colors group-focus-within:text-primary">
              search
            </span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Look up any word..."
              className="w-full pl-12 pr-4 py-3 bg-surface-lowest rounded-xl text-body-lg text-on-surface placeholder:text-outline transition-all focus:shadow-glow-sm"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-6">
          {/* Streak Badge */}
          {streakCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-full">
              <span className="text-amber-400 text-lg">🔥</span>
              <span className="text-amber-400 text-title-sm">{streakCount}</span>
            </div>
          )}

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center hover:bg-surface-highest transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                person
              </span>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-12 w-48 bg-surface-container rounded-xl shadow-ambient-lg border-ghost-visible z-50 animate-slide-up overflow-hidden">
                  {userName && (
                    <div className="px-4 py-3 border-b border-ghost">
                      <p className="text-body-sm text-on-surface-variant">{userName}</p>
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-body-md text-on-surface-variant hover:bg-surface-high hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
