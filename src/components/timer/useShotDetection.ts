import { useEffect, useRef, useState, useCallback } from 'react';
import { AudioDetector } from '@/lib/audioDetection';

interface UseShotDetectionOptions {
  enabled: boolean;
  sensitivity: number; // 0-100
  onShotDetected: () => void;
}

interface UseShotDetectionReturn {
  isListening: boolean;
  error: string | null;
  currentVolume: number;
  startListening: () => Promise<void>;
  stopListening: () => void;
}

export function useShotDetection({
  enabled,
  sensitivity,
  onShotDetected,
}: UseShotDetectionOptions): UseShotDetectionReturn {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVolume, setCurrentVolume] = useState(0);
  const detectorRef = useRef<AudioDetector | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  const stopListening = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }

    if (volumeIntervalRef.current !== null) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }

    setIsListening(false);
    setCurrentVolume(0);
    setError(null);
  }, []);

  const startListening = useCallback(async () => {
    if (!enabled) {
      setError('Shot detection is disabled');
      return;
    }

    try {
      setError(null);

      // Create new detector
      const detector = new AudioDetector(
        {
          sensitivity,
          minDelay: 500, // Minimum 500ms between detections
        },
        () => {
          // Shot detected callback
          onShotDetected();
        },
        (err) => {
          // Error callback
          setError(err.message);
          stopListening();
        }
      );

      await detector.start();
      detectorRef.current = detector;
      setIsListening(true);

      // Update volume display every 100ms
      volumeIntervalRef.current = window.setInterval(() => {
        if (detector.getIsListening()) {
          setCurrentVolume(detector.getCurrentVolume());
        }
      }, 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start audio detection';
      setError(message);
      setIsListening(false);
    }
  }, [enabled, sensitivity, onShotDetected, stopListening]);

  // Update sensitivity when it changes
  useEffect(() => {
    if (detectorRef.current) {
      detectorRef.current.updateConfig({ sensitivity });
    }
  }, [sensitivity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    error,
    currentVolume,
    startListening,
    stopListening,
  };
}
