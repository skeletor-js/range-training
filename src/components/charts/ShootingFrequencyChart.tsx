import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Session } from '@/types';

type Period = 'monthly' | 'yearly';

interface FrequencyData {
  period: string;
  sessions: number;
  displayLabel: string;
}

interface ShootingFrequencyChartProps {
  sessions: Session[];
  className?: string;
}

function getMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getYearLabel(yearStr: string): string {
  return yearStr;
}

export function ShootingFrequencyChart({ sessions, className }: ShootingFrequencyChartProps) {
  const [period, setPeriod] = useState<Period>('monthly');

  const data = useMemo(() => {
    if (sessions.length === 0) return [];

    const grouped = new Map<string, number>();

    for (const session of sessions) {
      const date = session.date.split('T')[0];
      const key = period === 'monthly'
        ? date.substring(0, 7) // YYYY-MM
        : date.substring(0, 4); // YYYY

      grouped.set(key, (grouped.get(key) || 0) + 1);
    }

    // Convert to array and sort chronologically
    const result: FrequencyData[] = Array.from(grouped.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([periodKey, count]) => ({
        period: periodKey,
        sessions: count,
        displayLabel: period === 'monthly'
          ? getMonthLabel(periodKey)
          : getYearLabel(periodKey),
      }));

    // Limit to last 12 months or last 5 years
    const limit = period === 'monthly' ? 12 : 5;
    return result.slice(-limit);
  }, [sessions, period]);

  if (sessions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Training Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
            Complete sessions to see your training frequency
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const avgPerPeriod = data.length > 0 ? totalSessions / data.length : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Training Frequency</CardTitle>
          <div className="flex gap-1">
            <Button
              variant={period === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setPeriod('monthly')}
            >
              Monthly
            </Button>
            <Button
              variant={period === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setPeriod('yearly')}
            >
              Yearly
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
            <XAxis
              dataKey="displayLabel"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={30}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const item = payload[0].payload as FrequencyData;
                  return (
                    <div className="bg-popover border rounded-md p-2 shadow-md">
                      <p className="font-medium text-sm">
                        {item.sessions} session{item.sessions !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {period === 'monthly' ? getMonthLabel(item.period) : item.period}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="sessions"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="flex justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
          <span>
            Avg: <span className="font-medium text-foreground">{avgPerPeriod.toFixed(1)}</span> sessions/{period === 'monthly' ? 'mo' : 'yr'}
          </span>
          <span>
            Total: <span className="font-medium text-foreground">{totalSessions}</span> sessions
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
