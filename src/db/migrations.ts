import { sql } from 'drizzle-orm';
import { db } from './client';
import { seedBuiltinDrills } from './seed';

/**
 * Run migrations from one version to another
 */
export async function runMigrations(fromVersion: number, toVersion: number): Promise<void> {
  console.log(`[DB] Running migrations from v${fromVersion} to v${toVersion}`);

  // v1 -> v2: Add firearm_ammo_compatibility table
  if (fromVersion < 2) {
    console.log('[DB] Applying migration v2: Adding firearm_ammo_compatibility table');
    await db.run(sql`
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
      )
    `);
    await db.run(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_firearm_ammo_unique
      ON firearm_ammo_compatibility(firearm_id, ammo_id)
    `);
    await db.run(sql`INSERT INTO schema_version (version) VALUES (2)`);
  }

  // v2 -> v3: Seed built-in drills
  if (fromVersion < 3) {
    console.log('[DB] Applying migration v3: Seeding built-in drills');
    await seedBuiltinDrills();
    await db.run(sql`INSERT INTO schema_version (version) VALUES (3)`);
  }

  // v3 -> v4: Add performance indexes
  if (fromVersion < 4) {
    console.log('[DB] Applying migration v4: Adding performance indexes');

    // Session queries
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date)`);

    // Target queries
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_targets_session ON targets(session_id)`);

    // Shot queries
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_shots_target ON shots(target_id)`);

    // Drill attempt queries
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_drill_attempts_drill ON drill_attempts(drill_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_drill_attempts_session ON drill_attempts(session_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_drill_attempts_firearm ON drill_attempts(firearm_id)`);

    // Ammo purchase queries
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_ammo_purchases_ammo ON ammo_purchases(ammo_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_ammo_purchases_date ON ammo_purchases(purchase_date)`);

    // Session firearms/ammo queries
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_session_firearms_session ON session_firearms(session_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_session_ammo_sf ON session_ammo(session_firearm_id)`);

    await db.run(sql`INSERT INTO schema_version (version) VALUES (4)`);
    console.log('[DB] Performance indexes created');
  }

  // v4 -> v5: Expand firearm types (add air guns, black powder)
  // Remove CHECK constraint to allow new types (validation handled by Drizzle schema)
  if (fromVersion < 5) {
    console.log('[DB] Applying migration v5: Expanding firearm types for armory');

    // Recreate firearms table without CHECK constraint on type
    await db.run(sql`
      CREATE TABLE firearms_new (
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
      )
    `);

    await db.run(sql`
      INSERT INTO firearms_new
      SELECT id, name, type, caliber, manufacturer, model, serial_number,
             notes, purchase_date, round_count, created_at, updated_at
      FROM firearms
    `);

    await db.run(sql`DROP TABLE firearms`);
    await db.run(sql`ALTER TABLE firearms_new RENAME TO firearms`);

    await db.run(sql`INSERT INTO schema_version (version) VALUES (5)`);
    console.log('[DB] Firearm types expanded for armory');
  }

  console.log('[DB] Migrations complete');
}
