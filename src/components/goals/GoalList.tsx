import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { GoalCard } from './GoalCard';
import { Button } from '@/components/ui/button';
import type { Goal, GoalProgress } from '@/types';

interface GoalListProps {
  goals: Goal[];
  goalProgress: Map<string, GoalProgress>;
  onToggle: (goal: Goal) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

export function GoalList({
  goals,
  goalProgress,
  onToggle,
  onEdit,
  onDelete,
}: GoalListProps) {
  const [showCompleted, setShowCompleted] = useState(false);

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <div className="space-y-3">
        {activeGoals.length > 0 ? (
          activeGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={goalProgress.get(goal.id)}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No active goals. Create one to start tracking your progress!
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? (
              <ChevronDown className="h-4 w-4 mr-2" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-2" />
            )}
            Completed ({completedGoals.length})
          </Button>

          {showCompleted && (
            <div className="space-y-3 mt-3">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  progress={goalProgress.get(goal.id)}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
