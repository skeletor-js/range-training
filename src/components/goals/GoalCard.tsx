import { MoreVertical, Pencil, Trash2, Check, Circle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GoalProgress } from './GoalProgress';
import type { Goal, GoalProgress as GoalProgressType } from '@/types';

interface GoalCardProps {
  goal: Goal;
  progress?: GoalProgressType | null;
  onToggle: (goal: Goal) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

export function GoalCard({ goal, progress, onToggle, onEdit, onDelete }: GoalCardProps) {
  // Calculate days until due
  const getDaysUntilDue = () => {
    if (!goal.targetDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(goal.targetDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilDue();
  const isOverdue = daysUntil !== null && daysUntil < 0 && !goal.isCompleted;

  const formatDueDate = () => {
    if (daysUntil === null) return null;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    return `${daysUntil} days`;
  };

  return (
    <Card className={goal.isCompleted ? 'opacity-60' : undefined}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(goal)}
            className="mt-0.5 shrink-0"
          >
            {goal.isCompleted ? (
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                <Check className="h-3 w-3 text-white" />
              </div>
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium ${goal.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                >
                  {goal.title}
                </h3>

                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {goal.description}
                  </p>
                )}

                {/* Due date */}
                {goal.targetDate && (
                  <div
                    className={`flex items-center gap-1 mt-2 text-xs ${
                      isOverdue ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                    <span>{formatDueDate()}</span>
                  </div>
                )}

                {/* Completed date */}
                {goal.isCompleted && goal.completedAt && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3" />
                    <span>
                      Completed{' '}
                      {new Date(goal.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Progress bar for linked drills */}
                {progress && !goal.isCompleted && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      {progress.drillName}
                    </p>
                    <GoalProgress progress={progress} />
                  </div>
                )}
              </div>

              {/* Actions menu */}
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(goal)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(goal)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
