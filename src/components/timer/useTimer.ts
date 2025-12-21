import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  mode: 'countdown' | 'stopwatch';
  initialSeconds?: number;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
}

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  addTime: (amount: number) => void;
}

// Audio feedback using Web Audio API
function playBeep(frequency = 880, duration = 200): void {
  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch {
    // Audio not available
  }
}

// Haptic feedback
function vibrate(pattern: number | number[] = [200, 100, 200]): void {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch {
    // Vibration not available
  }
}

export function useTimer({
  mode,
  initialSeconds = 0,
  onComplete,
  onTick,
}: UseTimerOptions): UseTimerReturn {
  const [seconds, setSeconds] = useState(mode === 'countdown' ? initialSeconds : 0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    startTimeRef.current = Date.now();

    intervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 + elapsedBeforePauseRef.current;

      if (mode === 'countdown') {
        const remaining = Math.max(0, initialSeconds - elapsed);
        setSeconds(remaining);
        onTick?.(remaining);

        if (remaining <= 0) {
          clearTimer();
          setIsRunning(false);
          playBeep(880, 300);
          playBeep(660, 300);
          vibrate([200, 100, 200, 100, 400]);
          onComplete?.();
        }
      } else {
        setSeconds(elapsed);
        onTick?.(elapsed);
      }
    }, 50); // Update every 50ms for smooth display
  }, [isRunning, mode, initialSeconds, onComplete, onTick, clearTimer]);

  const stop = useCallback(() => {
    if (!isRunning) return;

    clearTimer();
    setIsRunning(false);

    // Store elapsed time for resume
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    elapsedBeforePauseRef.current += elapsed;
  }, [isRunning, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    elapsedBeforePauseRef.current = 0;
    setSeconds(mode === 'countdown' ? initialSeconds : 0);
  }, [mode, initialSeconds, clearTimer]);

  const addTime = useCallback((amount: number) => {
    if (mode === 'countdown') {
      setSeconds((prev) => prev + amount);
    }
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Reset when initialSeconds changes
  useEffect(() => {
    if (!isRunning) {
      setSeconds(mode === 'countdown' ? initialSeconds : 0);
      elapsedBeforePauseRef.current = 0;
    }
  }, [initialSeconds, mode, isRunning]);

  return {
    seconds,
    isRunning,
    start,
    stop,
    reset,
    addTime,
  };
}

export { playBeep, vibrate };
