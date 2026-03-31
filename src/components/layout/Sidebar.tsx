'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/search', icon: 'search', label: 'Explore' },
  { href: '/dashboard/vocabulary', icon: 'menu_book', label: 'My Words' },
  { href: '/dashboard/collections', icon: 'folder', label: 'Collections' },
  { href: '/dashboard/daily-word', icon: 'today', label: 'Word of the Day' },
  { href: '/dashboard/quiz/daily', icon: 'workspace_premium', label: 'Daily Challenge' },
  { href: '/dashboard/quiz/timed', icon: 'timer', label: 'Timed Challenge' },
  { href: '/dashboard/quiz/fill-blank', icon: 'edit_note', label: 'Fill in Blank' },
];

const bottomItems = [
  { href: '/dashboard/settings', icon: 'person', label: 'Profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-surface-low z-40">
        {/* Logo */}
        <div className="px-6 py-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shadow-glow-sm transition-shadow group-hover:shadow-glow">
              <span className="text-white font-serif text-lg font-bold italic">L</span>
            </div>
            <span className="text-display-sm text-on-surface tracking-tight" style={{ fontSize: '1.5rem' }}>
              LEXIQ
            </span>
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-container/15 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] transition-colors ${
                  isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                }`}>
                  {item.icon}
                </span>
                <span className="text-title-sm">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 pb-6 space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-body-sm">{item.label}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-ghost">
        <div className="flex items-center justify-around px-2 py-2">
          {[navItems[0], navItems[2], navItems[1], navItems[3]].map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
