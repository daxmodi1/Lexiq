import { getMasteryTier, getMasteryColor } from '@/lib/types';

interface MasteryBadgeProps {
  score: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function MasteryBadge({ score, showScore = true, size = 'md' }: MasteryBadgeProps) {
  const tier = getMasteryTier(score);
  const colorClass = getMasteryColor(tier);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colorClass} ${sizeClasses[size]}`}>
      <span className="tracking-wide uppercase">{tier}</span>
      {showScore && (
        <span className="opacity-70">{score}</span>
      )}
    </span>
  );
}
