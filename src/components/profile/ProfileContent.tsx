'use client';

import { useState, useMemo } from 'react';
import MeasuredChart from '@/components/charts/MeasuredChart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const BADGE_INFO: Record<string, { name: string; description: string; icon: string; color: string }> = {
  first_word: { name: 'First Step', description: 'Added your first word', icon: 'star', color: 'text-amber-400' },
  ten_words: { name: 'Word Collector', description: 'Added 10 words', icon: 'collections_bookmark', color: 'text-blue-400' },
  fifty_words: { name: 'Lexicon Builder', description: 'Added 50 words', icon: 'library_books', color: 'text-purple-400' },
  hundred_words: { name: 'Centurion', description: 'Added 100 words', icon: 'emoji_events', color: 'text-amber-400' },
  first_mastery: { name: 'First Mastery', description: 'Mastered your first word', icon: 'workspace_premium', color: 'text-emerald-400' },
  ten_mastered: { name: 'Expert', description: 'Mastered 10 words', icon: 'military_tech', color: 'text-amber-400' },
  first_quiz: { name: 'Quiz Taker', description: 'Completed your first quiz', icon: 'quiz', color: 'text-blue-400' },
  ten_quizzes: { name: 'Quiz Pro', description: 'Completed 10 quizzes', icon: 'school', color: 'text-emerald-400' },
  streak_3: { name: 'On Fire', description: '3-day streak', icon: 'local_fire_department', color: 'text-orange-400' },
  streak_7: { name: 'Weekly Warrior', description: '7-day streak', icon: 'bolt', color: 'text-amber-400' },
  streak_30: { name: 'Monthly Master', description: '30-day streak', icon: 'diamond', color: 'text-purple-400' },
};

interface ProfileContentProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userWords: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quizHistory: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  achievements: any[];
}

export default function ProfileContent({ profile, email, userWords, quizHistory, achievements }: ProfileContentProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mastery distribution for pie chart
  const masteryData = useMemo(() => {
    const dist = { Learning: 0, Familiar: 0, Practiced: 0, Proficient: 0, Mastered: 0 };
    userWords.forEach((uw) => {
      const s = uw.mastery_score;
      if (s < 30) dist.Learning++;
      else if (s < 60) dist.Familiar++;
      else if (s < 80) dist.Practiced++;
      else if (s < 95) dist.Proficient++;
      else dist.Mastered++;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value })).filter((d) => d.value > 0);
  }, [userWords]);

  // Difficulty distribution for bar chart
  const difficultyData = useMemo(() => {
    const dist: Record<string, number> = { beginner: 0, intermediate: 0, advanced: 0, rare: 0 };
    userWords.forEach((uw) => {
      const diff = uw.words?.difficulty as string;
      if (diff in dist) dist[diff]++;
    });
    return Object.entries(dist).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [userWords]);

  // Quiz performance by date for bar chart
  const quizPerformanceData = useMemo(() => {
    return quizHistory.slice(0, 10).reverse().map((q) => ({
      date: new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: q.score,
      total: q.words_tested,
      type: q.session_type,
    }));
  }, [quizHistory]);

  const MASTERY_COLORS = ['#f87171', '#fb923c', '#60a5fa', '#34d399', '#c084fc'];
  const DIFFICULTY_COLORS = ['#34d399', '#fbbf24', '#f87171', '#a78bfa'];

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  // All badges with earned status
  const allBadges = Object.entries(BADGE_INFO).map(([type, info]) => ({
    type,
    ...info,
    earned: achievements.some((a: { badge_type: string }) => a.badge_type === type),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-display-sm text-on-surface mb-2">Profile & Settings</h1>
        <p className="text-body-lg text-on-surface-variant">Your learning journey at a glance</p>
      </div>

      {/* Profile Card */}
      <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-serif font-bold italic">
              {(displayName || email)[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <label className="text-label-lg text-on-surface-variant block mb-2">Display Name</label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 max-w-sm px-4 py-2.5 bg-surface-lowest rounded-xl text-body-lg text-on-surface focus:shadow-glow-sm"
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-primary-container text-white rounded-xl text-title-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save'}
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant">{email}</p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Member since {new Date(profile?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="menu_book" value={userWords.length.toString()} label="Total Words" color="text-primary" />
        <StatCard icon="workspace_premium" value={userWords.filter((w) => w.mastery_score >= 95).length.toString()} label="Mastered" color="text-purple-400" />
        <StatCard icon="local_fire_department" value={(profile?.streak_count || 0).toString()} label="Day Streak" color="text-amber-400" />
        <StatCard icon="timer" value={(profile?.best_timed_score || 0).toString()} label="Best Timed Score" color="text-rose-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mastery Distribution Pie */}
        {masteryData.length > 0 && (
          <div className="bg-surface-low rounded-2xl p-6">
            <h3 className="text-title-lg text-on-surface mb-4">Mastery Distribution</h3>
            <MeasuredChart className="h-64">
              {({ width, height }) => (
                <PieChart width={width} height={height}>
                  <Pie data={masteryData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                    {masteryData.map((_, i) => (
                      <Cell key={i} fill={MASTERY_COLORS[i % MASTERY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1c2028', border: 'none', borderRadius: '12px', color: '#dfe2ee' }} />
                </PieChart>
              )}
            </MeasuredChart>
          </div>
        )}

        {/* Difficulty Bar Chart */}
        {userWords.length > 0 && (
          <div className="bg-surface-low rounded-2xl p-6">
            <h3 className="text-title-lg text-on-surface mb-4">Difficulty Breakdown</h3>
            <MeasuredChart className="h-64">
              {({ width, height }) => (
                <BarChart width={width} height={height} data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#31353e" />
                  <XAxis dataKey="name" tick={{ fill: '#8c909e', fontSize: 12 }} axisLine={false} />
                  <YAxis tick={{ fill: '#8c909e', fontSize: 12 }} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1c2028', border: 'none', borderRadius: '12px', color: '#dfe2ee' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {difficultyData.map((_, i) => (
                      <Cell key={i} fill={DIFFICULTY_COLORS[i % DIFFICULTY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </MeasuredChart>
          </div>
        )}
      </div>

      {/* Quiz History Chart */}
      {quizPerformanceData.length > 0 && (
        <div className="bg-surface-low rounded-2xl p-6">
          <h3 className="text-title-lg text-on-surface mb-4">Quiz Performance</h3>
          <MeasuredChart className="h-64">
            {({ width, height }) => (
              <BarChart width={width} height={height} data={quizPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#31353e" />
                <XAxis dataKey="date" tick={{ fill: '#8c909e', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#8c909e', fontSize: 12 }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c2028', border: 'none', borderRadius: '12px', color: '#dfe2ee' }}
                />
                <Bar dataKey="score" name="Correct" fill="#508ff8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total" name="Attempted" fill="#42495c" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </MeasuredChart>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
        <h3 className="text-title-lg text-on-surface mb-6">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allBadges.map((badge) => (
            <div
              key={badge.type}
              className={`rounded-xl p-4 text-center transition-all ${
                badge.earned
                  ? 'bg-surface-container'
                  : 'bg-surface-container/30 opacity-40'
              }`}
            >
              <span className={`material-symbols-outlined text-3xl mb-2 block ${badge.earned ? badge.color : 'text-outline'}`}>
                {badge.icon}
              </span>
              <p className="text-title-sm text-on-surface mb-0.5">{badge.name}</p>
              <p className="text-body-sm text-on-surface-variant">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Quizzes */}
      {quizHistory.length > 0 && (
        <div className="bg-surface-low rounded-2xl p-6 lg:p-8">
          <h3 className="text-title-lg text-on-surface mb-4">Quiz History</h3>
          <div className="space-y-2">
            {quizHistory.slice(0, 10).map((q: { id: string; session_type: string; score: number; words_tested: number; duration_seconds: number | null; created_at: string }) => (
              <div key={q.id} className="flex items-center gap-4 py-3 border-b border-ghost last:border-0">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  {q.session_type === 'timed' ? 'timer' : 'quiz'}
                </span>
                <div className="flex-1">
                  <p className="text-title-sm text-on-surface capitalize">{q.session_type.replace('_', ' ')}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-title-sm text-primary">{q.score}/{q.words_tested}</span>
                {q.duration_seconds && (
                  <span className="text-body-sm text-on-surface-variant">{q.duration_seconds}s</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className="bg-surface-low rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className={`material-symbols-outlined ${color} text-[22px]`}>{icon}</span>
        <span className="text-label-md text-on-surface-variant normal-case">{label}</span>
      </div>
      <p className="text-display-sm text-on-surface" style={{ fontSize: '2rem' }}>{value}</p>
    </div>
  );
}
