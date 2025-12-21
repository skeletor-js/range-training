import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDrillValue } from '@/lib/drillTrendUtils';
import { formatShortDate } from '@/lib/formatUtils';
import type { TrendDataPoint } from '@/types';

interface DrillTrendChartProps {
  data: TrendDataPoint[];
  scoringType: 'time' | 'points' | 'pass_fail' | 'hits' | null;
  className?: string;
}

export function DrillTrendChart({ data, scoringType, className }: DrillTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Log attempts to see your progress
          </div>
        </CardContent>
      </Card>
    );
  }

  // For time-based drills, lower is better (reverse Y axis)
  const isLowerBetter = scoringType === 'time';

  // Format date for display
  const formattedData = data.map((d) => ({
    ...d,
    displayDate: formatShortDate(d.date),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={formattedData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              reversed={isLowerBetter}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(value) => {
                if (scoringType === 'time') return `${value}s`;
                return String(value);
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const point = payload[0].payload as TrendDataPoint & { displayDate: string };
                  return (
                    <div className="bg-popover border rounded-md p-2 shadow-md">
                      <p className="text-sm font-medium">
                        {formatDrillValue(point.value, scoringType)}
                      </p>
                      <p className="text-xs text-muted-foreground">{point.displayDate}</p>
                      {point.isPB && (
                        <p className="text-xs text-primary font-medium">Personal Best!</p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.isPB) {
                  return (
                    <circle
                      key={payload.attemptId}
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill="hsl(var(--primary))"
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    />
                  );
                }
                return (
                  <circle
                    key={payload.attemptId}
                    cx={cx}
                    cy={cy}
                    r={3}
                    fill="hsl(var(--primary))"
                  />
                );
              }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
