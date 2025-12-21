/**
 * Audio Detection Utility
 * Analyzes microphone input to detect sudden amplitude spikes (gunshots)
 */

export interface AudioDetectionConfig {
  sensitivity: number; // 0-100, higher = more sensitive
  minDelay: number; // Minimum delay between detections (ms)
}

export class AudioDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isListening = false;
  private animationFrame: number | null = null;
  private lastDetectionTime = 0;
  private dataArray: Uint8Array | null = null;
  private baselineVolume = 0;
  private baselineSamples: number[] = [];
  private readonly BASELINE_SAMPLE_COUNT = 30;

  constructor(
    private config: AudioDetectionConfig,
    private onDetection: () => void,
    private onError?: (error: Error) => void
  ) {}

  async start(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio context and analyser
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.1;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);

      // Initialize data array
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Start listening
      this.isListening = true;
      this.baselineSamples = [];
      this.analyze();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to access microphone');
      this.onError?.(err);
      throw err;
    }
  }

  stop(): void {
    this.isListening = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.baselineSamples = [];
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getCurrentVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteTimeDomainData(this.dataArray);

    // Calculate RMS (root mean square) for volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / this.dataArray.length);
  }

  private analyze = (): void => {
    if (!this.isListening || !this.analyser || !this.dataArray) return;

    this.analyser.getByteTimeDomainData(this.dataArray);

    // Calculate current volume (RMS)
    const volume = this.getCurrentVolume();

    // Build baseline volume from first N samples
    if (this.baselineSamples.length < this.BASELINE_SAMPLE_COUNT) {
      this.baselineSamples.push(volume);
      if (this.baselineSamples.length === this.BASELINE_SAMPLE_COUNT) {
        this.baselineVolume = this.baselineSamples.reduce((a, b) => a + b, 0) / this.BASELINE_SAMPLE_COUNT;
      }
    } else {
      // Check for spike detection
      const now = Date.now();
      const timeSinceLastDetection = now - this.lastDetectionTime;

      // Only detect if enough time has passed since last detection
      if (timeSinceLastDetection >= this.config.minDelay) {
        // Convert sensitivity (0-100) to threshold multiplier
        // Higher sensitivity = lower threshold multiplier
        // Sensitivity 0 = 10x baseline, Sensitivity 100 = 1.5x baseline
        const thresholdMultiplier = 10 - (this.config.sensitivity / 100) * 8.5;
        const threshold = this.baselineVolume * thresholdMultiplier;

        if (volume > threshold) {
          this.lastDetectionTime = now;
          this.onDetection();
        }
      }

      // Slowly update baseline to adapt to environment changes
      this.baselineVolume = this.baselineVolume * 0.99 + volume * 0.01;
    }

    this.animationFrame = requestAnimationFrame(this.analyze);
  };

  updateConfig(config: Partial<AudioDetectionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
