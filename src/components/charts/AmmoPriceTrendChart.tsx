import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPPR } from '@/lib/pprMetrics';
import type { PPRMetrics } from '@/lib/pprMetrics';

interface AmmoPriceTrendChartProps {
  metrics: PPRMetrics | null;
  className?: string;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function AmmoPriceTrendChart({ metrics, className }: AmmoPriceTrendChartProps) {
  if (!metrics || metrics.priceHistory.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm">Price Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[150px] flex items-center justify-center text-muted-foreground text-sm">
            Log purchases to see price trends
          </div>
        </CardContent>
      </Card>
    );
  }

  // Reverse to show oldest first (chronological order)
  const data = [...metrics.priceHistory].reverse().map((p) => ({
    ...p,
    displayDate: formatShortDate(p.date),
  }));

  // Calculate domain with some padding
  const pprs = data.map((d) => d.ppr);
  const minPPR = Math.min(...pprs);
  const maxPPR = Math.max(...pprs);
  const padding = (maxPPR - minPPR) * 0.1 || 0.01;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Price Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 5 }}>
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={45}
              domain={[minPPR - padding, maxPPR + padding]}
              tickFormatter={(value) => formatPPR(value)}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const point = payload[0].payload as typeof data[0];
                  return (
                    <div className="bg-popover border rounded-md p-2 shadow-md">
                      <p className="font-medium text-sm">{formatPPR(point.ppr)}/rd</p>
                      <p className="text-xs text-muted-foreground">
                        {point.quantity} rounds
                      </p>
                      {point.seller && (
                        <p className="text-xs text-muted-foreground">{point.seller}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{point.displayDate}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Average PPR reference line */}
            <ReferenceLine
              y={metrics.averagePPR}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: 'Avg',
                position: 'right',
                fontSize: 10,
                fill: 'hsl(var(--muted-foreground))',
              }}
            />
            <Line
              type="monotone"
              dataKey="ppr"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 4, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-center text-xs">
          <div>
            <p className="text-muted-foreground">Low</p>
            <p className="font-medium text-green-500">{formatPPR(metrics.lowestPPR)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Avg</p>
            <p className="font-medium">{formatPPR(metrics.averagePPR)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">High</p>
            <p className="font-medium text-red-500">{formatPPR(metrics.highestPPR)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
