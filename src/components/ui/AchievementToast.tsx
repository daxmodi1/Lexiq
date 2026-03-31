'use client';

import { useEffect, useState } from 'react';

interface AchievementToastProps {
  badgeName: string;
  onClose: () => void;
}

export default function AchievementToast({ badgeName, onClose }: AchievementToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-24 lg:bottom-8 right-8 z-50 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-4 bg-surface-container rounded-2xl shadow-ambient-lg border-ghost-visible">
        <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center">
          <span className="material-symbols-outlined text-amber-400 text-[22px]">emoji_events</span>
        </div>
        <div>
          <p className="text-label-sm text-amber-400 normal-case">Achievement Unlocked</p>
          <p className="text-title-sm text-on-surface">{badgeName}</p>
        </div>
        <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 text-outline hover:text-on-surface">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
