import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SessionList } from '@/components/sessions/SessionList';
import { useSessionStore } from '@/stores/sessionStore';
import type { Session } from '@/types';

export function Sessions() {
  const navigate = useNavigate();
  const {
    sessions,
    isLoading,
    error,
    loadSessions,
    startSession,
    deleteSession,
    clearError,
  } = useSessionStore();

  const [deletingSession, setDeletingSession] = useState<Session | null>(null);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleStartSession = () => {
    startSession();
    // For now, just navigate to capture to test the flow
    // In a full implementation, we'd have a session detail page
    navigate('/capture');
  };

  const handleSelectSession = (session: Session) => {
    // Navigate to session detail page
    // For MVP, we'll just log it
    console.log('Selected session:', session);
  };

  const handleConfirmDelete = async () => {
    if (deletingSession) {
      await deleteSession(deletingSession.id);
      setDeletingSession(null);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Sessions"
        description="Your range training history"
        action={
          <Button onClick={handleStartSession}>
            <Plus className="h-4 w-4 mr-1" />
            New Session
          </Button>
        }
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
          <button
            onClick={clearError}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <SessionList
          sessions={sessions}
          onSelect={handleSelectSession}
          onDelete={setDeletingSession}
          onAdd={handleStartSession}
        />
      )}

      <ConfirmDialog
        open={!!deletingSession}
        onOpenChange={(open) => !open && setDeletingSession(null)}
        title="Delete Session"
        description={`Are you sure you want to delete this session from ${deletingSession?.date ? new Date(deletingSession.date).toLocaleDateString() : ''}? This will also delete all targets and shots. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
