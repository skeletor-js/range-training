// Re-export database types
export type {
  Firearm,
  NewFirearm,
  Ammo,
  NewAmmo,
  AmmoPurchase,
  NewAmmoPurchase,
  Session,
  NewSession,
  SessionFirearm,
  NewSessionFirearm,
  SessionAmmo,
  NewSessionAmmo,
  Target,
  NewTarget,
  Shot,
  NewShot,
  Drill,
  NewDrill,
  DrillBenchmark,
  NewDrillBenchmark,
  DrillAttempt,
  NewDrillAttempt,
  Goal,
  NewGoal,
  TimerSession,
  NewTimerSession,
} from '@/db/schema';

// UI-specific types

// Group metrics calculated from shots
export interface GroupMetrics {
  shotCount: number;
  groupCenterX: number; // inches from POA (positive = right)
  groupCenterY: number; // inches from POA (positive = up)
  extremeSpread: number; // inches (max distance between any two shots)
  meanRadius: number; // inches (average distance from group center)
  groupSizeMoa: number; // MOA equivalent of extreme spread
}

// Capture workflow state
export type CaptureMode = 'idle' | 'calibrating' | 'setting-poa' | 'marking-shots' | 'review';

// Shot in pixel coordinates (during capture)
export interface PixelShot {
  x: number;
  y: number;
  sequenceNumber: number;
}

// Shot in inch coordinates (after conversion)
export interface InchShot {
  xInches: number;
  yInches: number;
  sequenceNumber: number;
}

// Target with full shot data for display
export interface TargetWithShots {
  id: string;
  sessionId: string;
  targetType: string;
  distanceYards: number;
  calibrationType: 'preset' | 'custom' | null;
  customRefInches: number | null;
  shotCount: number;
  groupCenterX: number | null;
  groupCenterY: number | null;
  extremeSpread: number | null;
  meanRadius: number | null;
  groupSizeMoa: number | null;
  firearmId: string | null;
  ammoId: string | null;
  notes: string | null;
  createdAt: string | null;
  shots: InchShot[];
}

// Session with related data for display
export interface SessionWithDetails {
  id: string;
  date: string;
  location: string | null;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  notes: string | null;
  weather: string | null;
  temperature: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  firearms: SessionFirearmWithAmmo[];
  targets: TargetWithShots[];
  totalRounds: number;
}

// Session-firearm junction with ammo details
export interface SessionFirearmWithAmmo {
  id: string;
  firearmId: string;
  firearmName: string;
  ammoUsed: SessionAmmoDetail[];
}

export interface SessionAmmoDetail {
  id: string;
  ammoId: string;
  ammoName: string; // e.g., "Federal 9mm 124gr FMJ"
  roundsFired: number;
}

// Active session state (in-progress, not yet saved)
export interface ActiveSession {
  id: string;
  date: string;
  location: string;
  notes: string;
  weather: string | null;
  temperature: number | null;
  firearms: ActiveSessionFirearm[];
  targets: CapturedTarget[];
  isDirty: boolean;
}

export interface ActiveSessionFirearm {
  firearmId: string;
  ammoUsed: { ammoId: string; rounds: number }[];
}

// Target captured during active session (before DB save)
export interface CapturedTarget {
  tempId: string; // Temporary ID until saved
  targetType: string;
  distanceYards: number;
  calibrationType: 'preset' | 'custom';
  customRefInches: number | null;
  shots: InchShot[];
  metrics: GroupMetrics;
  firearmId: string | null;
  ammoId: string | null;
  notes: string | null;
}

// Heatmap data point
export interface HeatmapDataPoint {
  date: string; // YYYY-MM-DD format
  count: number; // Activity intensity (rounds fired, targets, etc.)
}

// Dashboard stats
export interface DashboardStats {
  totalSessions: number;
  totalRoundsFired: number;
  totalTargets: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}
