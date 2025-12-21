import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // 1-5
  size?: 'sm' | 'md' | 'lg';
  showEmpty?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StarRating({
  rating,
  size = 'md',
  showEmpty = true,
  className,
}: StarRatingProps) {
  const filledStars = Math.min(Math.max(Math.round(rating), 0), 5);
  const emptyStars = showEmpty ? 5 - filledStars : 0;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {/* Filled stars */}
      {Array.from({ length: filledStars }).map((_, i) => (
        <Star
          key={`filled-${i}`}
          className={cn(sizeMap[size], 'fill-amber-500 text-amber-500')}
        />
      ))}
      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(sizeMap[size], 'text-muted-foreground/30')}
        />
      ))}
    </div>
  );
}
