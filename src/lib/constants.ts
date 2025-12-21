// Common caliber options
export const CALIBERS = [
  // Handgun
  '.22 LR',
  '.380 ACP',
  '9mm',
  '.40 S&W',
  '.45 ACP',
  '10mm',
  '.357 Magnum',
  '.38 Special',
  '.44 Magnum',
  // Rifle
  '.223 Rem / 5.56 NATO',
  '.308 Win / 7.62 NATO',
  '.30-06',
  '6.5 Creedmoor',
  '.300 BLK',
  '7.62x39',
  '.22 WMR',
  // Shotgun
  '12 Gauge',
  '20 Gauge',
  '.410 Bore',
  // Air gun
  '.177 (Air)',
  '.20 (Air)',
  '.22 (Air)',
  '.25 (Air)',
  '.30 (Air)',
  // Black powder
  '.36 BP',
  '.44 BP',
  '.45 BP',
  '.50 BP',
  '.54 BP',
  '.58 BP',
] as const;

// Firearm/weapon types
export const FIREARM_TYPES = [
  // Traditional firearms
  'handgun',
  'rifle',
  'shotgun',
  'sbr',
  'pcc',
  // Air-powered
  'air_rifle',
  'air_pistol',
  // Black powder
  'bp_rifle',
  'bp_pistol',
  'bp_shotgun',
  // Other
  'other',
] as const;
export type FirearmType = (typeof FIREARM_TYPES)[number];
export const FIREARM_TYPE_LABELS: Record<FirearmType, string> = {
  handgun: 'Handgun',
  rifle: 'Rifle',
  shotgun: 'Shotgun',
  sbr: 'SBR',
  pcc: 'PCC',
  air_rifle: 'Air Rifle',
  air_pistol: 'Air Pistol',
  bp_rifle: 'Black Powder Rifle',
  bp_pistol: 'Black Powder Pistol',
  bp_shotgun: 'Black Powder Shotgun',
  other: 'Other',
};

// Weather conditions
export const WEATHER_CONDITIONS = [
  'Clear',
  'Partly Cloudy',
  'Overcast',
  'Light Rain',
  'Heavy Rain',
  'Windy',
  'Snow',
  'Fog',
] as const;

// Bullet types
export const BULLET_TYPES = [
  'FMJ',
  'JHP',
  'BTHP',
  'SP',
  'RN',
  'TMJ',
  'Frangible',
  'Tracer',
] as const;

// Reliability/Accuracy ratings
export const RATING_OPTIONS = ['excellent', 'good', 'fair', 'poor'] as const;
export type RatingOption = (typeof RATING_OPTIONS)[number];

// Target preset definitions
export interface TargetPreset {
  id: string;
  name: string;
  knownDimensionInches: number; // Reference dimension for calibration
  svgTemplate: string; // Template component name
  description: string;
}

export const TARGET_PRESETS: TargetPreset[] = [
  {
    id: 'b8-repair',
    name: 'NRA B-8 Repair Center',
    knownDimensionInches: 5.5, // Outer black diameter
    svgTemplate: 'B8Target',
    description: '25-yard pistol bullseye (5.5" black)',
  },
  {
    id: 'uspsa-metric',
    name: 'USPSA Metric',
    knownDimensionInches: 18, // Height of A-zone
    svgTemplate: 'USPSATarget',
    description: 'USPSA/IPSC metric target',
  },
  {
    id: 'neutral-grid',
    name: 'Neutral Grid',
    knownDimensionInches: 1, // 1-inch grid squares
    svgTemplate: 'NeutralGrid',
    description: '1-inch grid for any target',
  },
];

// Common shooting distances (yards)
export const COMMON_DISTANCES = [3, 5, 7, 10, 15, 25, 50, 100] as const;

// MOA constant (1 MOA = 1.047 inches at 100 yards)
export const MOA_INCHES_AT_100_YARDS = 1.047;

// Drill categories
export const DRILL_CATEGORIES = ['speed', 'accuracy', 'movement', 'reload', 'other'] as const;
export type DrillCategory = (typeof DRILL_CATEGORIES)[number];

// Drill scoring types
export const SCORING_TYPES = ['time', 'points', 'pass_fail', 'hits'] as const;
export type ScoringType = (typeof SCORING_TYPES)[number];

// Drill category display names
export const DRILL_CATEGORY_LABELS: Record<DrillCategory, string> = {
  speed: 'Speed',
  accuracy: 'Accuracy',
  movement: 'Movement',
  reload: 'Reload',
  other: 'Other',
};

// Scoring type display names
export const SCORING_TYPE_LABELS: Record<ScoringType, string> = {
  time: 'Time',
  points: 'Points',
  pass_fail: 'Pass/Fail',
  hits: 'Hits',
};
