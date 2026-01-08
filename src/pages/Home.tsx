import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Target, CalendarDays, Flame, TrendingUp, ChevronDown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActivityHeatmap } from '@/components/sessions/ActivityHeatmap';
import { SessionCard } from '@/components/sessions/SessionCard';
import { QuickSessionDialog } from '@/components/sessions/QuickSessionDialog';
import { TrainingRecommendations } from '@/components/training/TrainingRecommendations';
import { PerformanceInsights } from '@/components/sessions/PerformanceInsights';
import { useSessionStore } from '@/stores/sessionStore';
import { useRecommendationStore } from '@/stores/recommendationStore';
import type { HeatmapDataPoint, DashboardStats } from '@/types';

export function Home() {
  const navigate = useNavigate();
  const { sessions, loadSessions, getHeatmapData, getDashboardStats, startSession, quickSaveSession } =
    useSessionStore();
  const { recommendations, recentTargets, isLoading: recommendationsLoading, loadRecommendations } =
    useRecommendationStore();

  const [heatmapData, setHeatmapData] = useState<HeatmapDataPoint[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quickSessionOpen, setQuickSessionOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await loadSessions();
      const [heatmap, dashStats] = await Promise.all([
        getHeatmapData(),
        getDashboardStats(),
        loadRecommendations(),
      ]);
      setHeatmapData(heatmap);
      setStats(dashStats);
      setIsLoading(false);
    }
    loadData();
  }, [loadSessions, getHeatmapData, getDashboardStats, loadRecommendations]);

  const handleStartSession = () => {
    startSession();
    navigate('/sessions/live');
  };

  const handleQuickSave = async (data: { date: string; location?: string; notes?: string; weather?: string }) => {
    const sessionId = await quickSaveSession(data);
    if (sessionId) {
      // Reload stats after quick save
      const [heatmap, dashStats] = await Promise.all([
        getHeatmapData(),
        getDashboardStats(),
      ]);
      setHeatmapData(heatmap);
      setStats(dashStats);
    }
  };

  const recentSessions = sessions.slice(0, 3);

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Range Training</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and improve
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              New Session
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleStartSession}>
              <Target className="h-4 w-4 mr-2" />
              Full Session with Targets
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setQuickSessionOpen(true)}>
              <Zap className="h-4 w-4 mr-2" />
              Quick Log (Date + Notes)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Quick Session Dialog */}
      <QuickSessionDialog
        open={quickSessionOpen}
        onOpenChange={setQuickSessionOpen}
        onSave={handleQuickSave}
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs">Sessions</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalSessions}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs">Targets</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTargets}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Rounds</span>
              </div>
              <p className="text-2xl font-bold">
                {stats.totalRoundsFired.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Flame className="h-4 w-4" />
                <span className="text-xs">Streak</span>
              </div>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Insights */}
      {recentTargets.length > 0 && (
        <div className="mb-6">
          <PerformanceInsights
            targets={recentTargets}
            isLoading={recommendationsLoading}
          />
        </div>
      )}

      {/* Activity Heatmap */}
      <div className="mb-6">
        <ActivityHeatmap data={heatmapData} />
      </div>

      {/* Training Recommendations */}
      {stats && stats.totalSessions > 0 && (
        <div className="mb-6">
          <TrainingRecommendations
            recommendations={recommendations}
            isLoading={recommendationsLoading}
          />
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          {sessions.length > 3 && (
            <Link
              to="/sessions"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {recentSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">
                No sessions yet. Start your first range session!
              </p>
              <Button onClick={handleStartSession}>
                <Plus className="h-4 w-4 mr-1" />
                Start Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onSelect={() => navigate(`/sessions/${session.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
