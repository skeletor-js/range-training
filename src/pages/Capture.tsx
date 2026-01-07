import { useNavigate } from 'react-router-dom';
import { CaptureCanvas } from '@/components/capture/CaptureCanvas';
import { useCaptureStore } from '@/stores/captureStore';
import { useActiveSessionStore } from '@/stores/activeSessionStore';

export function Capture() {
  const navigate = useNavigate();
  const { createCapturedTarget, reset } = useCaptureStore();
  const { addTarget, activeSession, startSession } = useActiveSessionStore();

  const handleComplete = () => {
    const target = createCapturedTarget();
    if (target) {
      // Add target to active session (start one if needed)
      if (!activeSession) {
        startSession();
      }
      addTarget(target);

      // Show metrics feedback
      const metrics = target.metrics;
      alert(
        `Target captured!\n\n` +
        `Shots: ${metrics.shotCount}\n` +
        `Group Size: ${metrics.extremeSpread.toFixed(2)}" (${metrics.groupSizeMoa.toFixed(2)} MOA)\n` +
        `Mean Radius: ${metrics.meanRadius.toFixed(2)}"\n` +
        `Center Offset: ${metrics.groupCenterX.toFixed(2)}", ${metrics.groupCenterY.toFixed(2)}"`
      );

      reset();
      navigate(-1);
    }
  };

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 bg-background z-50">
      <CaptureCanvas onComplete={handleComplete} onCancel={handleCancel} />
    </div>
  );
}
