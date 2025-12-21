import { useNavigate } from 'react-router-dom';
import { CaptureCanvas } from '@/components/capture/CaptureCanvas';
import { useCaptureStore } from '@/stores/captureStore';

export function Capture() {
  const navigate = useNavigate();
  const { createCapturedTarget, reset } = useCaptureStore();

  const handleComplete = () => {
    const target = createCapturedTarget();
    if (target) {
      // In a full implementation, this would add the target to the active session
      console.log('Captured target:', target);

      // For now, just show the metrics and reset
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
