import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Thermometer, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MalfunctionForm } from '@/components/sessions/MalfunctionForm';
import { MalfunctionList } from '@/components/sessions/MalfunctionList';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useSessionStore } from '@/stores/sessionStore';
import { useMalfunctionStore } from '@/stores/malfunctionStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { SessionWithDetails, MalfunctionWithDetails } from '@/types';
import type { MalfunctionFormData } from '@/lib/validations';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { loadSessionDetails } = useSessionStore();
  const {
    malfunctions,
    isLoading: malfunctionsLoading,
    loadMalfunctions,
    addMalfunction,
    deleteMalfunction,
  } = useMalfunctionStore();
  const { firearms, ammo, loadFirearms, loadAmmo } = useInventoryStore();

  const [session, setSession] = useState<SessionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [malfunctionFormOpen, setMalfunctionFormOpen] = useState(false);
  const [deletingMalfunction, setDeletingMalfunction] = useState<MalfunctionWithDetails | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      setIsLoading(true);
      const details = await loadSessionDetails(id);
      setSession(details);
      await loadMalfunctions(id);
      setIsLoading(false);
    }
    load();
    loadFirearms();
    loadAmmo();
  }, [id, loadSessionDetails, loadMalfunctions, loadFirearms, loadAmmo]);

  const handleSaveMalfunction = async (data: MalfunctionFormData) => {
    await addMalfunction({
      ...data,
      sessionId: id ?? null,
    });
  };

  const handleDeleteMalfunction = async () => {
    if (deletingMalfunction) {
      await deleteMalfunction(deletingMalfunction.id);
      setDeletingMalfunction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-8 text-muted-foreground">
          Loading session...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center py-8 text-muted-foreground">
          Session not found
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Session Details</h1>
          <p className="text-muted-foreground">{formatDate(session.date)}</p>
        </div>
      </div>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(session.date)}</span>
          </div>

          {session.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{session.location}</span>
            </div>
          )}

          {session.durationMinutes && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{session.durationMinutes} minutes</span>
            </div>
          )}

          {session.temperature && (
            <div className="flex items-center gap-2 text-sm">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span>{session.temperature}°F</span>
              {session.weather && <Badge variant="secondary">{session.weather}</Badge>}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold">{session.totalRounds}</div>
              <div className="text-xs text-muted-foreground">Rounds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{session.targets.length}</div>
              <div className="text-xs text-muted-foreground">Targets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{malfunctions.length}</div>
              <div className="text-xs text-muted-foreground">Malfunctions</div>
            </div>
          </div>

          {session.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Malfunctions Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Malfunctions
          </CardTitle>
          <Button size="sm" onClick={() => setMalfunctionFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Log
          </Button>
        </CardHeader>
        <CardContent>
          {malfunctionsLoading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : malfunctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No malfunctions logged for this session</p>
              <p className="text-sm mt-1">That's a good thing!</p>
            </div>
          ) : (
            <MalfunctionList
              malfunctions={malfunctions}
              onDelete={(m) => setDeletingMalfunction(m)}
            />
          )}
        </CardContent>
      </Card>

      {/* Malfunction Form */}
      <MalfunctionForm
        open={malfunctionFormOpen}
        onOpenChange={setMalfunctionFormOpen}
        firearms={firearms}
        ammo={ammo}
        onSave={handleSaveMalfunction}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingMalfunction}
        onOpenChange={(open) => !open && setDeletingMalfunction(null)}
        title="Delete Malfunction"
        description="Are you sure you want to delete this malfunction record?"
        confirmLabel="Delete"
        onConfirm={handleDeleteMalfunction}
        variant="destructive"
      />
    </div>
  );
}
