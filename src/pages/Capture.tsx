import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaptureCanvas } from '@/components/capture/CaptureCanvas';
import { CaptureSummary } from '@/components/capture/CaptureSummary';
import { useCaptureStore } from '@/stores/captureStore';
import { useActiveSessionStore } from '@/stores/activeSessionStore';
import type { GroupMetrics } from '@/types';

export function Capture() {
  const navigate = useNavigate();
  const { createCapturedTarget, reset } = useCaptureStore();
  const { addTarget, activeSession, startSession } = useActiveSessionStore();
  const [showSummary, setShowSummary] = useState(false);
  const [metrics, setMetrics] = useState<GroupMetrics | null>(null);

  const handleComplete = () => {
    const target = createCapturedTarget();
    if (target) {
      // Add target to active session (start one if needed)
      if (!activeSession) {
        startSession();
      }
      addTarget(target);

      // Show metrics feedback
      setMetrics(target.metrics);
      setShowSummary(true);
    }
  };

  const handleSummaryClose = () => {
    setShowSummary(false);
    reset();
    navigate(-1);
  };

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-background z-50">
      <CaptureCanvas onComplete={handleComplete} onCancel={handleCancel} />
      <CaptureSummary
        open={showSummary}
        onOpenChange={(open) => {
          if (!open) handleSummaryClose();
          setShowSummary(open);
        }}
        metrics={metrics}
        onClose={handleSummaryClose}
      />
    </div>
  );
}
