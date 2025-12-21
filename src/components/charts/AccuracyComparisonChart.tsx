import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDrillValue } from '@/lib/drillTrendUtils';
import type { DrillAttempt, Firearm } from '@/types';

interface FirearmStats {
  firearmId: string;
  firearmName: string;
  avgScore: number;
  bestScore: number;
  attemptCount: number;
}

interface AccuracyComparisonChartProps {
  attempts: DrillAttempt[];
  firearms: Firearm[];
  scoringType: 'time' | 'points' | 'pass_fail' | 'hits' | null;
  className?: string;
}

export function AccuracyComparisonChart({
  attempts,
  firearms,
  scoringType,
  className,
}: AccuracyComparisonChartProps) {
  const data = useMemo(() => {
    // Group attempts by firearm
    const byFirearm = new Map<string, DrillAttempt[]>();

    for (const attempt of attempts) {
      if (!attempt.firearmId) continue;
      const existing = byFirearm.get(attempt.firearmId) || [];
      existing.push(attempt);
      byFirearm.set(attempt.firearmId, existing);
    }

    // Calculate stats for each firearm
    const stats: FirearmStats[] = [];

    for (const [firearmId, firearmAttempts] of byFirearm.entries()) {
      const firearm = firearms.find((f) => f.id === firearmId);
      if (!firearm) continue;

      const values = firearmAttempts
        .map((a) => {
          if (scoringType === 'time' && a.timeSeconds != null) return a.timeSeconds;
          if (scoringType === 'points' && a.points != null) return a.points;
          if (scoringType === 'hits' && a.hits != null) return a.hits;
          return null;
        })
        .filter((v): v is number => v !== null);

      if (values.length === 0) continue;

      const isLowerBetter = scoringType === 'time';
      const avgScore = values.reduce((sum, v) => sum + v, 0) / values.length;
      const bestScore = isLowerBetter
        ? Math.min(...values)
        : Math.max(...values);

      stats.push({
        firearmId,
        firearmName: firearm.name,
        avgScore: Math.round(avgScore * 100) / 100,
        bestScore,
        attemptCount: firearmAttempts.length,
      });
    }

    // Sort by best score (ascending for time, descending for others)
    const isLowerBetter = scoringType === 'time';
    stats.sort((a, b) =>
      isLowerBetter
        ? a.bestScore - b.bestScore
        : b.bestScore - a.bestScore
    );

    return stats;
  }, [attempts, firearms, scoringType]);

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Performance by Firearm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Log attempts with different firearms to compare
          </div>
        </CardContent>
      </Card>
    );
  }

  const isLowerBetter = scoringType === 'time';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Performance by Firearm</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 50)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, bottom: 5, left: 100 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={isLowerBetter ? [0, 'auto'] : [0, 'dataMax']}
              tickFormatter={(value) => formatDrillValue(value, scoringType)}
            />
            <YAxis
              type="category"
              dataKey="firearmName"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={95}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const item = payload[0].payload as FirearmStats;
                  return (
                    <div className="bg-popover border rounded-md p-3 shadow-md">
                      <p className="font-medium text-sm">{item.firearmName}</p>
                      <div className="mt-1 space-y-0.5 text-xs">
                        <p>
                          <span className="text-muted-foreground">Best: </span>
                          <span className="font-medium text-primary">
                            {formatDrillValue(item.bestScore, scoringType)}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Avg: </span>
                          {formatDrillValue(item.avgScore, scoringType)}
                        </p>
                        <p className="text-muted-foreground">
                          {item.attemptCount} attempt{item.attemptCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="bestScore" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={entry.firearmId}
                  fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  fillOpacity={index === 0 ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
