'use client';

import Link from 'next/link';
import MasteryBadge from '@/components/word/MasteryBadge';
import MeasuredChart from '@/components/charts/MeasuredChart';
import type { Word } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

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

const MASTERY_COLORS = ['#f87171', '#fb923c', '#60a5fa', '#34d399', '#c084fc'];

export default function DashboardContent({
  displayName,
  streakCount,
  totalWords,
  averageMastery,
  masteryDistribution,
  reviewQueueCount,
  recentWords,
}: DashboardContentProps) {
  const firstName = displayName.split(' ')[0];

  const masteryData = [
    { name: 'Learning', value: masteryDistribution.learning },
    { name: 'Familiar', value: masteryDistribution.familiar },
    { name: 'Practiced', value: masteryDistribution.practiced },
    { name: 'Proficient', value: masteryDistribution.proficient },
    { name: 'Mastered', value: masteryDistribution.mastered },
  ].filter((d) => d.value > 0);

  const totalMasteryCount = masteryData.reduce((sum, d) => sum + d.value, 0);

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
              ? `Your lexicon holds ${totalWords} words with an average mastery of ${averageMastery}%.${reviewQueueCount > 0 ? ` ${reviewQueueCount} words need review.` : ''}`
              : 'Your journey begins here. Search for your first word and start building your personal lexicon.'}
          </p>
          {totalWords === 0 && (
            <Link
              href="/dashboard/search"
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
        <StatCard icon="menu_book" label="Total Words" value={totalWords.toString()} iconColor="text-primary" />
        <StatCard icon="trending_up" label="Avg. Mastery" value={`${averageMastery}%`} iconColor="text-emerald-400" />
        <StatCard icon="local_fire_department" label="Day Streak" value={streakCount.toString()} iconColor="text-amber-400" />
        <StatCard icon="refresh" label="Review Queue" value={reviewQueueCount.toString()} iconColor="text-rose-400" href="/dashboard/vocabulary?filter=review" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mastery Chart */}
        <div className="lg:col-span-2 bg-surface-low rounded-2xl p-6 lg:p-8">
          <h2 className="text-headline-sm text-on-surface mb-4">Mastery Overview</h2>
          {totalMasteryCount > 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              {/* Recharts Pie */}
              <MeasuredChart className="h-56 w-56 flex-shrink-0">
                {({ width, height }) => (
                  <PieChart width={width} height={height}>
                    <Pie
                      data={masteryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={55}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {masteryData.map((entry, i) => {
                        const colorIndex = ['Learning', 'Familiar', 'Practiced', 'Proficient', 'Mastered'].indexOf(entry.name);
                        return <Cell key={i} fill={MASTERY_COLORS[colorIndex >= 0 ? colorIndex : i]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1c2028',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#dfe2ee',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                )}
              </MeasuredChart>

              {/* Legend */}
              <div className="flex-1 space-y-3 w-full">
                {[
                  { label: 'Learning', count: masteryDistribution.learning, color: 'bg-red-400' },
                  { label: 'Familiar', count: masteryDistribution.familiar, color: 'bg-orange-400' },
                  { label: 'Practiced', count: masteryDistribution.practiced, color: 'bg-blue-400' },
                  { label: 'Proficient', count: masteryDistribution.proficient, color: 'bg-emerald-400' },
                  { label: 'Mastered', count: masteryDistribution.mastered, color: 'bg-purple-400' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-body-md text-on-surface-variant flex-1">{item.label}</span>
                    <span className="text-title-sm text-on-surface">{item.count}</span>
                    <span className="text-body-sm text-on-surface-variant w-10 text-right">
                      {totalMasteryCount > 0 ? Math.round((item.count / totalMasteryCount) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-outline text-4xl mb-3 block">bar_chart</span>
              <p className="text-body-md text-on-surface-variant">Add words to see your mastery distribution</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <QuickAction href="/dashboard/search" icon="search" title="Explore Words" desc="Look up any word" color="bg-primary/10" textColor="text-primary" />
          <QuickAction href="/dashboard/quiz/daily" icon="workspace_premium" title="Daily Challenge" desc="Definition matching" color="bg-amber-400/10" textColor="text-amber-400" />
          <QuickAction href="/dashboard/quiz/timed" icon="timer" title="Timed Challenge" desc="60-second blitz" color="bg-rose-400/10" textColor="text-rose-400" />
          <QuickAction href="/dashboard/quiz/fill-blank" icon="edit_note" title="Fill in the Blank" desc="AI-generated sentences" color="bg-purple-400/10" textColor="text-purple-400" />
          <QuickAction href="/dashboard/daily-word" icon="today" title="Word of the Day" desc="Today's featured word" color="bg-emerald-400/10" textColor="text-emerald-400" />
        </div>
      </div>

      {/* Review Queue Alert */}
      {reviewQueueCount > 0 && (
        <Link href="/dashboard/vocabulary?filter=review" className="block bg-amber-400/8 rounded-2xl p-6 hover:bg-amber-400/12 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-[24px]">notification_important</span>
            </div>
            <div className="flex-1">
              <h3 className="text-title-md text-amber-400 group-hover:brightness-110 transition-all">
                {reviewQueueCount} {reviewQueueCount === 1 ? 'word needs' : 'words need'} review
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                These words haven&apos;t been reviewed recently. Practice them to maintain mastery.
              </p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-amber-400 transition-colors">
              arrow_forward
            </span>
          </div>
        </Link>
      )}

      {/* Recent Activity */}
      {recentWords.length > 0 && (
        <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-headline-sm text-on-surface">Recent Activity</h2>
            <Link href="/dashboard/vocabulary" className="text-label-lg text-primary hover:underline normal-case">View all</Link>
          </div>
          <div className="space-y-3">
            {recentWords.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/search?q=${encodeURIComponent(item.words?.word || '')}`}
                className="flex items-center justify-between py-3 border-b border-ghost last:border-0 hover:bg-surface-container -mx-4 px-4 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-title-md text-on-surface font-serif italic">{item.words?.word}</h4>
                    <p className="text-body-sm text-on-surface-variant truncate max-w-xs">{item.words?.definition}</p>
                  </div>
                </div>
                <MasteryBadge score={item.mastery_score} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, iconColor, href }: { icon: string; label: string; value: string; iconColor: string; href?: string }) {
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

function QuickAction({ href, icon, title, desc, color, textColor }: { href: string; icon: string; title: string; desc: string; color: string; textColor: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 bg-surface-low rounded-2xl p-5 hover:bg-surface-container transition-colors group">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <span className={`material-symbols-outlined ${textColor} text-[20px]`}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-title-sm text-on-surface group-hover:${textColor} transition-colors`}>{title}</h3>
        <p className="text-body-sm text-on-surface-variant">{desc}</p>
      </div>
    </Link>
  );
}
