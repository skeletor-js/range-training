import { Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DatabaseStats {
  firearms: number;
  ammo: number;
  sessions: number;
  targets: number;
  shots: number;
  drills: number;
}

interface DatabaseStatsCardProps {
  stats: DatabaseStats | null;
}

export function DatabaseStatsCard({ stats }: DatabaseStatsCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database
        </CardTitle>
        <CardDescription>
          Your data is stored locally on this device
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Weapons</p>
              <p className="text-lg font-semibold">{stats.firearms}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ammo Types</p>
              <p className="text-lg font-semibold">{stats.ammo}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sessions</p>
              <p className="text-lg font-semibold">{stats.sessions}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Targets</p>
              <p className="text-lg font-semibold">{stats.targets}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Shots</p>
              <p className="text-lg font-semibold">{stats.shots}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Drills</p>
              <p className="text-lg font-semibold">{stats.drills}</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Loading...</p>
        )}
      </CardContent>
    </Card>
  );
}
