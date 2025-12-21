import { useState, useRef, useCallback, useEffect } from 'react';

export type DelayMode = 'none' | 'fixed' | 'random';

interface UseTimerOptions {
  mode: 'countdown' | 'stopwatch';
  initialSeconds?: number;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
  delayMode?: DelayMode;
  fixedDelay?: number;
  randomDelayMin?: number;
  randomDelayMax?: number;
  onDelayComplete?: () => void;
}

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  isDelaying: boolean;
  delaySeconds: number;
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
  delayMode = 'none',
  fixedDelay = 3,
  randomDelayMin = 2,
  randomDelayMax = 5,
  onDelayComplete,
}: UseTimerOptions): UseTimerReturn {
  const [seconds, setSeconds] = useState(mode === 'countdown' ? initialSeconds : 0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDelaying, setIsDelaying] = useState(false);
  const [delaySeconds, setDelaySeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const delayIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);
  const delayStartTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearDelayTimer = useCallback(() => {
    if (delayIntervalRef.current !== null) {
      clearInterval(delayIntervalRef.current);
      delayIntervalRef.current = null;
    }
  }, []);

  const startMainTimer = useCallback(() => {
    setIsRunning(true);
    setIsDelaying(false);
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
    }, 50);
  }, [mode, initialSeconds, onComplete, onTick, clearTimer]);

  const startDelay = useCallback(() => {
    // Calculate delay time
    let delayTime: number;
    if (delayMode === 'fixed') {
      delayTime = fixedDelay;
    } else if (delayMode === 'random') {
      delayTime = randomDelayMin + Math.random() * (randomDelayMax - randomDelayMin);
    } else {
      // No delay, start immediately
      startMainTimer();
      return;
    }

    setIsDelaying(true);
    setDelaySeconds(delayTime);
    delayStartTimeRef.current = Date.now();

    // Play ready beep
    playBeep(660, 150);

    delayIntervalRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - delayStartTimeRef.current) / 1000;
      const remaining = Math.max(0, delayTime - elapsed);
      setDelaySeconds(remaining);

      // Play countdown beeps at 1 second intervals
      if (remaining > 0 && remaining <= 3 && Math.abs(remaining - Math.round(remaining)) < 0.05) {
        playBeep(660, 100);
      }

      if (remaining <= 0) {
        clearDelayTimer();
        setIsDelaying(false);
        setDelaySeconds(0);
        // Play start beep
        playBeep(880, 200);
        onDelayComplete?.();
        startMainTimer();
      }
    }, 50);
  }, [delayMode, fixedDelay, randomDelayMin, randomDelayMax, clearDelayTimer, startMainTimer, onDelayComplete]);

  const start = useCallback(() => {
    if (isRunning || isDelaying) return;
    startDelay();
  }, [isRunning, isDelaying, startDelay]);

  const stop = useCallback(() => {
    if (isDelaying) {
      // Stop during delay
      clearDelayTimer();
      setIsDelaying(false);
      setDelaySeconds(0);
    } else if (isRunning) {
      // Stop during main timer
      clearTimer();
      setIsRunning(false);

      // Store elapsed time for resume
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      elapsedBeforePauseRef.current += elapsed;
    }
  }, [isRunning, isDelaying, clearTimer, clearDelayTimer]);

  const reset = useCallback(() => {
    clearTimer();
    clearDelayTimer();
    setIsRunning(false);
    setIsDelaying(false);
    setDelaySeconds(0);
    elapsedBeforePauseRef.current = 0;
    setSeconds(mode === 'countdown' ? initialSeconds : 0);
  }, [mode, initialSeconds, clearTimer, clearDelayTimer]);

  const addTime = useCallback((amount: number) => {
    if (mode === 'countdown') {
      setSeconds((prev) => prev + amount);
    }
  }, [mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      clearDelayTimer();
    };
  }, [clearTimer, clearDelayTimer]);

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
    isDelaying,
    delaySeconds,
    start,
    stop,
    reset,
    addTime,
  };
}

export { playBeep, vibrate };
