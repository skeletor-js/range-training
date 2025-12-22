import { sql } from 'drizzle-orm';
import { db } from './client';

// Helper to generate UUIDs
const generateId = () => crypto.randomUUID();

// Gaussian random for realistic shot distribution
function gaussianRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Random choice from array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random int between min and max (inclusive)
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Random float between min and max
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Test Firearms Data
const TEST_FIREARMS = [
  // Handguns (6)
  { name: 'Glock 19 Gen 5', type: 'handgun', caliber: '9mm', manufacturer: 'Glock', model: '19 Gen 5' },
  { name: 'Sig Sauer P365', type: 'handgun', caliber: '9mm', manufacturer: 'Sig Sauer', model: 'P365' },
  { name: 'Smith & Wesson M&P Shield', type: 'handgun', caliber: '.40 S&W', manufacturer: 'Smith & Wesson', model: 'M&P Shield' },
  { name: 'CZ P-10 C', type: 'handgun', caliber: '9mm', manufacturer: 'CZ', model: 'P-10 C' },
  { name: 'Ruger Mark IV', type: 'handgun', caliber: '.22 LR', manufacturer: 'Ruger', model: 'Mark IV' },
  { name: 'Springfield 1911', type: 'handgun', caliber: '.45 ACP', manufacturer: 'Springfield', model: '1911 Loaded' },
  // Rifles (4)
  { name: 'AR-15 Build', type: 'rifle', caliber: '.223 Rem / 5.56 NATO', manufacturer: 'Aero Precision', model: 'M4E1' },
  { name: 'Ruger 10/22', type: 'rifle', caliber: '.22 LR', manufacturer: 'Ruger', model: '10/22 Carbine' },
  { name: 'Savage Axis II', type: 'rifle', caliber: '.308 Win / 7.62 NATO', manufacturer: 'Savage', model: 'Axis II XP' },
  { name: 'AK-47 Clone', type: 'rifle', caliber: '7.62x39', manufacturer: 'PSA', model: 'GF3' },
  // Air Guns (2)
  { name: 'Diana 34 EMS', type: 'air_rifle', caliber: '.177 (Air)', manufacturer: 'Diana', model: '34 EMS' },
  { name: 'Crosman 2240', type: 'air_pistol', caliber: '.22 (Air)', manufacturer: 'Crosman', model: '2240' },
];

// Test Ammo Data
const TEST_AMMO = [
  // 9mm (5 types)
  { caliber: '9mm', brand: 'Federal', productLine: 'American Eagle', grainWeight: 115, bulletType: 'FMJ', basePrice: 0.30 },
  { caliber: '9mm', brand: 'Speer', productLine: 'Gold Dot', grainWeight: 124, bulletType: 'JHP', basePrice: 0.85 },
  { caliber: '9mm', brand: 'Winchester', productLine: 'White Box', grainWeight: 115, bulletType: 'FMJ', basePrice: 0.28 },
  { caliber: '9mm', brand: 'Hornady', productLine: 'Critical Defense', grainWeight: 115, bulletType: 'JHP', basePrice: 0.95 },
  { caliber: '9mm', brand: 'Blazer', productLine: 'Brass', grainWeight: 124, bulletType: 'FMJ', basePrice: 0.26 },
  // .22 LR (3 types)
  { caliber: '.22 LR', brand: 'CCI', productLine: 'Mini-Mag', grainWeight: 36, bulletType: 'RN', basePrice: 0.09 },
  { caliber: '.22 LR', brand: 'Federal', productLine: 'AutoMatch', grainWeight: 40, bulletType: 'RN', basePrice: 0.07 },
  { caliber: '.22 LR', brand: 'Aguila', productLine: 'Super Extra', grainWeight: 40, bulletType: 'RN', basePrice: 0.08 },
  // .45 ACP (2 types)
  { caliber: '.45 ACP', brand: 'Federal', productLine: 'American Eagle', grainWeight: 230, bulletType: 'FMJ', basePrice: 0.45 },
  { caliber: '.45 ACP', brand: 'Hornady', productLine: 'Critical Duty', grainWeight: 220, bulletType: 'JHP', basePrice: 1.10 },
  // .40 S&W (2 types)
  { caliber: '.40 S&W', brand: 'Winchester', productLine: 'USA', grainWeight: 165, bulletType: 'FMJ', basePrice: 0.38 },
  { caliber: '.40 S&W', brand: 'Federal', productLine: 'HST', grainWeight: 180, bulletType: 'JHP', basePrice: 0.95 },
  // 5.56/.223 (3 types)
  { caliber: '.223 Rem / 5.56 NATO', brand: 'PMC', productLine: 'Bronze', grainWeight: 55, bulletType: 'FMJ', basePrice: 0.42 },
  { caliber: '.223 Rem / 5.56 NATO', brand: 'Federal', productLine: 'American Eagle', grainWeight: 62, bulletType: 'FMJ', basePrice: 0.48 },
  { caliber: '.223 Rem / 5.56 NATO', brand: 'Hornady', productLine: 'Frontier', grainWeight: 55, bulletType: 'FMJ', basePrice: 0.45 },
  // Other calibers
  { caliber: '7.62x39', brand: 'Wolf', productLine: 'Military Classic', grainWeight: 123, bulletType: 'FMJ', basePrice: 0.35 },
  { caliber: '.308 Win / 7.62 NATO', brand: 'Federal', productLine: 'Gold Medal', grainWeight: 168, bulletType: 'BTHP', basePrice: 1.20 },
  { caliber: '.177 (Air)', brand: 'RWS', productLine: 'Superdome', grainWeight: 8, bulletType: 'RN', basePrice: 0.02 },
];

// Range locations
const RANGE_NAMES = [
  { name: 'Thunder Valley Indoor Range', type: 'indoor', maxDistance: 25 },
  { name: 'Blue Ridge Outdoor Range', type: 'outdoor', maxDistance: 300 },
  { name: 'City Armory', type: 'indoor', maxDistance: 15 },
  { name: 'Precision Firearms Training Center', type: 'both', maxDistance: 100 },
  { name: 'Liberty Gun Club', type: 'outdoor', maxDistance: 200 },
];

// Weather conditions
const WEATHER_CONDITIONS = ['Clear', 'Partly Cloudy', 'Overcast', 'Light Rain', 'Windy'];

// Target types
const TARGET_TYPES = ['b8-repair', 'uspsa-metric', 'idpa-silhouette', 'paper-plate', 'dot-torture'];

/**
 * Generate realistic shot coordinates with gaussian distribution
 */
function generateShots(
  shotCount: number,
  skillLevel: number, // 0-1, higher = better
  distanceYards: number
): Array<{ xInches: number; yInches: number; shotNumber: number }> {
  // Base spread in inches (at 25 yards)
  const baseSpread = 4 - skillLevel * 2.5; // 4" for novice, 1.5" for expert

  // Adjust spread for distance
  const distanceMultiplier = Math.sqrt(distanceYards / 25);
  const spread = baseSpread * distanceMultiplier;

  return Array.from({ length: shotCount }, (_, i) => ({
    xInches: Number((gaussianRandom() * spread).toFixed(3)),
    yInches: Number((gaussianRandom() * spread).toFixed(3)),
    shotNumber: i + 1,
  }));
}

/**
 * Calculate group metrics from shots
 */
function calculateMetrics(shots: Array<{ xInches: number; yInches: number }>, distanceYards: number) {
  if (shots.length === 0) return null;

  // Calculate group center
  const centerX = shots.reduce((sum, s) => sum + s.xInches, 0) / shots.length;
  const centerY = shots.reduce((sum, s) => sum + s.yInches, 0) / shots.length;

  // Calculate distances from center
  const distances = shots.map(s =>
    Math.sqrt(Math.pow(s.xInches - centerX, 2) + Math.pow(s.yInches - centerY, 2))
  );

  // Extreme spread (max distance between any two shots)
  let maxDist = 0;
  for (let i = 0; i < shots.length; i++) {
    for (let j = i + 1; j < shots.length; j++) {
      const dist = Math.sqrt(
        Math.pow(shots[i].xInches - shots[j].xInches, 2) +
        Math.pow(shots[i].yInches - shots[j].yInches, 2)
      );
      if (dist > maxDist) maxDist = dist;
    }
  }

  // Mean radius
  const meanRadius = distances.reduce((sum, d) => sum + d, 0) / distances.length;

  // MOA calculation (1 MOA = 1.047 inches at 100 yards)
  const moaPerInch = 1 / (1.047 * distanceYards / 100);
  const groupSizeMoa = maxDist * moaPerInch;

  return {
    groupCenterX: Number(centerX.toFixed(3)),
    groupCenterY: Number(centerY.toFixed(3)),
    extremeSpread: Number(maxDist.toFixed(3)),
    meanRadius: Number(meanRadius.toFixed(3)),
    groupSizeMoa: Number(groupSizeMoa.toFixed(2)),
  };
}

/**
 * Seed test data into the database
 */
export async function seedTestData(): Promise<{
  firearms: number;
  ammo: number;
  purchases: number;
  sessions: number;
  targets: number;
  shots: number;
  drillAttempts: number;
  goals: number;
  ranges: number;
}> {
  const counts = {
    firearms: 0,
    ammo: 0,
    purchases: 0,
    sessions: 0,
    targets: 0,
    shots: 0,
    drillAttempts: 0,
    goals: 0,
    ranges: 0,
  };

  console.log('[TestData] Starting test data generation...');

  // 1. Insert Firearms
  const firearmIds: Map<string, string> = new Map(); // caliber -> id mapping
  const allFirearmIds: string[] = [];

  for (const firearm of TEST_FIREARMS) {
    const id = generateId();
    const roundCount = randomInt(500, 5000);

    await db.run(sql`
      INSERT INTO firearms (id, name, type, caliber, manufacturer, model, round_count, created_at)
      VALUES (${id}, ${firearm.name}, ${firearm.type}, ${firearm.caliber},
              ${firearm.manufacturer}, ${firearm.model}, ${roundCount}, datetime('now'))
    `);

    firearmIds.set(firearm.caliber, id);
    allFirearmIds.push(id);
    counts.firearms++;
  }
  console.log(`[TestData] Created ${counts.firearms} firearms`);

  // 2. Insert Ammo with Purchases
  const ammoIds: Map<string, string> = new Map(); // caliber -> id mapping
  const ammoCaliberMap: Map<string, string[]> = new Map(); // caliber -> ammo ids

  for (const ammoItem of TEST_AMMO) {
    const id = generateId();
    const reliability = randomChoice(['excellent', 'good', 'good', 'fair']);
    const accuracy = randomChoice(['excellent', 'good', 'good', 'fair']);

    // Start with some inventory
    let totalRounds = 0;

    await db.run(sql`
      INSERT INTO ammo (id, caliber, brand, product_line, grain_weight, bullet_type,
                        round_count, reliability, accuracy, created_at)
      VALUES (${id}, ${ammoItem.caliber}, ${ammoItem.brand}, ${ammoItem.productLine},
              ${ammoItem.grainWeight}, ${ammoItem.bulletType}, 0, ${reliability}, ${accuracy}, datetime('now'))
    `);

    ammoIds.set(`${ammoItem.caliber}-${ammoItem.brand}`, id);

    // Track by caliber for later use
    if (!ammoCaliberMap.has(ammoItem.caliber)) {
      ammoCaliberMap.set(ammoItem.caliber, []);
    }
    ammoCaliberMap.get(ammoItem.caliber)!.push(id);

    // Create 1-3 purchases for each ammo type
    const purchaseCount = randomInt(1, 3);
    for (let i = 0; i < purchaseCount; i++) {
      const purchaseId = generateId();
      const quantity = randomChoice([50, 100, 200, 500, 1000]);
      const priceVariance = randomFloat(0.9, 1.15);
      const priceTotal = Number((quantity * ammoItem.basePrice * priceVariance).toFixed(2));
      const sellers = ['Bass Pro Shops', 'Cabela\'s', 'Palmetto State Armory', 'Lucky Gunner', 'Ammoseek Deal', 'Local Gun Store'];

      // Purchase date in the past 6 months
      const daysAgo = randomInt(7, 180);
      const purchaseDate = new Date();
      purchaseDate.setDate(purchaseDate.getDate() - daysAgo);

      await db.run(sql`
        INSERT INTO ammo_purchases (id, ammo_id, quantity, price_total, seller, purchase_date, created_at)
        VALUES (${purchaseId}, ${id}, ${quantity}, ${priceTotal}, ${randomChoice(sellers)},
                ${formatDate(purchaseDate)}, datetime('now'))
      `);

      totalRounds += quantity;
      counts.purchases++;
    }

    // Update ammo round count
    await db.run(sql`
      UPDATE ammo SET round_count = ${totalRounds} WHERE id = ${id}
    `);

    counts.ammo++;
  }
  console.log(`[TestData] Created ${counts.ammo} ammo types with ${counts.purchases} purchases`);

  // 3. Insert Ranges
  const rangeIds: string[] = [];
  for (const range of RANGE_NAMES) {
    const id = generateId();
    await db.run(sql`
      INSERT INTO ranges (id, name, range_type, max_distance, is_favorite, created_at)
      VALUES (${id}, ${range.name}, ${range.type}, ${range.maxDistance},
              ${Math.random() > 0.5 ? 1 : 0}, datetime('now'))
    `);
    rangeIds.push(id);
    counts.ranges++;
  }
  console.log(`[TestData] Created ${counts.ranges} ranges`);

  // 4. Insert Sessions (60 sessions over 12 months)
  const sessionData: Array<{ id: string; date: Date; firearmIds: string[] }> = [];
  const now = new Date();

  for (let i = 0; i < 60; i++) {
    const sessionId = generateId();

    // Random date in the past 12 months, weighted toward weekends
    const daysAgo = randomInt(1, 365);
    const sessionDate = new Date();
    sessionDate.setDate(now.getDate() - daysAgo);

    // More sessions on weekends
    const dayOfWeek = sessionDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && Math.random() > 0.4) {
      // Move to nearest weekend
      const adjustment = dayOfWeek === 5 ? 1 : (6 - dayOfWeek);
      sessionDate.setDate(sessionDate.getDate() + adjustment);
    }

    const location = randomChoice(RANGE_NAMES).name;
    const duration = randomInt(30, 180);
    const weather = randomChoice(WEATHER_CONDITIONS);
    const temp = randomInt(45, 95);

    await db.run(sql`
      INSERT INTO sessions (id, date, location, duration_minutes, weather, temperature, created_at)
      VALUES (${sessionId}, ${formatDate(sessionDate)}, ${location}, ${duration}, ${weather}, ${temp}, datetime('now'))
    `);

    // Add 1-3 firearms to each session
    const numFirearms = randomInt(1, 3);
    const sessionFirearmIds: string[] = [];
    const usedFirearms = new Set<string>();

    for (let f = 0; f < numFirearms; f++) {
      let firearmId: string;
      do {
        firearmId = randomChoice(allFirearmIds);
      } while (usedFirearms.has(firearmId));
      usedFirearms.add(firearmId);
      sessionFirearmIds.push(firearmId);

      const sfId = generateId();
      await db.run(sql`
        INSERT INTO session_firearms (id, session_id, firearm_id)
        VALUES (${sfId}, ${sessionId}, ${firearmId})
      `);

      // Get firearm's caliber for ammo matching
      const firearmResult = await db.all(sql`SELECT caliber FROM firearms WHERE id = ${firearmId}`);
      if (firearmResult.length > 0) {
        const caliber = (firearmResult[0] as { caliber: string }).caliber;
        const compatibleAmmo = ammoCaliberMap.get(caliber);

        if (compatibleAmmo && compatibleAmmo.length > 0) {
          const ammoId = randomChoice(compatibleAmmo);
          const roundsFired = randomInt(20, 150);

          const saId = generateId();
          await db.run(sql`
            INSERT INTO session_ammo (id, session_firearm_id, ammo_id, rounds_fired)
            VALUES (${saId}, ${sfId}, ${ammoId}, ${roundsFired})
          `);
        }
      }
    }

    sessionData.push({ id: sessionId, date: sessionDate, firearmIds: sessionFirearmIds });
    counts.sessions++;
  }
  console.log(`[TestData] Created ${counts.sessions} sessions`);

  // Sort sessions by date for skill progression
  sessionData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // 5. Insert Targets and Shots
  for (let i = 0; i < sessionData.length; i++) {
    const session = sessionData[i];
    const numTargets = randomInt(0, 5);

    // Skill increases over time (0.3 to 0.85)
    const baseSkill = 0.3 + (i / sessionData.length) * 0.55;

    for (let t = 0; t < numTargets; t++) {
      const targetId = generateId();
      const targetType = randomChoice(TARGET_TYPES);
      const distance = randomChoice([5, 7, 10, 15, 25, 50]);
      const shotCount = randomInt(5, 10);

      // Add some variance to skill per target
      const skill = Math.max(0.2, Math.min(0.95, baseSkill + (Math.random() - 0.5) * 0.2));

      const shots = generateShots(shotCount, skill, distance);
      const metrics = calculateMetrics(shots, distance);

      if (!metrics) continue;

      const firearmId = randomChoice(session.firearmIds);

      await db.run(sql`
        INSERT INTO targets (id, session_id, target_type, distance_yards, shot_count,
                            group_center_x, group_center_y, extreme_spread, mean_radius, group_size_moa,
                            firearm_id, created_at)
        VALUES (${targetId}, ${session.id}, ${targetType}, ${distance}, ${shotCount},
                ${metrics.groupCenterX}, ${metrics.groupCenterY}, ${metrics.extremeSpread},
                ${metrics.meanRadius}, ${metrics.groupSizeMoa}, ${firearmId}, datetime('now'))
      `);
      counts.targets++;

      // Insert shots
      for (const shot of shots) {
        const shotId = generateId();
        await db.run(sql`
          INSERT INTO shots (id, target_id, x_inches, y_inches, shot_number, created_at)
          VALUES (${shotId}, ${targetId}, ${shot.xInches}, ${shot.yInches}, ${shot.shotNumber}, datetime('now'))
        `);
        counts.shots++;
      }
    }
  }
  console.log(`[TestData] Created ${counts.targets} targets with ${counts.shots} shots`);

  // 6. Insert Drill Attempts
  // Get all built-in drills
  const drills = await db.all(sql`
    SELECT id, name, scoring_type, par_time, max_points, round_count
    FROM drills
    WHERE is_builtin = 1
  `);

  for (const drill of drills as Array<{
    id: string;
    name: string;
    scoring_type: string;
    par_time: number | null;
    max_points: number | null;
    round_count: number;
  }>) {
    // 5-15 attempts per drill
    const attemptCount = randomInt(5, 15);

    // Pick random sessions for attempts, sorted by date for progression
    const attemptSessions = sessionData
      .sort(() => Math.random() - 0.5)
      .slice(0, attemptCount)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    for (let i = 0; i < attemptSessions.length; i++) {
      const session = attemptSessions[i];
      const attemptId = generateId();

      // Skill progression (0.3 to 0.85)
      const progress = i / attemptSessions.length;
      const baseSkill = 0.3 + progress * 0.55;
      const variance = (Math.random() - 0.5) * 0.2;
      const skill = Math.max(0.2, Math.min(0.95, baseSkill + variance));

      let timeSeconds: number | null = null;
      let points: number | null = null;
      let hits: number | null = null;
      let misses: number | null = null;
      let passed: number | null = null;

      switch (drill.scoring_type) {
        case 'time':
          // Better skill = faster time, based on par time
          if (drill.par_time) {
            const baseTime = drill.par_time * 1.5; // Start 50% over par
            const improvement = (baseTime - drill.par_time * 0.7) * skill;
            timeSeconds = Number((baseTime - improvement + (Math.random() - 0.5) * 0.5).toFixed(2));
          } else {
            timeSeconds = Number((randomFloat(2, 10) * (2 - skill)).toFixed(2));
          }
          break;

        case 'points':
          if (drill.max_points) {
            points = Math.round(drill.max_points * skill * randomFloat(0.85, 1.05));
            points = Math.min(drill.max_points, Math.max(0, points));
          }
          break;

        case 'pass_fail':
          // Higher skill = more likely to pass
          passed = Math.random() < skill ? 1 : 0;
          break;

        case 'hits':
          hits = Math.round(drill.round_count * skill * randomFloat(0.9, 1.05));
          hits = Math.min(drill.round_count, Math.max(0, hits));
          misses = drill.round_count - hits;
          break;
      }

      const firearmId = session.firearmIds.length > 0 ? randomChoice(session.firearmIds) : null;

      await db.run(sql`
        INSERT INTO drill_attempts (id, drill_id, session_id, time_seconds, points, hits, misses, passed, firearm_id, created_at)
        VALUES (${attemptId}, ${drill.id}, ${session.id}, ${timeSeconds}, ${points}, ${hits}, ${misses}, ${passed}, ${firearmId}, datetime('now'))
      `);
      counts.drillAttempts++;
    }
  }
  console.log(`[TestData] Created ${counts.drillAttempts} drill attempts`);

  // 7. Insert Goals
  const goalData = [
    { title: 'Sub-2 Second Bill Drill', description: 'Complete the Bill Drill in under 2 seconds', targetScore: 2.0 },
    { title: 'Pass Dot Torture at 5 Yards', description: 'Perfect 50/50 on Dot Torture', targetScore: 1 },
    { title: 'FAST Drill Under 5 Seconds', description: 'Complete the FAST test in under 5 seconds total', targetScore: 5.0 },
    { title: 'Master Draw to First Shot', description: 'Consistent 1.5 second draw to first shot', targetScore: 1.5 },
    { title: '100 Rounds Weekly', description: 'Maintain at least 100 rounds per week practice', targetScore: null },
  ];

  // Get drill IDs for linking
  const drillIdMap = new Map<string, string>();
  const drillResults = await db.all(sql`SELECT id, name FROM drills WHERE is_builtin = 1`);
  for (const d of drillResults as Array<{ id: string; name: string }>) {
    drillIdMap.set(d.name.toLowerCase(), d.id);
  }

  for (const goal of goalData) {
    const goalId = generateId();
    const isCompleted = Math.random() > 0.7 ? 1 : 0;

    // Try to link to a relevant drill
    let linkedDrillId: string | null = null;
    if (goal.title.includes('Bill Drill')) {
      linkedDrillId = drillIdMap.get('bill drill') || null;
    } else if (goal.title.includes('Dot Torture')) {
      linkedDrillId = drillIdMap.get('dot torture') || null;
    } else if (goal.title.includes('FAST')) {
      linkedDrillId = drillIdMap.get('fast drill') || null;
    }

    // Target date 1-3 months from now
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + randomInt(1, 3));

    await db.run(sql`
      INSERT INTO goals (id, title, description, target_date, is_completed, linked_drill_id, target_score, created_at)
      VALUES (${goalId}, ${goal.title}, ${goal.description}, ${formatDate(targetDate)},
              ${isCompleted}, ${linkedDrillId}, ${goal.targetScore}, datetime('now'))
    `);
    counts.goals++;
  }
  console.log(`[TestData] Created ${counts.goals} goals`);

  console.log('[TestData] Test data generation complete!');
  return counts;
}

/**
 * Get database table counts for stats display
 */
export async function getDatabaseStats(): Promise<Record<string, number>> {
  const tables = [
    'firearms', 'ammo', 'ammo_purchases', 'sessions', 'session_firearms',
    'session_ammo', 'targets', 'shots', 'drills', 'drill_attempts',
    'drill_benchmarks', 'goals', 'ranges', 'session_templates', 'malfunctions'
  ];

  const stats: Record<string, number> = {};

  for (const table of tables) {
    try {
      const result = await db.all(sql.raw(`SELECT COUNT(*) as count FROM ${table}`));
      stats[table] = (result[0] as { count: number }).count;
    } catch {
      stats[table] = 0;
    }
  }

  return stats;
}

/**
 * Get raw data from a table for the data viewer
 */
export async function getTableData(tableName: string, limit = 100): Promise<unknown[]> {
  const allowedTables = [
    'firearms', 'ammo', 'ammo_purchases', 'sessions', 'session_firearms',
    'session_ammo', 'targets', 'shots', 'drills', 'drill_attempts',
    'drill_benchmarks', 'goals', 'ranges', 'session_templates', 'malfunctions'
  ];

  if (!allowedTables.includes(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }

  const result = await db.all(sql.raw(`SELECT * FROM ${tableName} LIMIT ${limit}`));
  return result;
}

/**
 * Reset the database (delete all user data, keep schema)
 */
export async function resetDatabase(): Promise<void> {
  console.log('[TestData] Resetting database...');

  // Delete in order to respect foreign keys
  const tables = [
    'shots', 'targets', 'session_ammo', 'session_firearms', 'sessions',
    'ammo_purchases', 'ammo', 'firearms', 'drill_attempts', 'drill_benchmarks',
    'drills', 'goals', 'timer_sessions', 'firearm_ammo_compatibility',
    'malfunctions', 'ranges', 'session_templates'
  ];

  for (const table of tables) {
    try {
      await db.run(sql.raw(`DELETE FROM ${table}`));
      console.log(`[TestData] Cleared ${table}`);
    } catch (e) {
      console.error(`[TestData] Error clearing ${table}:`, e);
    }
  }

  // Re-seed built-in drills
  const { seedBuiltinDrills } = await import('./seed');
  await seedBuiltinDrills();

  console.log('[TestData] Database reset complete');
}
