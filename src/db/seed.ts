import { sql } from 'drizzle-orm';
import { db } from './client';

/**
 * Seed built-in drills from JSON data
 */
export async function seedBuiltinDrills(): Promise<void> {
  // Import the built-in drills data
  const builtinDrillsData = await import('@/data/builtinDrills.json');
  const drillsData = builtinDrillsData.drills;

  for (const drill of drillsData) {
    // Check if drill already exists
    const existing = await db.all(sql`
      SELECT id FROM drills WHERE id = ${drill.id}
    `);

    if (existing.length === 0) {
      // Insert the drill
      await db.run(sql`
        INSERT INTO drills (
          id, name, description, category, scoring_type, platform,
          par_time, max_points, round_count, target_count,
          distance_yards, is_builtin, created_at
        ) VALUES (
          ${drill.id},
          ${drill.name},
          ${drill.description},
          ${drill.category},
          ${drill.scoringType},
          ${drill.platform || 'handgun'},
          ${drill.parTime},
          ${drill.maxPoints},
          ${drill.roundCount},
          ${drill.targetCount},
          ${drill.distanceYards},
          1,
          datetime('now')
        )
      `);

      // Insert benchmarks for this drill
      for (const benchmark of drill.benchmarks) {
        const benchmarkId = crypto.randomUUID();
        await db.run(sql`
          INSERT INTO drill_benchmarks (id, drill_id, level, threshold)
          VALUES (${benchmarkId}, ${drill.id}, ${benchmark.level}, ${benchmark.threshold})
        `);
      }
    }
  }

  console.log(`[DB] Seeded ${drillsData.length} built-in drills`);
}
