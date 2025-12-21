import { cn } from '@/lib/utils';

type RatingLevel = 'excellent' | 'good' | 'fair' | 'poor';

interface RatingBadgeProps {
  rating: RatingLevel;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

const colorMap: Record<RatingLevel, string> = {
  excellent: 'bg-green-500/20 text-green-500 border-green-500/30',
  good: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  fair: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  poor: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const sizeMap = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
};

export function RatingBadge({
  rating,
  label,
  size = 'sm',
  className,
}: RatingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium uppercase tracking-wide',
        colorMap[rating],
        sizeMap[size],
        className
      )}
    >
      {label}: {rating}
    </span>
  );
}

/**
 * Get the appropriate color class for a rating level
 * Useful for text or icons outside of the badge component
 */
export function getRatingColor(rating: RatingLevel): string {
  switch (rating) {
    case 'excellent':
      return 'text-green-500';
    case 'good':
      return 'text-blue-500';
    case 'fair':
      return 'text-yellow-500';
    case 'poor':
      return 'text-red-500';
  }
}
