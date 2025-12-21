import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Target, Timer, Crosshair } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PersonalBestBadge,
  DrillAttemptCard,
  DrillAttemptForm,
  DrillTrendChart,
} from '@/components/drills';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useDrillStore } from '@/stores/drillStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { DRILL_CATEGORY_LABELS, SCORING_TYPE_LABELS } from '@/lib/constants';
import type { DrillAttempt } from '@/types';
import type { DrillAttemptFormData } from '@/lib/validations';

export function DrillDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    drills,
    attempts,
    personalBests,
    loadDrills,
    loadAttempts,
    loadBenchmarks,
    addAttempt,
    deleteAttempt,
    getTrendData,
  } = useDrillStore();

  const { firearms, ammo, loadFirearms, loadAmmo } = useInventoryStore();

  const [attemptFormOpen, setAttemptFormOpen] = useState(false);
  const [deletingAttempt, setDeletingAttempt] = useState<DrillAttempt | null>(null);

  const drill = drills.find((d) => d.id === id);
  const drillAttempts = attempts.get(id ?? '') ?? [];
  const personalBest = personalBests.get(id ?? '') ?? null;
  const trendData = id ? getTrendData(id) : [];

  useEffect(() => {
    if (!drills.length) {
      loadDrills();
    }
    if (id) {
      loadAttempts(id);
      loadBenchmarks(id);
    }
    loadFirearms();
    loadAmmo();
  }, [id, drills.length, loadDrills, loadAttempts, loadBenchmarks, loadFirearms, loadAmmo]);

  const handleSaveAttempt = async (data: DrillAttemptFormData) => {
    await addAttempt(data);
  };

  const handleDeleteAttempt = async () => {
    if (deletingAttempt) {
      await deleteAttempt(deletingAttempt.id);
      setDeletingAttempt(null);
    }
  };

  if (!drill) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/training')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-8 text-muted-foreground">
          Drill not found
        </div>
      </div>
    );
  }

  const categoryLabel = drill.category
    ? DRILL_CATEGORY_LABELS[drill.category]
    : 'Other';
  const scoringLabel = drill.scoringType
    ? SCORING_TYPE_LABELS[drill.scoringType]
    : '';

  return (
    <div className="p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/training')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{drill.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{categoryLabel}</Badge>
            <Badge variant="secondary">{scoringLabel}</Badge>
            {drill.isBuiltin && (
              <Badge variant="secondary" className="text-xs">
                Built-in
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <Card className="mb-4">
        <CardContent className="p-4">
          {drill.description && (
            <p className="text-sm text-muted-foreground mb-4">{drill.description}</p>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Rounds</div>
                <div className="font-medium">{drill.roundCount}</div>
              </div>
            </div>

            {drill.distanceYards && (
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Distance</div>
                  <div className="font-medium">{drill.distanceYards} yds</div>
                </div>
              </div>
            )}

            {drill.parTime && (
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Par Time</div>
                  <div className="font-medium">{drill.parTime}s</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Best */}
      {personalBest && (
        <Card className="mb-4 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Personal Best</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <PersonalBestBadge
                attempt={personalBest}
                scoringType={drill.scoringType}
                showIcon={true}
              />
              <span className="text-xs text-muted-foreground">
                {new Date(personalBest.createdAt!).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Trend Chart */}
      <DrillTrendChart
        data={trendData}
        scoringType={drill.scoringType}
        className="mb-4"
      />

      {/* Recent Attempts */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">
            Attempts ({drillAttempts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {drillAttempts.length > 0 ? (
            drillAttempts.slice(0, 10).map((attempt) => (
              <DrillAttemptCard
                key={attempt.id}
                attempt={attempt}
                scoringType={drill.scoringType}
                isPB={attempt.id === personalBest?.id}
                firearm={firearms.find((f) => f.id === attempt.firearmId)}
                ammo={ammo.find((a) => a.id === attempt.ammoId)}
                onDelete={setDeletingAttempt}
              />
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No attempts logged yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 safe-area-inset-bottom">
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setAttemptFormOpen(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Log Attempt
        </Button>
      </div>

      {/* Attempt Form */}
      <DrillAttemptForm
        open={attemptFormOpen}
        onOpenChange={setAttemptFormOpen}
        drill={drill}
        firearms={firearms}
        ammo={ammo}
        onSave={handleSaveAttempt}
      />

      {/* Delete Attempt Confirmation */}
      <ConfirmDialog
        open={!!deletingAttempt}
        onOpenChange={(open) => !open && setDeletingAttempt(null)}
        title="Delete Attempt"
        description="Are you sure you want to delete this attempt? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteAttempt}
        variant="destructive"
      />
    </div>
  );
}
