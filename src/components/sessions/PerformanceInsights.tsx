import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Crosshair, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TargetWithShots } from '@/types';

interface PerformanceInsightsProps {
  targets: TargetWithShots[];
  isLoading?: boolean;
}

interface InsightData {
  averageGroupSize: number | null;
  averageGroupSizeTrend: 'improving' | 'declining' | 'stable' | null;
  averagePoaOffset: number | null;
  bestGroupSize: number | null;
  totalShots: number;
}

function calculateInsights(targets: TargetWithShots[]): InsightData {
  if (targets.length === 0) {
    return {
      averageGroupSize: null,
      averageGroupSizeTrend: null,
      averagePoaOffset: null,
      bestGroupSize: null,
      totalShots: 0,
    };
  }

  const targetsWithSpread = targets.filter((t) => t.extremeSpread !== null);
  const targetsWithCenter = targets.filter(
    (t) => t.groupCenterX !== null && t.groupCenterY !== null
  );

  // Average group size
  const averageGroupSize =
    targetsWithSpread.length > 0
      ? targetsWithSpread.reduce((sum, t) => sum + (t.extremeSpread ?? 0), 0) /
        targetsWithSpread.length
      : null;

  // Best group size
  const bestGroupSize =
    targetsWithSpread.length > 0
      ? Math.min(...targetsWithSpread.map((t) => t.extremeSpread ?? Infinity))
      : null;

  // Average POA offset
  const averagePoaOffset =
    targetsWithCenter.length > 0
      ? targetsWithCenter.reduce((sum, t) => {
          const x = t.groupCenterX ?? 0;
          const y = t.groupCenterY ?? 0;
          return sum + Math.sqrt(x * x + y * y);
        }, 0) / targetsWithCenter.length
      : null;

  // Total shots
  const totalShots = targets.reduce((sum, t) => sum + t.shotCount, 0);

  // Calculate trend (compare first half vs second half)
  let averageGroupSizeTrend: InsightData['averageGroupSizeTrend'] = null;
  if (targetsWithSpread.length >= 4) {
    const midpoint = Math.floor(targetsWithSpread.length / 2);
    const olderTargets = targetsWithSpread.slice(midpoint);
    const newerTargets = targetsWithSpread.slice(0, midpoint);

    const olderAvg =
      olderTargets.reduce((sum, t) => sum + (t.extremeSpread ?? 0), 0) / olderTargets.length;
    const newerAvg =
      newerTargets.reduce((sum, t) => sum + (t.extremeSpread ?? 0), 0) / newerTargets.length;

    const improvement = olderAvg - newerAvg;
    const threshold = olderAvg * 0.1; // 10% threshold for significant change

    if (improvement > threshold) {
      averageGroupSizeTrend = 'improving';
    } else if (improvement < -threshold) {
      averageGroupSizeTrend = 'declining';
    } else {
      averageGroupSizeTrend = 'stable';
    }
  }

  return {
    averageGroupSize,
    averageGroupSizeTrend,
    averagePoaOffset,
    bestGroupSize,
    totalShots,
  };
}

export function PerformanceInsights({ targets, isLoading }: PerformanceInsightsProps) {
  const insights = useMemo(() => calculateInsights(targets), [targets]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (targets.length === 0) {
    return null; // Don't show if no targets
  }

  const TrendIcon =
    insights.averageGroupSizeTrend === 'improving'
      ? TrendingDown // Lower is better for group size
      : insights.averageGroupSizeTrend === 'declining'
        ? TrendingUp
        : Minus;

  const trendColor =
    insights.averageGroupSizeTrend === 'improving'
      ? 'text-green-600 dark:text-green-400'
      : insights.averageGroupSizeTrend === 'declining'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

  const trendLabel =
    insights.averageGroupSizeTrend === 'improving'
      ? 'Groups are tightening!'
      : insights.averageGroupSizeTrend === 'declining'
        ? 'Groups are widening'
        : 'Consistent performance';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4" />
          Performance Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Average Group Size */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Crosshair className="h-3 w-3" />
              <span>Avg Group Size</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">
                {insights.averageGroupSize !== null
                  ? `${insights.averageGroupSize.toFixed(2)}"`
                  : '—'}
              </span>
              {insights.averageGroupSizeTrend && (
                <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              )}
            </div>
            {insights.averageGroupSizeTrend && (
              <p className={`text-xs ${trendColor}`}>{trendLabel}</p>
            )}
          </div>

          {/* Best Group */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Award className="h-3 w-3" />
              <span>Best Group</span>
            </div>
            <div className="text-xl font-bold">
              {insights.bestGroupSize !== null ? `${insights.bestGroupSize.toFixed(2)}"` : '—'}
            </div>
            <p className="text-xs text-muted-foreground">Personal best</p>
          </div>

          {/* POA Consistency */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>POA Offset</span>
            </div>
            <div className="text-xl font-bold">
              {insights.averagePoaOffset !== null
                ? `${insights.averagePoaOffset.toFixed(2)}"`
                : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.averagePoaOffset !== null && insights.averagePoaOffset < 1
                ? 'Excellent centering'
                : insights.averagePoaOffset !== null && insights.averagePoaOffset < 2
                  ? 'Good centering'
                  : 'Work on POA'}
            </p>
          </div>

          {/* Total Shots */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>Shots Tracked</span>
            </div>
            <div className="text-xl font-bold">{insights.totalShots}</div>
            <p className="text-xs text-muted-foreground">Across {targets.length} targets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
