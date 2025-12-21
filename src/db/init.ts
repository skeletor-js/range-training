import { sql } from 'drizzle-orm';
import { db } from './client';
import { runMigrations } from './migrations';
import { seedBuiltinDrills } from './seed';

// SQL statements for schema creation
const SCHEMA_SQL = `
-- Armory (Firearms, Air Guns, Black Powder)
CREATE TABLE IF NOT EXISTS firearms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  caliber TEXT NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  notes TEXT,
  purchase_date TEXT,
  round_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Ammunition Inventory
CREATE TABLE IF NOT EXISTS ammo (
  id TEXT PRIMARY KEY,
  caliber TEXT NOT NULL,
  brand TEXT NOT NULL,
  product_line TEXT,
  grain_weight INTEGER NOT NULL,
  bullet_type TEXT,
  round_count INTEGER DEFAULT 0,
  rating INTEGER,
  reliability TEXT CHECK(reliability IN ('excellent', 'good', 'fair', 'poor')),
  accuracy TEXT CHECK(accuracy IN ('excellent', 'good', 'fair', 'poor')),
  review_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Ammo Purchase History
CREATE TABLE IF NOT EXISTS ammo_purchases (
  id TEXT PRIMARY KEY,
  ammo_id TEXT NOT NULL REFERENCES ammo(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_total REAL NOT NULL,
  seller TEXT,
  purchase_date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Range Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  location TEXT,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  weather TEXT,
  temperature INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Junction: Firearms used in sessions
CREATE TABLE IF NOT EXISTS session_firearms (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  firearm_id TEXT NOT NULL REFERENCES firearms(id)
);

-- Ammo used per session-firearm combination
CREATE TABLE IF NOT EXISTS session_ammo (
  id TEXT PRIMARY KEY,
  session_firearm_id TEXT NOT NULL REFERENCES session_firearms(id) ON DELETE CASCADE,
  ammo_id TEXT NOT NULL REFERENCES ammo(id),
  rounds_fired INTEGER NOT NULL
);

-- Targets (NO image storage)
CREATE TABLE IF NOT EXISTS targets (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  distance_yards REAL NOT NULL,
  calibration_type TEXT CHECK(calibration_type IN ('preset', 'custom')),
  custom_ref_inches REAL,
  shot_count INTEGER NOT NULL,
  group_center_x REAL,
  group_center_y REAL,
  extreme_spread REAL,
  mean_radius REAL,
  group_size_moa REAL,
  firearm_id TEXT REFERENCES firearms(id),
  ammo_id TEXT REFERENCES ammo(id),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Individual Shots
CREATE TABLE IF NOT EXISTS shots (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
  x_inches REAL NOT NULL,
  y_inches REAL NOT NULL,
  shot_number INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Drill Definitions
CREATE TABLE IF NOT EXISTS drills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK(category IN ('speed', 'accuracy', 'movement', 'reload', 'other')),
  scoring_type TEXT CHECK(scoring_type IN ('time', 'points', 'pass_fail', 'hits')),
  par_time REAL,
  max_points INTEGER,
  round_count INTEGER NOT NULL,
  target_count INTEGER DEFAULT 1,
  distance_yards REAL,
  is_builtin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Drill Skill Level Benchmarks
CREATE TABLE IF NOT EXISTS drill_benchmarks (
  id TEXT PRIMARY KEY,
  drill_id TEXT NOT NULL REFERENCES drills(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  threshold REAL NOT NULL
);

-- Drill Attempt Logs
CREATE TABLE IF NOT EXISTS drill_attempts (
  id TEXT PRIMARY KEY,
  drill_id TEXT NOT NULL REFERENCES drills(id),
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  time_seconds REAL,
  points INTEGER,
  hits INTEGER,
  misses INTEGER,
  passed INTEGER,
  target_id TEXT REFERENCES targets(id),
  firearm_id TEXT REFERENCES firearms(id),
  ammo_id TEXT REFERENCES ammo(id),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User Goals
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  target_date TEXT,
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  linked_drill_id TEXT REFERENCES drills(id),
  target_score REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Timer Session Logs
CREATE TABLE IF NOT EXISTS timer_sessions (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  started_at TEXT NOT NULL,
  initial_duration INTEGER NOT NULL,
  time_added INTEGER DEFAULT 0,
  ended_at TEXT,
  completed_fully INTEGER DEFAULT 0
);

-- Firearm-Ammo Compatibility Notes
CREATE TABLE IF NOT EXISTS firearm_ammo_compatibility (
  id TEXT PRIMARY KEY,
  firearm_id TEXT NOT NULL REFERENCES firearms(id) ON DELETE CASCADE,
  ammo_id TEXT NOT NULL REFERENCES ammo(id) ON DELETE CASCADE,
  performance_rating TEXT CHECK(performance_rating IN ('excellent', 'good', 'fair', 'poor')),
  load_notes TEXT,
  is_tested INTEGER DEFAULT 0,
  last_tested_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Unique index for firearm-ammo pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_firearm_ammo_unique
ON firearm_ammo_compatibility(firearm_id, ammo_id);

-- Schema Version for Migrations
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT DEFAULT (datetime('now'))
);
`;

export const CURRENT_SCHEMA_VERSION = 5;

// Track initialization state to prevent duplicate calls
let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the database, creating tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  // Prevent duplicate initialization
  if (isInitialized) {
    return;
  }

  // If already initializing, wait for that to complete
  if (initPromise) {
    return initPromise;
  }

  initPromise = doInitialize();
  try {
    await initPromise;
    isInitialized = true;
  } finally {
    initPromise = null;
  }
}

async function doInitialize(): Promise<void> {
  try {
    // Check if schema_version table exists
    const result = await db.all(sql`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='schema_version'
    `);

    if (result.length === 0) {
      // First time setup - create all tables
      console.log('[DB] Creating initial schema...');

      // Split and execute each statement separately
      const statements = SCHEMA_SQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await db.run(sql.raw(statement));
      }

      // Record schema version (use OR IGNORE in case of partial initialization)
      await db.run(sql`
        INSERT OR IGNORE INTO schema_version (version) VALUES (${CURRENT_SCHEMA_VERSION})
      `);

      console.log('[DB] Schema created successfully (version', CURRENT_SCHEMA_VERSION, ')');
    } else {
      // Check for migrations
      const versionResult = await db.all<{ version: number }>(sql`
        SELECT version FROM schema_version ORDER BY version DESC LIMIT 1
      `);

      const currentVersion = versionResult[0]?.version ?? 0;
      console.log('[DB] Current schema version:', currentVersion);

      if (currentVersion < CURRENT_SCHEMA_VERSION) {
        await runMigrations(currentVersion, CURRENT_SCHEMA_VERSION);
      }
    }

    // Always attempt to seed built-in drills to ensure they exist (function is idempotent)
    await seedBuiltinDrills();
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    throw error;
  }
}
