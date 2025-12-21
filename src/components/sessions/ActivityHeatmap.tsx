import HeatMap from '@uiw/react-heat-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HeatmapDataPoint } from '@/types';

interface ActivityHeatmapProps {
  data: HeatmapDataPoint[];
  onDayClick?: (date: string) => void;
}

export function ActivityHeatmap({ data, onDayClick }: ActivityHeatmapProps) {
  // Transform data for the heatmap library
  const heatmapData = data.map((point) => ({
    date: point.date,
    count: point.count,
  }));

  // Get date range (past 365 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <HeatMap
          value={heatmapData}
          startDate={startDate}
          endDate={endDate}
          width="100%"
          style={{ color: 'hsl(var(--foreground))' }}
          panelColors={{
            0: 'hsl(var(--muted))',
            1: 'hsl(25 60% 30%)',
            2: 'hsl(25 80% 40%)',
            4: 'hsl(25 100% 50%)',
            8: 'hsl(25 100% 60%)',
          }}
          rectProps={{
            rx: 2,
          }}
          legendCellSize={0}
          rectSize={10}
          space={2}
          rectRender={(props, data) => {
            if (!onDayClick || !data.date) return <rect {...props} />;
            return (
              <rect
                {...props}
                onClick={() => onDayClick(data.date)}
                style={{ cursor: 'pointer' }}
              />
            );
          }}
        />
        <div className="flex items-center justify-end gap-2 mt-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'hsl(var(--muted))' }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'hsl(25 60% 30%)' }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'hsl(25 80% 40%)' }}
            />
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: 'hsl(25 100% 50%)' }}
            />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
