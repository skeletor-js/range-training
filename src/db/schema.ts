import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Armory (Firearms, Air Guns, Black Powder)
export const firearms = sqliteTable('firearms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['handgun', 'rifle', 'shotgun', 'sbr', 'pcc', 'air_rifle', 'air_pistol', 'bp_rifle', 'bp_pistol', 'bp_shotgun', 'other'] }),
  caliber: text('caliber').notNull(),
  manufacturer: text('manufacturer'),
  model: text('model'),
  serialNumber: text('serial_number'),
  notes: text('notes'),
  purchaseDate: text('purchase_date'),
  roundCount: integer('round_count').default(0),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Ammunition Inventory
export const ammo = sqliteTable('ammo', {
  id: text('id').primaryKey(),
  caliber: text('caliber').notNull(),
  brand: text('brand').notNull(),
  productLine: text('product_line'),
  grainWeight: integer('grain_weight').notNull(),
  bulletType: text('bullet_type'),
  roundCount: integer('round_count').default(0),
  rating: integer('rating'),
  reliability: text('reliability', { enum: ['excellent', 'good', 'fair', 'poor'] }),
  accuracy: text('accuracy', { enum: ['excellent', 'good', 'fair', 'poor'] }),
  reviewNotes: text('review_notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Ammo Purchase History
export const ammoPurchases = sqliteTable('ammo_purchases', {
  id: text('id').primaryKey(),
  ammoId: text('ammo_id').notNull().references(() => ammo.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  priceTotal: real('price_total').notNull(),
  seller: text('seller'),
  purchaseDate: text('purchase_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Range Sessions
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  location: text('location'),
  startTime: text('start_time'),
  endTime: text('end_time'),
  durationMinutes: integer('duration_minutes'),
  notes: text('notes'),
  weather: text('weather'),
  temperature: integer('temperature'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Junction: Firearms used in sessions
export const sessionFirearms = sqliteTable('session_firearms', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  firearmId: text('firearm_id').notNull().references(() => firearms.id),
});

// Ammo used per session-firearm combination
export const sessionAmmo = sqliteTable('session_ammo', {
  id: text('id').primaryKey(),
  sessionFirearmId: text('session_firearm_id').notNull().references(() => sessionFirearms.id, { onDelete: 'cascade' }),
  ammoId: text('ammo_id').notNull().references(() => ammo.id),
  roundsFired: integer('rounds_fired').notNull(),
});

// Targets: NO image storage - only coordinates and metrics
export const targets = sqliteTable('targets', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),

  // Target identification
  targetType: text('target_type').notNull(),  // 'b8-repair', 'uspsa-metric', 'custom', etc.
  distanceYards: real('distance_yards').notNull(),

  // Calibration metadata (for custom targets or reference)
  calibrationType: text('calibration_type', { enum: ['preset', 'custom'] }),
  customRefInches: real('custom_ref_inches'),  // only used for custom calibration

  // Computed group metrics (calculated at capture, stored for display)
  shotCount: integer('shot_count').notNull(),
  groupCenterX: real('group_center_x'),        // inches from POA (positive = right)
  groupCenterY: real('group_center_y'),        // inches from POA (positive = up)
  extremeSpread: real('extreme_spread'),       // inches (diameter of smallest circle containing all shots)
  meanRadius: real('mean_radius'),             // inches (average distance from group center)
  groupSizeMoa: real('group_size_moa'),        // MOA equivalent of extreme spread

  // Linked entities
  firearmId: text('firearm_id').references(() => firearms.id),
  ammoId: text('ammo_id').references(() => ammo.id),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),

  // NO image blob - photos are transient, discarded after capture
});

// Individual Shots: Real-world coordinates relative to POA
export const shots = sqliteTable('shots', {
  id: text('id').primaryKey(),
  targetId: text('target_id').notNull().references(() => targets.id, { onDelete: 'cascade' }),

  // Real-world coordinates in inches, relative to point of aim
  xInches: real('x_inches').notNull(),  // positive = right of POA
  yInches: real('y_inches').notNull(),  // positive = above POA

  shotNumber: integer('shot_number'),   // optional ordering
  createdAt: text('created_at').default(sql`(datetime('now'))`),

  // NO pixel coordinates - those are transient during capture
});

// Drill Definitions
export const drills = sqliteTable('drills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category', { enum: ['speed', 'accuracy', 'movement', 'reload', 'other'] }),
  scoringType: text('scoring_type', { enum: ['time', 'points', 'pass_fail', 'hits'] }),
  platform: text('platform', { enum: ['handgun', 'carbine', 'both'] }).default('handgun'),
  parTime: real('par_time'),
  maxPoints: integer('max_points'),
  roundCount: integer('round_count').notNull(),
  targetCount: integer('target_count').default(1),
  distanceYards: real('distance_yards'),
  isBuiltin: integer('is_builtin', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Drill Skill Level Benchmarks
export const drillBenchmarks = sqliteTable('drill_benchmarks', {
  id: text('id').primaryKey(),
  drillId: text('drill_id').notNull().references(() => drills.id, { onDelete: 'cascade' }),
  level: text('level').notNull(),
  threshold: real('threshold').notNull(),
});

// Drill Attempt Logs
export const drillAttempts = sqliteTable('drill_attempts', {
  id: text('id').primaryKey(),
  drillId: text('drill_id').notNull().references(() => drills.id),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  timeSeconds: real('time_seconds'),
  points: integer('points'),
  hits: integer('hits'),
  misses: integer('misses'),
  passed: integer('passed', { mode: 'boolean' }),
  targetId: text('target_id').references(() => targets.id),
  firearmId: text('firearm_id').references(() => firearms.id),
  ammoId: text('ammo_id').references(() => ammo.id),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// User Goals
export const goals = sqliteTable('goals', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  targetDate: text('target_date'),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  completedAt: text('completed_at'),
  linkedDrillId: text('linked_drill_id').references(() => drills.id),
  targetScore: real('target_score'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Timer Session Logs
export const timerSessions = sqliteTable('timer_sessions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  startedAt: text('started_at').notNull(),
  initialDuration: integer('initial_duration').notNull(),
  timeAdded: integer('time_added').default(0),
  endedAt: text('ended_at'),
  completedFully: integer('completed_fully', { mode: 'boolean' }).default(false),
});

// Firearm-Ammo Compatibility Notes
export const firearmAmmoCompatibility = sqliteTable('firearm_ammo_compatibility', {
  id: text('id').primaryKey(),
  firearmId: text('firearm_id').notNull().references(() => firearms.id, { onDelete: 'cascade' }),
  ammoId: text('ammo_id').notNull().references(() => ammo.id, { onDelete: 'cascade' }),
  performanceRating: text('performance_rating', { enum: ['excellent', 'good', 'fair', 'poor'] }),
  loadNotes: text('load_notes'),
  isTested: integer('is_tested', { mode: 'boolean' }).default(false),
  lastTestedDate: text('last_tested_date'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Malfunction Logs (Session-level tracking of ammo/firearm issues)
export const malfunctions = sqliteTable('malfunctions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  ammoId: text('ammo_id').references(() => ammo.id),
  firearmId: text('firearm_id').references(() => firearms.id),
  malfunctionType: text('malfunction_type', {
    enum: ['failure_to_feed', 'failure_to_eject', 'failure_to_fire', 'light_primer_strike', 'squib', 'hang_fire', 'misfire', 'jam', 'other'],
  }).notNull(),
  description: text('description'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

// Saved Range Locations
export const ranges = sqliteTable('ranges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  phone: text('phone'),
  website: text('website'),
  rangeType: text('range_type', { enum: ['indoor', 'outdoor', 'both'] }),
  maxDistance: integer('max_distance'), // yards
  notes: text('notes'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Session Templates for quick session setup
export const sessionTemplates = sqliteTable('session_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  location: text('location'),
  rangeId: text('range_id').references(() => ranges.id),
  firearmIds: text('firearm_ids'), // JSON array of firearm IDs
  ammoPresets: text('ammo_presets'), // JSON array of {firearmId, ammoId, rounds}
  defaultNotes: text('default_notes'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  usageCount: integer('usage_count').default(0),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
});

// Schema Version for Migrations
export const schemaVersion = sqliteTable('schema_version', {
  version: integer('version').primaryKey(),
  appliedAt: text('applied_at').default(sql`(datetime('now'))`),
});

// Type exports for use in queries
export type Firearm = typeof firearms.$inferSelect;
export type NewFirearm = typeof firearms.$inferInsert;
export type Ammo = typeof ammo.$inferSelect;
export type NewAmmo = typeof ammo.$inferInsert;
export type AmmoPurchase = typeof ammoPurchases.$inferSelect;
export type NewAmmoPurchase = typeof ammoPurchases.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type SessionFirearm = typeof sessionFirearms.$inferSelect;
export type NewSessionFirearm = typeof sessionFirearms.$inferInsert;
export type SessionAmmo = typeof sessionAmmo.$inferSelect;
export type NewSessionAmmo = typeof sessionAmmo.$inferInsert;
export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;
export type Shot = typeof shots.$inferSelect;
export type NewShot = typeof shots.$inferInsert;
export type Drill = typeof drills.$inferSelect;
export type NewDrill = typeof drills.$inferInsert;
export type DrillBenchmark = typeof drillBenchmarks.$inferSelect;
export type NewDrillBenchmark = typeof drillBenchmarks.$inferInsert;
export type DrillAttempt = typeof drillAttempts.$inferSelect;
export type NewDrillAttempt = typeof drillAttempts.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type TimerSession = typeof timerSessions.$inferSelect;
export type NewTimerSession = typeof timerSessions.$inferInsert;
export type FirearmAmmoCompatibility = typeof firearmAmmoCompatibility.$inferSelect;
export type NewFirearmAmmoCompatibility = typeof firearmAmmoCompatibility.$inferInsert;
export type Malfunction = typeof malfunctions.$inferSelect;
export type NewMalfunction = typeof malfunctions.$inferInsert;
export type Range = typeof ranges.$inferSelect;
export type NewRange = typeof ranges.$inferInsert;
export type SessionTemplate = typeof sessionTemplates.$inferSelect;
export type NewSessionTemplate = typeof sessionTemplates.$inferInsert;
