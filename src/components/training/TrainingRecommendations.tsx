import { useNavigate } from 'react-router-dom';
import { Lightbulb, ChevronRight, Target, Zap, Move, RefreshCw, CircleDot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TrainingRecommendation } from '@/lib/recommendations';

const categoryIcons: Record<string, typeof Target> = {
  speed: Zap,
  accuracy: Target,
  movement: Move,
  reload: RefreshCw,
  other: CircleDot,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

interface TrainingRecommendationsProps {
  recommendations: TrainingRecommendation[];
  isLoading?: boolean;
}

export function TrainingRecommendations({
  recommendations,
  isLoading,
}: TrainingRecommendationsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Training Recommendations
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

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Training Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Complete a few sessions to get personalized training recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Training Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec) => {
          const Icon = categoryIcons[rec.category] || CircleDot;
          return (
            <div
              key={rec.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate(`/training/${rec.drillId}`)}
            >
              <div className="shrink-0 p-2 rounded-lg bg-background">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{rec.drillName}</span>
                  <Badge variant="secondary" className={`text-xs ${priorityColors[rec.priority]}`}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          );
        })}

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate('/training')}
        >
          View All Drills
        </Button>
      </CardContent>
    </Card>
  );
}
