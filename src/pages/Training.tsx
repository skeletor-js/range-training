import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { DrillList, DrillForm } from '@/components/drills';
import { GoalList, GoalForm } from '@/components/goals';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDrillStore } from '@/stores/drillStore';
import { useGoalsStore } from '@/stores/goalsStore';
import type { DrillWithStats, Goal } from '@/types';
import type { DrillFormData, GoalFormData } from '@/lib/validations';

export function Training() {
  const [activeTab, setActiveTab] = useState('drills');

  // Drill state
  const {
    drillsWithStats,
    drills,
    isLoading: drillsLoading,
    loadDrillsWithStats,
    addDrill,
    updateDrill,
    deleteDrill,
  } = useDrillStore();
  const [drillFormOpen, setDrillFormOpen] = useState(false);
  const [editingDrill, setEditingDrill] = useState<DrillWithStats | null>(null);
  const [deletingDrill, setDeletingDrill] = useState<DrillWithStats | null>(null);

  // Goals state
  const {
    goals,
    goalProgress,
    isLoading: goalsLoading,
    loadGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleComplete,
  } = useGoalsStore();
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadDrillsWithStats();
    loadGoals();
  }, [loadDrillsWithStats, loadGoals]);

  // Drill handlers
  const handleEditDrill = (drill: DrillWithStats) => {
    setEditingDrill(drill);
    setDrillFormOpen(true);
  };

  const handleDeleteDrill = (drill: DrillWithStats) => {
    setDeletingDrill(drill);
  };

  const handleSaveDrill = async (data: DrillFormData) => {
    if (editingDrill) {
      await updateDrill(editingDrill.id, data);
    } else {
      await addDrill(data);
    }
    setEditingDrill(null);
  };

  const handleConfirmDeleteDrill = async () => {
    if (deletingDrill) {
      await deleteDrill(deletingDrill.id);
      setDeletingDrill(null);
    }
  };

  // Goal handlers
  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalFormOpen(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    setDeletingGoal(goal);
  };

  const handleSaveGoal = async (data: GoalFormData) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, data);
    } else {
      await addGoal(data);
    }
    setEditingGoal(null);
  };

  const handleConfirmDeleteGoal = async () => {
    if (deletingGoal) {
      await deleteGoal(deletingGoal.id);
      setDeletingGoal(null);
    }
  };

  const handleToggleGoal = async (goal: Goal) => {
    await toggleComplete(goal.id);
  };

  return (
    <div className="p-4">
      <PageHeader
        title="Training"
        description="Practice drills and track your goals"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="w-full">
          <TabsTrigger value="drills" className="flex-1">
            Drills
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex-1">
            Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drills" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingDrill(null);
                setDrillFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Drill
            </Button>
          </div>

          {drillsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading drills...
            </div>
          ) : (
            <DrillList
              drills={drillsWithStats}
              onEdit={handleEditDrill}
              onDelete={handleDeleteDrill}
            />
          )}
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => {
                setEditingGoal(null);
                setGoalFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {goalsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading goals...
            </div>
          ) : (
            <GoalList
              goals={goals}
              goalProgress={goalProgress}
              onToggle={handleToggleGoal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Drill Form */}
      <DrillForm
        open={drillFormOpen}
        onOpenChange={(open) => {
          setDrillFormOpen(open);
          if (!open) setEditingDrill(null);
        }}
        drill={editingDrill}
        onSave={handleSaveDrill}
      />

      {/* Goal Form */}
      <GoalForm
        open={goalFormOpen}
        onOpenChange={(open) => {
          setGoalFormOpen(open);
          if (!open) setEditingGoal(null);
        }}
        goal={editingGoal}
        drills={drills}
        onSave={handleSaveGoal}
      />

      {/* Delete Drill Confirmation */}
      <ConfirmDialog
        open={!!deletingDrill}
        onOpenChange={(open) => !open && setDeletingDrill(null)}
        title="Delete Drill"
        description={`Are you sure you want to delete "${deletingDrill?.name}"? This will also delete all attempts logged for this drill.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteDrill}
        variant="destructive"
      />

      {/* Delete Goal Confirmation */}
      <ConfirmDialog
        open={!!deletingGoal}
        onOpenChange={(open) => !open && setDeletingGoal(null)}
        title="Delete Goal"
        description={`Are you sure you want to delete "${deletingGoal?.title}"?`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteGoal}
        variant="destructive"
      />
    </div>
  );
}
