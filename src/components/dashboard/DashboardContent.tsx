'use client';

import Link from 'next/link';
import MasteryBadge from '@/components/word/MasteryBadge';
import type { Word } from '@/lib/types';

interface DashboardContentProps {
  displayName: string;
  streakCount: number;
  totalWords: number;
  averageMastery: number;
  masteryDistribution: {
    learning: number;
    familiar: number;
    practiced: number;
    proficient: number;
    mastered: number;
  };
  difficultyBreakdown: {
    beginner: number;
    intermediate: number;
    advanced: number;
    rare: number;
  };
  reviewQueueCount: number;
  recentWords: Array<{
    id: string;
    mastery_score: number;
    date_added: string;
    words: Word;
  }>;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardContent({
  displayName,
  streakCount,
  totalWords,
  averageMastery,
  masteryDistribution,
  difficultyBreakdown,
  reviewQueueCount,
  recentWords,
}: DashboardContentProps) {
  const firstName = displayName.split(' ')[0];
  const masteryItems = [
    { label: 'Learning', count: masteryDistribution.learning, color: 'bg-red-400' },
    { label: 'Familiar', count: masteryDistribution.familiar, color: 'bg-orange-400' },
    { label: 'Practiced', count: masteryDistribution.practiced, color: 'bg-blue-400' },
    { label: 'Proficient', count: masteryDistribution.proficient, color: 'bg-emerald-400' },
    { label: 'Mastered', count: masteryDistribution.mastered, color: 'bg-purple-400' },
  ];
  const totalMasteryCount = masteryItems.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Hero Greeting */}
      <div className="bg-hero-gradient rounded-2xl p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-display-md text-on-surface mb-3">
            {getGreeting()}, <span className="italic">{firstName}.</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            {totalWords > 0
              ? `Your lexicon holds ${totalWords} words with an average mastery of ${averageMastery}%. Ready to delve into today's curated selections?`
              : 'Your journey begins here. Search for your first word and start building your personal lexicon.'}
          </p>
          {totalWords === 0 && (
            <Link
              href="/search"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all shadow-glow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              Explore your first word
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="menu_book"
          label="Total Words"
          value={totalWords.toString()}
          iconColor="text-primary"
        />
        <StatCard
          icon="trending_up"
          label="Avg. Mastery"
          value={`${averageMastery}%`}
          iconColor="text-emerald-400"
        />
        <StatCard
          icon="local_fire_department"
          label="Day Streak"
          value={streakCount.toString()}
          iconColor="text-amber-400"
        />
        <StatCard
          icon="refresh"
          label="Review Queue"
          value={reviewQueueCount.toString()}
          iconColor="text-rose-400"
          href="/vocabulary?filter=review"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mastery Breakdown */}
        <div className="lg:col-span-2 bg-surface-low rounded-2xl p-6 lg:p-8">
          <h2 className="text-headline-sm text-on-surface mb-6">Mastery Breakdown</h2>
          {totalMasteryCount > 0 ? (
            <div className="space-y-4">
              {masteryItems.map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="text-body-md text-on-surface-variant w-24">{item.label}</span>
                  <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-700`}
                      style={{ width: `${totalMasteryCount > 0 ? (item.count / totalMasteryCount) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-title-sm text-on-surface w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-outline text-4xl mb-3 block">bar_chart</span>
              <p className="text-body-md text-on-surface-variant">
                Add words to see your mastery distribution
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link
            href="/search"
            className="flex items-center gap-4 bg-surface-low rounded-2xl p-6 hover:bg-surface-container transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[22px]">search</span>
            </div>
            <div>
              <h3 className="text-title-md text-on-surface group-hover:text-primary transition-colors">Explore Words</h3>
              <p className="text-body-sm text-on-surface-variant">Look up any word instantly</p>
            </div>
          </Link>
          <Link
            href="/quiz/daily"
            className="flex items-center gap-4 bg-surface-low rounded-2xl p-6 hover:bg-surface-container transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-[22px]">workspace_premium</span>
            </div>
            <div>
              <h3 className="text-title-md text-on-surface group-hover:text-amber-400 transition-colors">Daily Challenge</h3>
              <p className="text-body-sm text-on-surface-variant">Test your knowledge today</p>
            </div>
          </Link>
          <Link
            href="/vocabulary"
            className="flex items-center gap-4 bg-surface-low rounded-2xl p-6 hover:bg-surface-container transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-400/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-emerald-400 text-[22px]">menu_book</span>
            </div>
            <div>
              <h3 className="text-title-md text-on-surface group-hover:text-emerald-400 transition-colors">My Words</h3>
              <p className="text-body-sm text-on-surface-variant">{totalWords} words in your lexicon</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {recentWords.length > 0 && (
        <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-sm text-on-surface">Recent Activity</h2>
            <Link href="/vocabulary" className="text-label-lg text-primary hover:underline normal-case">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentWords.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 border-b border-ghost last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-title-md text-on-surface font-serif italic">{item.words?.word}</h4>
                    <p className="text-body-sm text-on-surface-variant truncate max-w-xs">
                      {item.words?.definition}
                    </p>
                  </div>
                </div>
                <MasteryBadge score={item.mastery_score} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  iconColor,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  iconColor: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-surface-low rounded-2xl p-5 ${href ? 'hover:bg-surface-container cursor-pointer' : ''} transition-colors`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`material-symbols-outlined ${iconColor} text-[22px]`}>{icon}</span>
        <span className="text-label-md text-on-surface-variant normal-case">{label}</span>
      </div>
      <p className="text-display-sm text-on-surface" style={{ fontSize: '2rem' }}>{value}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
