# Range App - Product Requirements Document

**Version:** 2.2  
**Date:** December 20, 2025  
**Authors:** Jordan & Claude (CTO)

---

## 1. Executive Summary

Range App is a progressive web application (PWA) designed for recreational shooters to track their range sessions, manage ammunition inventory, document target performance, and measure improvement over time. The app prioritizes offline functionality for use at ranges with poor connectivity and provides a personal, private experience for a small group of friends.

### Core Value Proposition

A single place to answer: "How am I improving as a shooter?" by connecting session logs, ammunition usage, target performance, and drill scores into a coherent personal record.

---

## 2. Target Users

### Primary Users
- Small group of friends (5-10 people) who shoot recreationally
- Mix of handgun, rifle, and potentially shotgun disciplines
- Frequency: 1-4 range visits per month
- Tech comfort: Comfortable with mobile apps, not necessarily technical

### User Needs
- Track what ammo works well in which firearms
- See progress over time (am I getting better?)
- Remember what happened at past sessions
- Find good ammo deals and remember price benchmarks
- Have fun with the data (streaks, visualizations)

### Non-Users (Out of Scope)
- Competitive shooters needing split-second timing data
- Commercial ranges or instructors
- Firearms dealers or FFLs

---

## 3. Technical Architecture

### Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Vite + React 18 | Fast builds, simple mental model, no SSR complexity |
| PWA | vite-plugin-pwa | Mature PWA tooling, service worker generation |
| Language | TypeScript | Type safety for complex data relationships |
| Styling | Tailwind CSS | Rapid UI development, good mobile defaults |
| UI Components | shadcn/ui | Copy-paste components, full customization, dark mode |
| Database | SQLocal + Drizzle ORM | SQLite in OPFS with type-safe queries |
| Forms | React Hook Form + Zod | Minimal re-renders, schema validation |
| State | Zustand | Lightweight, works well with async DB queries |
| Image Zoom | react-zoom-pan-pinch | Pinch/pan/zoom for target photos during capture |
| Calendar | @uiw/react-heat-map | GitHub-style contribution graph |
| Hosting | Vercel or Cloudflare Pages | Free tier, static hosting |

### Why This Stack

**Vite + React over Next.js:** This is a fully client-side PWA with no backend, no SSR, and no dynamic server routes. Next.js adds complexity without value for this use case.

**SQLocal over raw sqlite-wasm:** SQLocal wraps the official SQLite WASM build with a clean API, handles web worker threading, and integrates with Drizzle ORM for type-safe queries. This saves 1-2 weeks of low-level setup.

**shadcn/ui over custom components:** Copy-paste components built on Tailwind + Radix UI. We own the code, can customize for our dark/tactical aesthetic, and avoid npm dependency bloat.

**React Hook Form over TanStack Form:** Our forms (session logging, firearm entry, ammo entry) are straightforward CRUD. RHF is simpler and has zero dependencies.

### Open Source Libraries

| Library | Purpose | Savings |
|---------|---------|---------|
| sqlocal | SQLite wrapper with OPFS + Drizzle integration | ~1 week |
| drizzle-orm | Type-safe SQL queries | Built into sqlocal |
| react-zoom-pan-pinch | Pinch/pan/zoom during target capture | ~4 days |
| @uiw/react-heat-map | Calendar heatmap visualization | ~4 days |
| react-hook-form | Form state management | ~3 days |
| zod | Schema validation | Pairs with RHF |
| shadcn/ui | UI component library | ~1 week |
| zustand | Global state management | Standard choice |
| vite-plugin-pwa | PWA manifest + service worker | Standard choice |

**Total estimated savings: ~4 weeks** compared to building from scratch.

### PWA Requirements

| Requirement | Implementation |
|-------------|----------------|
| Offline First | Service worker caches app shell; all data in local SQLite |
| Installable | Web app manifest with proper icons, splash screens |
| Storage | SQLite database file in OPFS via SQLocal |
| Backup/Restore | Export .db or JSON to device Files app |

### Data Architecture

**Local-only by design.** No backend, no accounts, no sync. Data lives entirely on the user's device in a SQLite database stored in OPFS.

**Image-free storage.** Photos are used only during target capture for calibration and shot marking. Once shots are converted to real-world coordinates, the image is discarded. Only coordinates and computed metrics are persisted.

**Backup strategy:** Users explicitly export their data to device storage (Files app on iOS, Downloads on Android). This is the canonical backup—the in-browser database is treated as hot storage that could theoretically be cleared.

```
┌─────────────────────────────────────────────────┐
│                   User's Device                 │
├─────────────────────────────────────────────────┤
│  Files App (iOS) / Downloads (Android)          │
│  └── range-backup-2025-12-20.db   ← Canonical   │
│      (or .json export)              backup      │
├─────────────────────────────────────────────────┤
│  Browser (PWA)                                  │
│  └── OPFS (via SQLocal)                         │
│      └── range-app.db  ← Hot storage (~2MB)     │
│          ├── firearms                           │
│          ├── ammo                               │
│          ├── sessions                           │
│          ├── targets (metrics only, no images)  │
│          └── shots (real-world coordinates)     │
└─────────────────────────────────────────────────┘
```

### Storage Comparison

| Approach | 100 Targets | 1000 Targets | Backup Size |
|----------|-------------|--------------|-------------|
| Store images (~200KB each) | ~20MB | ~200MB | Large |
| **Coordinates only (~2KB each)** | **~200KB** | **~2MB** | **Tiny** |

### Why No Image Storage

1. **90%+ smaller database** — Backups are trivial, sync (if ever added) is feasible
2. **Faster everything** — No blob handling, instant queries
3. **Better visualization** — Clean SVG templates vs. messy photos of paper with holes
4. **Privacy** — No photos of your range sessions stored on device
5. **Consistent UX** — All targets render identically when viewing history
6. **Portable data** — Export as JSON with just coordinates, import anywhere

**What you lose:**
- Can't see actual bullet holes → Metrics tell the real story
- Can't verify data later → Trust measurement at capture time
- No "proof" of group → This is personal tracking, not competition scoring

### Target Capture Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    CAPTURE (Transient)                       │
├──────────────────────────────────────────────────────────────┤
│  1. Open camera or select from gallery                       │
│  2. Photo loaded into memory (NOT persisted)                 │
│  3. User selects target type or "Custom"                     │
│  4. User calibrates: align overlay OR draw reference line    │
│  5. User marks shots by tapping on image                     │
│  6. User sets point of aim (POA)                             │
│  7. System converts pixel coords → real-world inches         │
│  8. System calculates group metrics                          │
│  9. Save coordinates + metrics to database                   │
│  10. Release image from memory (garbage collected)           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    DISPLAY (Persistent)                      │
├──────────────────────────────────────────────────────────────┤
│  1. Load target type from database                           │
│  2. Render appropriate SVG template (or neutral grid)        │
│  3. Plot shots at stored real-world coordinates              │
│  4. Draw group circle overlay                                │
│  5. Display metrics (MOA, spread, offset)                    │
└──────────────────────────────────────────────────────────────┘
```

### Target Templates

For standard targets, we bundle lightweight SVG templates:

```typescript
// src/lib/targetTemplates.ts
export const TARGET_TEMPLATES = {
  'b8-repair': {
    name: 'B-8 Repair Center',
    svg: '/targets/b8-repair.svg',
    widthInches: 5.5,
    heightInches: 5.5,
    rings: [
      { diameter: 1.695, label: 'X', points: 10 },
      { diameter: 3.36, label: '10', points: 10 },
      { diameter: 4.0, label: '9', points: 9 },
      { diameter: 5.0, label: '8', points: 8 },
    ],
    referenceFeature: 'X-ring diameter',
    referenceInches: 1.695,
  },
  'b8-full': {
    name: 'B-8 Full (25 yard)',
    svg: '/targets/b8-full.svg',
    widthInches: 12,
    heightInches: 12,
    // ... ring definitions
  },
  'uspsa-metric': {
    name: 'USPSA Metric',
    svg: '/targets/uspsa-metric.svg',
    widthInches: 18,
    heightInches: 30,
    zones: [
      { id: 'A', points: 5 },
      { id: 'C', points: 3 },
      { id: 'D', points: 1 },
    ],
    referenceFeature: 'A-zone width',
    referenceInches: 6.0,
  },
  'idpa': {
    name: 'IDPA Target',
    svg: '/targets/idpa.svg',
    widthInches: 18,
    heightInches: 30,
    zones: [
      { id: '-0', points: 0 },
      { id: '-1', points: -1 },
      { id: '-3', points: -3 },
    ],
    referenceFeature: '-0 zone width',
    referenceInches: 8.0,
  },
  '3x5-card': {
    name: '3x5 Index Card',
    svg: '/targets/3x5-card.svg',
    widthInches: 3,
    heightInches: 5,
    referenceFeature: 'Card width',
    referenceInches: 3.0,
  },
  'circle-5': {
    name: '5" Circle',
    svg: '/targets/circle-5.svg',
    widthInches: 5,
    heightInches: 5,
    referenceFeature: 'Circle diameter',
    referenceInches: 5.0,
  },
  'circle-8': {
    name: '8" Circle',
    svg: '/targets/circle-8.svg',
    widthInches: 8,
    heightInches: 8,
    referenceFeature: 'Circle diameter',
    referenceInches: 8.0,
  },
  'custom': {
    name: 'Custom Target',
    svg: null, // Render on neutral grid
    widthInches: null, // Determined by shot bounds
    heightInches: null,
  },
} as const;

export type TargetType = keyof typeof TARGET_TEMPLATES;
```

### Target Visualization Component

```tsx
// src/components/target/TargetVisualization.tsx
import { TARGET_TEMPLATES } from '@/lib/targetTemplates';

interface Props {
  targetType: string;
  shots: Array<{ xInches: number; yInches: number }>;
  groupCenterX: number;
  groupCenterY: number;
  extremeSpread: number;
  distanceYards: number;
  groupSizeMoa: number;
}

export function TargetVisualization({ 
  targetType, 
  shots, 
  groupCenterX, 
  groupCenterY,
  extremeSpread,
  distanceYards,
  groupSizeMoa,
}: Props) {
  const template = TARGET_TEMPLATES[targetType];
  const SCALE = 40; // pixels per inch for display
  
  // For custom targets, calculate bounds from shots
  const bounds = template.svg 
    ? { width: template.widthInches, height: template.heightInches }
    : calculateBoundsFromShots(shots);
  
  const width = bounds.width * SCALE;
  const height = bounds.height * SCALE;
  const centerX = width / 2;
  const centerY = height / 2;
  
  return (
    <div className="relative bg-neutral-900 rounded-lg overflow-hidden">
      {/* Background: SVG template or neutral grid */}
      {template.svg ? (
        <img 
          src={template.svg} 
          alt={template.name}
          className="w-full"
          style={{ width, height }}
        />
      ) : (
        <NeutralGrid width={width} height={height} scale={SCALE} />
      )}
      
      {/* POA crosshair at center */}
      <Crosshair 
        x={centerX} 
        y={centerY} 
        className="text-amber-500/50" 
      />
      
      {/* Shot markers */}
      {shots.map((shot, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-red-300 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: centerX + (shot.xInches * SCALE),
            top: centerY - (shot.yInches * SCALE), // Y flipped
          }}
        />
      ))}
      
      {/* Group circle */}
      <div
        className="absolute border-2 border-amber-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: centerX + (groupCenterX * SCALE),
          top: centerY - (groupCenterY * SCALE),
          width: extremeSpread * SCALE,
          height: extremeSpread * SCALE,
        }}
      />
      
      {/* Group center marker */}
      <div
        className="absolute w-2 h-2 bg-amber-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{
          left: centerX + (groupCenterX * SCALE),
          top: centerY - (groupCenterY * SCALE),
        }}
      />
      
      {/* Metrics overlay */}
      <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1 text-xs text-white">
        <div>{extremeSpread.toFixed(2)}" / {groupSizeMoa.toFixed(2)} MOA</div>
        <div>{shots.length} shots @ {distanceYards} yds</div>
      </div>
    </div>
  );
}

function NeutralGrid({ width, height, scale }: { width: number; height: number; scale: number }) {
  const gridLines = [];
  
  // 1-inch grid
  for (let x = scale; x < width; x += scale) {
    gridLines.push(
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={height} stroke="#333" strokeWidth="1" />
    );
  }
  for (let y = scale; y < height; y += scale) {
    gridLines.push(
      <line key={`h${y}`} x1={0} y1={y} x2={width} y2={y} stroke="#333" strokeWidth="1" />
    );
  }
  
  return (
    <svg width={width} height={height} className="bg-neutral-800">
      {gridLines}
    </svg>
  );
}

function Crosshair({ x, y, className }: { x: number; y: number; className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <div 
        className="absolute w-px h-8 bg-current transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: y }}
      />
      <div 
        className="absolute w-8 h-px bg-current transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: x, top: y }}
      />
    </div>
  );
}
```

### Export/Import Implementation

```typescript
import { SQLocal } from 'sqlocal';

// Export to device Files
async function exportDatabase() {
  const db = new SQLocal('range-app.db');
  const dbBytes = await db.getDatabaseFile(); // Uint8Array
  const blob = new Blob([dbBytes], { type: 'application/x-sqlite3' });
  const file = new File([blob], `range-backup-${Date.now()}.db`);
  
  // Use native share sheet (iOS saves to Files, Android to Downloads)
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Range App Backup' });
  } else {
    // Fallback: trigger download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Import from file
async function importDatabase(file: File) {
  const buffer = await file.arrayBuffer();
  const db = new SQLocal('range-app.db');
  await db.overwriteDatabaseFile(new Uint8Array(buffer));
  // Reload app state from new database
  window.location.reload();
}

// Export as JSON (human-readable, portable)
async function exportAsJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.2',
    firearms: await db.select().from(firearms),
    ammo: await db.select().from(ammo),
    sessions: await db.select().from(sessions),
    targets: await db.select().from(targets),
    shots: await db.select().from(shots),
    drills: await db.select().from(drills),
    drillAttempts: await db.select().from(drillAttempts),
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const file = new File([blob], `range-export-${Date.now()}.json`);
  
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Range App Export' });
  }
}
```

---

## 4. Data Model

### Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Firearm   │────<│   Session   │>────│    Ammo     │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ Target  │ │  Drill  │ │  Notes  │
        │(no img) │ │ Attempt │ │         │
        └────┬────┘ └─────────┘ └─────────┘
             │
             ▼
        ┌─────────┐
        │  Shots  │
        │(inches) │
        └─────────┘
```

### Drizzle Schema

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const firearms = sqliteTable('firearms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['handgun', 'rifle', 'shotgun', 'other'] }),
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

export const sessionFirearms = sqliteTable('session_firearms', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  firearmId: text('firearm_id').notNull().references(() => firearms.id),
});

export const sessionAmmo = sqliteTable('session_ammo', {
  id: text('id').primaryKey(),
  sessionFirearmId: text('session_firearm_id').notNull().references(() => sessionFirearms.id, { onDelete: 'cascade' }),
  ammoId: text('ammo_id').notNull().references(() => ammo.id),
  roundsFired: integer('rounds_fired').notNull(),
});

// TARGETS: No image storage - only coordinates and metrics
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

// SHOTS: Real-world coordinates relative to POA
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

export const drills = sqliteTable('drills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category', { enum: ['speed', 'accuracy', 'movement', 'reload', 'other'] }),
  scoringType: text('scoring_type', { enum: ['time', 'points', 'pass_fail', 'hits'] }),
  parTime: real('par_time'),
  maxPoints: integer('max_points'),
  roundCount: integer('round_count').notNull(),
  targetCount: integer('target_count').default(1),
  distanceYards: real('distance_yards'),
  isBuiltin: integer('is_builtin', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const drillBenchmarks = sqliteTable('drill_benchmarks', {
  id: text('id').primaryKey(),
  drillId: text('drill_id').notNull().references(() => drills.id, { onDelete: 'cascade' }),
  level: text('level').notNull(),
  threshold: real('threshold').notNull(),
});

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

export const timerSessions = sqliteTable('timer_sessions', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => sessions.id, { onDelete: 'cascade' }),
  startedAt: text('started_at').notNull(),
  initialDuration: integer('initial_duration').notNull(),
  timeAdded: integer('time_added').default(0),
  endedAt: text('ended_at'),
  completedFully: integer('completed_fully', { mode: 'boolean' }).default(false),
});

export const schemaVersion = sqliteTable('schema_version', {
  version: integer('version').primaryKey(),
  appliedAt: text('applied_at').default(sql`(datetime('now'))`),
});
```

### Database Initialization

```typescript
// src/db/index.ts
import { SQLocalDrizzle } from 'sqlocal/drizzle';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

const { driver, batchDriver } = new SQLocalDrizzle('range-app.db');
export const db = drizzle(driver, batchDriver, { schema });

// Initialize schema on first load
export async function initializeDatabase() {
  // Check if schema exists
  const tables = await db.run(sql`
    SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'
  `);
  
  if (tables.length === 0) {
    // Run initial schema creation
    await createInitialSchema();
  } else {
    // Run migrations if needed
    await runMigrations();
  }
}
```

---

## 5. Feature Specifications

### Phase 1: Core Loop (MVP)

**Goal:** A usable app that tracks range sessions with target measurements.

#### 5.1 Range Session Logger

**User Story:** As a shooter, I want to log my range visits so I can remember what I did and see my activity over time.

**Requirements:**
- Create new session with date (defaults to today)
- Add optional location, start/end time
- Free-form notes field (markdown)
- Select firearms used from library (quick-add if not exists)
- Log ammo used per firearm (rounds fired)
- Auto-deduct from ammo inventory

**Implementation:**
- Use React Hook Form + Zod for form validation
- shadcn/ui components for inputs, selects, modals
- Zustand for active session state

**UI:**
- Session list view (recent first)
- Session detail/edit view
- Floating action button to start new session
- "Quick session" mode for minimal data entry

#### 5.2 Target Capture & Shot Marking (HIGH PRIORITY)

**User Story:** As a shooter, I want to photograph my targets and mark my shots so I can measure my groups and track accuracy.

**This is the hardest UX problem in the app. Prioritize early prototyping.**

**Key Insight:** The photo is scaffolding for data entry. Once shots are converted to real-world coordinates, the image is discarded. Only coordinates and metrics are persisted.

**Requirements:**
- Open camera or select photo from gallery
- Photo loaded into memory only (never persisted)
- Pinch-to-zoom and pan using `react-zoom-pan-pinch`
- Tap to place shot markers (draggable for adjustment)
- Select target type for calibration OR input custom reference
- Set point of aim (POA) marker
- Input distance to target
- On save:
  - Convert pixel coordinates to real-world inches
  - Calculate group metrics
  - Store only coordinates and metrics
  - Release image from memory

**Implementation:**

```typescript
// src/lib/captureTarget.ts
import { TARGET_TEMPLATES } from './targetTemplates';
import { calculateGroupMetrics } from './measurements';
import { db } from '@/db';
import { targets, shots } from '@/db/schema';
import { generateId } from './utils';

interface CaptureResult {
  targetType: string;
  distanceYards: number;
  pixelsPerInch: number;
  poa: { x: number; y: number };  // pixels
  shots: Array<{ x: number; y: number }>;  // pixels
  firearmId?: string;
  ammoId?: string;
  notes?: string;
}

export async function saveTarget(sessionId: string, capture: CaptureResult) {
  const { targetType, distanceYards, pixelsPerInch, poa, shots: pixelShots } = capture;
  
  // Convert pixel coordinates to real-world inches relative to POA
  const realShots = pixelShots.map((shot, i) => ({
    xInches: (shot.x - poa.x) / pixelsPerInch,
    yInches: (poa.y - shot.y) / pixelsPerInch,  // flip Y axis (screen Y is inverted)
    shotNumber: i + 1,
  }));
  
  // Calculate group metrics
  const metrics = calculateGroupMetrics(realShots, distanceYards);
  
  // Generate IDs
  const targetId = generateId();
  
  // Save target (NO image)
  await db.insert(targets).values({
    id: targetId,
    sessionId,
    targetType,
    distanceYards,
    calibrationType: TARGET_TEMPLATES[targetType]?.svg ? 'preset' : 'custom',
    shotCount: realShots.length,
    groupCenterX: metrics.groupCenter.x,
    groupCenterY: metrics.groupCenter.y,
    extremeSpread: metrics.extremeSpread,
    meanRadius: metrics.meanRadius,
    groupSizeMoa: metrics.moa,
    firearmId: capture.firearmId,
    ammoId: capture.ammoId,
    notes: capture.notes,
  });
  
  // Save individual shots
  for (const shot of realShots) {
    await db.insert(shots).values({
      id: generateId(),
      targetId,
      xInches: shot.xInches,
      yInches: shot.yInches,
      shotNumber: shot.shotNumber,
    });
  }
  
  return targetId;
}
```

**Capture UI Component:**

```tsx
// src/components/target/TargetCapture.tsx
import { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { TARGET_TEMPLATES } from '@/lib/targetTemplates';
import { saveTarget } from '@/lib/captureTarget';

interface Props {
  sessionId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function TargetCapture({ sessionId, onComplete, onCancel }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<string>('b8-repair');
  const [distanceYards, setDistanceYards] = useState<number>(25);
  const [pixelsPerInch, setPixelsPerInch] = useState<number | null>(null);
  const [poa, setPoa] = useState<{ x: number; y: number } | null>(null);
  const [shots, setShots] = useState<Array<{ x: number; y: number }>>([]);
  const [mode, setMode] = useState<'calibrate' | 'poa' | 'shots'>('calibrate');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Open camera/gallery
  const handleSelectImage = async () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Load into memory only - NOT persisted
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setMode('calibrate');
    }
  };
  
  // Handle tap on image
  const handleImageTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mode === 'poa') {
      setPoa({ x, y });
      setMode('shots');
    } else if (mode === 'shots') {
      setShots([...shots, { x, y }]);
    }
  };
  
  // Save and cleanup
  const handleSave = async () => {
    if (!pixelsPerInch || !poa || shots.length === 0) return;
    
    await saveTarget(sessionId, {
      targetType,
      distanceYards,
      pixelsPerInch,
      poa,
      shots,
    });
    
    // Release image from memory
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    
    onComplete();
  };
  
  // Cancel and cleanup
  const handleCancel = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    onCancel();
  };
  
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      
      {!imageUrl ? (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={handleSelectImage}
            className="bg-amber-500 text-black px-6 py-3 rounded-lg font-semibold"
          >
            Take Photo or Select Image
          </button>
        </div>
      ) : (
        <>
          {/* Image canvas with zoom/pan */}
          <div className="flex-1 relative">
            <TransformWrapper>
              <TransformComponent>
                <div className="relative" onClick={handleImageTap}>
                  <img src={imageUrl} alt="Target" className="max-w-full" />
                  
                  {/* POA marker */}
                  {poa && (
                    <div
                      className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: poa.x, top: poa.y }}
                    >
                      <div className="w-full h-px bg-amber-500 absolute top-1/2" />
                      <div className="w-px h-full bg-amber-500 absolute left-1/2" />
                    </div>
                  )}
                  
                  {/* Shot markers */}
                  {shots.map((shot, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: shot.x, top: shot.y }}
                    />
                  ))}
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
          
          {/* Bottom toolbar */}
          <div className="bg-neutral-900 p-4 space-y-4">
            {/* Mode-specific instructions */}
            <div className="text-center text-sm text-neutral-400">
              {mode === 'calibrate' && 'Select target type and calibrate'}
              {mode === 'poa' && 'Tap to set point of aim'}
              {mode === 'shots' && `Tap to mark shots (${shots.length} marked)`}
            </div>
            
            {/* Controls */}
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 text-neutral-400">
                Cancel
              </button>
              <button
                onClick={() => setShots(shots.slice(0, -1))}
                disabled={shots.length === 0}
                className="px-4 py-2 text-amber-500 disabled:opacity-50"
              >
                Undo
              </button>
              <button
                onClick={handleSave}
                disabled={!pixelsPerInch || !poa || shots.length === 0}
                className="flex-1 bg-amber-500 text-black py-2 rounded-lg font-semibold disabled:opacity-50"
              >
                Save Target
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**UI Flow:**
1. Tap "Add Target" → opens camera or file picker
2. Photo loads in full-screen canvas with zoom/pan
3. Select target type from dropdown (or "Custom")
4. If preset: drag overlay to align, system calculates pixels-per-inch
5. If custom: draw line between two points, enter real dimension
6. Tap to set POA (point of aim)
7. Tap to mark each shot (draggable to adjust)
8. Tap "Save" → coordinates converted, metrics calculated, image released
9. Target list shows rendered visualization (not original photo)

#### 5.3 Firearms Library

**Requirements:**
- Add/edit/delete firearms
- Track total round count (auto-incremented from sessions)
- Filter/search

**Implementation:**
- shadcn/ui Card components for list view
- React Hook Form for add/edit forms
- Drizzle queries with Zustand for state

#### 5.4 Basic Ammo Inventory

**Requirements:**
- Add ammo by caliber/brand/grain
- Track current quantity
- Manual adjustment (add/remove rounds)
- Auto-deduct when logging sessions

**UI:**
- List grouped by caliber using shadcn/ui Accordion
- Quantity badges
- Low stock warnings (configurable threshold)

#### 5.5 Calendar Heatmap View

**User Story:** As a shooter, I want to see my range activity at a glance, like a GitHub contribution graph.

**Implementation:**

```typescript
import HeatMap from '@uiw/react-heat-map';
import { useSessions } from '@/hooks/useSessions';

function SessionCalendar() {
  const { sessions } = useSessions();
  
  const heatmapData = sessions.map(s => ({
    date: s.date,
    count: s.roundsFired || 1, // Color intensity
  }));
  
  return (
    <HeatMap
      value={heatmapData}
      startDate={new Date('2025/01/01')}
      endDate={new Date('2025/12/31')}
      width="100%"
      style={{ '--rhm-rect-active': '#ff6b00' }} // Amber theme
      rectProps={{ rx: 2 }}
      legendCellSize={0} // Hide legend for cleaner mobile view
      panelColors={['#1a1a1a', '#4a2800', '#7a4500', '#b36200', '#ff6b00']}
    />
  );
}
```

**Requirements:**
- Year view showing all days
- Color intensity based on sessions or rounds fired
- Click on day to see session(s)
- Show current streak and longest streak

#### 5.6 Basic Timer

**For MVP, ship a functional timer. Fancy UI comes later.**

**Requirements:**
- Set countdown duration (presets: 5:00, 10:00, 15:00, 30:00)
- Start/pause/reset
- +1:00 / +5:00 buttons to add time
- Audio/vibration alert on completion
- Auto-log elapsed time to session

**UI (MVP):**
- Large readable digits (standard font is fine)
- Clear start/pause button
- Progress indicator

---

### Phase 2: Inventory Enhancement

**Goal:** Full ammo tracking with purchase history and reviews.

#### 2.1 Ammo Purchase Tracking

- Log purchases with quantity, price, seller, date
- Calculate and display price-per-round
- Purchase history per ammo type

#### 2.2 Ammo Reviews

- Rate ammo (1-5 stars)
- Reliability and accuracy ratings
- Free-form review notes

#### 2.3 Ammo-Firearm Compatibility Notes

- Link ammo to firearms with notes
- Track which ammo runs well in which guns

---

### Phase 3: Performance Tracking

**Goal:** Structured practice and progress measurement.

#### 3.1 Drill Library

- Pre-loaded common drills (Bill Drill, El Presidente, etc.)
- Create custom drills
- Drill details: description, round count, par time, distance

#### 3.2 Drill Performance Logging

- Log attempts with time/score
- Link to session and target
- Track personal bests
- Progress chart per drill

#### 3.3 Goals Page

- Create free-form goals
- Optional target date
- Mark complete

---

### Phase 4: Polish

**Goal:** Refinement based on real usage.

#### 4.1 Retro LED Timer (Deferred from MVP)

Distinctive seven-segment LED display with:
- Amber/red digit color with glow effect
- Visible "off" segments
- Progress bar that depletes
- Industrial/tactical button styling

This is a "delight" feature, not core functionality. Ship after the core loop is validated.

#### 4.2 Data Visualization

- Price trends for ammo over time
- Accuracy trends per firearm/ammo combo
- Session frequency and round count charts

#### 4.3 Performance Optimization

- Lazy loading for session history
- Database query optimization

---

## 6. User Experience

### Design Principles

1. **Offline First:** Every action must work without connectivity. No spinners waiting for network.

2. **Speed Over Features:** Fast interactions trump comprehensive data entry. Users are at the range, possibly in sun glare, possibly with gloves.

3. **Progressive Disclosure:** Start simple, reveal complexity on demand. Quick session = date + notes. Full session = everything linked.

4. **Mobile Primary:** Design for phone-in-hand at the range. Desktop is secondary viewing mode.

5. **Data Over Photos:** Clean visualizations tell the story better than messy photos of paper with holes.

### Key Screens

1. **Home / Dashboard**
   - Calendar heatmap (current year)
   - Quick stats (streak, total sessions, rounds this month)
   - Recent sessions list
   - FAB: New Session

2. **Session Detail**
   - Date, location, duration
   - Timer
   - Firearms + ammo used
   - Targets gallery (rendered visualizations, not photos)
   - Drill attempts
   - Notes

3. **Target Viewer**
   - SVG template with shot overlay
   - Group circle visualization
   - Metrics display (MOA, spread, offset)
   - Tap to expand full screen

4. **Target Capture** (transient)
   - Full-screen photo with zoom/pan
   - Calibration overlay
   - Shot marking mode
   - Photo discarded after save

5. **Inventory**
   - Tab: Firearms
   - Tab: Ammo
   - Search/filter

6. **Settings**
   - Export data (.db or .json)
   - Import data
   - About

### Navigation

Bottom tab bar using shadcn/ui: Home, Sessions, Inventory, Settings

### Color Palette

| Use | Color | Notes |
|-----|-------|-------|
| Primary | #ff6b00 (Amber) | Range equipment feel |
| Background | #0f0f0f | Dark, reduces glare outdoors |
| Surface | #1a1a1a | Cards, modals |
| Text | #ffffff | Primary text |
| Text secondary | #888888 | Labels, hints |
| Success | #22c55e | Completed goals, good ratings |
| Warning | #eab308 | Low stock |
| Error | #ef4444 | Errors, poor ratings |
| Shot marker | #ef4444 | Red for visibility |
| Group circle | #ff6b00 | Amber, matches primary |
| POA crosshair | #ff6b00/50 | Semi-transparent amber |

---

## 7. Target Measurement Algorithm

### Coordinate System

All shot positions are stored in **real-world inches relative to point of aim (POA)**:
- **X axis:** Positive = right of POA
- **Y axis:** Positive = above POA

This allows shots to be rendered on any representation of the target.

### Calibration Process

```typescript
// During capture: convert pixels to inches
function calibrate(
  referencePixels: number,  // measured on screen
  referenceInches: number   // known real dimension
): number {
  return referencePixels / referenceInches;  // pixels per inch
}

// Convert a shot from pixels to inches
function pixelToInches(
  shotPixel: { x: number; y: number },
  poaPixel: { x: number; y: number },
  pixelsPerInch: number
): { xInches: number; yInches: number } {
  return {
    xInches: (shotPixel.x - poaPixel.x) / pixelsPerInch,
    yInches: (poaPixel.y - shotPixel.y) / pixelsPerInch,  // Y flipped
  };
}
```

### Group Size Calculations

```typescript
interface GroupMetrics {
  extremeSpread: number;      // Inches (diameter of smallest enclosing circle)
  meanRadius: number;         // Inches (average distance from group center)
  groupCenter: { x: number; y: number };  // Inches from POA
  moa: number;                // MOA equivalent of extreme spread
}

function calculateGroupMetrics(
  shots: Array<{ xInches: number; yInches: number }>,
  distanceYards: number
): GroupMetrics {
  // Group center (centroid)
  const centerX = shots.reduce((sum, s) => sum + s.xInches, 0) / shots.length;
  const centerY = shots.reduce((sum, s) => sum + s.yInches, 0) / shots.length;
  
  // Extreme spread (max distance between any two shots)
  let maxDist = 0;
  for (let i = 0; i < shots.length; i++) {
    for (let j = i + 1; j < shots.length; j++) {
      const dist = Math.hypot(
        shots[j].xInches - shots[i].xInches,
        shots[j].yInches - shots[i].yInches
      );
      maxDist = Math.max(maxDist, dist);
    }
  }
  
  // Mean radius from group center
  const meanRadius = shots.reduce((sum, s) => 
    sum + Math.hypot(s.xInches - centerX, s.yInches - centerY), 0
  ) / shots.length;
  
  // Convert to MOA (1 MOA ≈ 1.047" at 100 yards)
  const inchesPerMOA = 1.047 * (distanceYards / 100);
  
  return {
    extremeSpread: Math.round(maxDist * 100) / 100,
    meanRadius: Math.round(meanRadius * 100) / 100,
    groupCenter: { 
      x: Math.round(centerX * 100) / 100, 
      y: Math.round(centerY * 100) / 100 
    },
    moa: Math.round((maxDist / inchesPerMOA) * 100) / 100
  };
}
```

---

## 8. Pre-loaded Data

### Target Types

| Name | Reference Feature | Size (inches) | Has SVG |
|------|-------------------|---------------|---------|
| B-8 Repair Center | X-ring diameter | 1.695 | ✓ |
| B-8 Full | 10-ring outer diameter | 3.36 | ✓ |
| USPSA Metric | A-zone width | 6.0 | ✓ |
| USPSA Classic | A-zone width | 6.0 | ✓ |
| NRA B-27 | X-ring width | 4.0 | ✓ |
| IDPA | -0 zone width | 8.0 | ✓ |
| 3x5 Index Card | Card width | 3.0 | ✓ |
| 5" Circle | Circle diameter | 5.0 | ✓ |
| 8" Circle | Circle diameter | 8.0 | ✓ |
| 8.5x11 Paper | Paper width | 8.5 | ✓ |
| Custom | User-defined | User-defined | Grid |

### Drill Library

**Speed Drills:**
- Bill Drill — 6 rounds, 7 yards. Par: 2.0s
- Failure Drill — 3 rounds (2 body + 1 head), 7 yards. Par: 2.5s
- Draw to First Shot — 1 round, 7 yards. Par: 1.5s

**Accuracy Drills:**
- Dot Torture — 50 rounds, 3 yards. Pass/Fail
- 5x5 Drill — 25 rounds, 5 yards, 5" circle. Par: 5.0s/string
- 10-10-10 — 10 rounds, 10 yards, 10" circle. Par: 10s

**Standards:**
- FAST Drill — 6 rounds, 7 yards
- El Presidente — 12 rounds, 10 yards, 3 targets. Par: 10s
- Casino Drill — 21 rounds, various distances

---

## 9. Success Metrics

Since this is a personal/friends project, "success" is qualitative:

1. **Actually gets used** — Users log sessions consistently
2. **Provides insight** — Users can answer "am I improving?"
3. **Doesn't break** — App works reliably offline
4. **Stays simple** — Doesn't become a chore to use
5. **Data survives** — No one loses their history
6. **Backups are tiny** — Easy to share, store, archive

---

## 10. Out of Scope (v1)

- User accounts / authentication
- Cloud sync / multi-device
- Social features / sharing
- Shot timer with audio detection (use dedicated hardware)
- Automatic shot detection from photos (ML)
- E-commerce / ammo price aggregation
- Maintenance tracking (cleaning, parts replacement)
- Fancy retro LED timer (deferred to Phase 4)
- Storing original target photos (by design)

---

## 11. Open Questions & Risks

### Open Questions

1. **OPFS persistence on iOS Safari:** Need to validate with real-world testing. Week 0 spike will answer this.

2. **Calibration UX:** How intuitive is overlay alignment on a phone screen in sunlight? Early prototype required.

3. **SQLocal export API:** Verify the exact method for exporting the database file. Documentation is sparse.

4. **Custom target visualization:** Does a neutral grid feel sufficient, or do users want to sketch the target shape?

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| OPFS eviction on Safari | Unknown | High | Week 0 spike; explicit backup prompts |
| Calibration UX too complex | Medium | High | Early prototype, user testing at range |
| Users miss having photos | Low | Low | Explain upfront; metrics are what matter |
| Scope creep | High | Medium | Ruthless prioritization, MVP first |
| Library maintenance | Low | Medium | shadcn/ui is copy-paste, SQLocal is active |
| Never gets used | Medium | High | Dogfood immediately |

---

## 12. Development Phases & Timeline

### Week 0: Storage Validation Spike (3-5 days)

**Before building anything else, validate our storage assumptions.**

Deliverables:
1. Minimal Vite + React app with SQLocal + Drizzle
2. Store test data, verify OPFS persistence
3. Test on iOS Safari: install PWA, close browser, wait 48+ hours, reopen
4. Test on Android Chrome: same process
5. Test export to Files app (iOS) and Downloads (Android)
6. Document findings, adjust architecture if needed

### Phase 1: MVP (4-5 weeks)

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Foundation | Vite + React + PWA + shadcn/ui scaffold, SQLocal + Drizzle setup, DB schema, export/import |
| 2 | Target Capture | Camera/file picker, zoom/pan canvas, shot marking, calibration overlay |
| 3 | Target Rendering | SVG templates, coordinate-based visualization, metrics display |
| 4 | Sessions + Inventory | Session CRUD with RHF, firearms/ammo library, auto-deduct |
| 5 | Dashboard + Polish | Calendar heatmap, stats, basic timer, PWA install flow, testing |

**Deliverable:** Usable app for logging sessions, capturing and visualizing targets, tracking inventory

### Phase 2: Inventory Enhancement (2-3 weeks)

- Purchase tracking with price-per-round
- Ammo reviews and ratings
- Ammo-firearm compatibility notes

### Phase 3: Performance Tracking (2-3 weeks)

- Drill library (built-in + custom)
- Drill attempt logging
- Progress charts
- Goals page

### Phase 4: Polish (Ongoing)

- Retro LED timer UI
- Data visualizations
- UI refinements based on real usage

---

## 13. Technical Decisions Log

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| Backend | None (local-only) | Simplicity, privacy, no ops | Dec 2025 |
| Framework | Vite + React | Simpler than Next.js for client-only PWA | Dec 2025 |
| Storage | SQLite in OPFS via SQLocal | Clean API, Drizzle integration, OPFS persistence | Dec 2025 |
| ORM | Drizzle | Type-safe queries, works with SQLocal | Dec 2025 |
| UI Components | shadcn/ui | Copy-paste, customizable, dark mode | Dec 2025 |
| Forms | React Hook Form + Zod | Simple forms don't need TanStack complexity | Dec 2025 |
| Image zoom/pan | react-zoom-pan-pinch | Handles all touch complexity during capture | Dec 2025 |
| Calendar | @uiw/react-heat-map | Exact match for GitHub-style heatmap | Dec 2025 |
| Backup strategy | Export to device Files | User-controlled, survives browser issues | Dec 2025 |
| Timer UI (MVP) | Functional, standard UI | Defer fancy LED timer until validated | Dec 2025 |
| **Image storage** | **None (coordinates only)** | **90% smaller DB, clean visualizations, privacy** | **Dec 2025** |

---

## Appendix A: File Structure

```
range-app/
├── public/
│   ├── manifest.json
│   ├── icons/
│   ├── targets/                    # SVG templates
│   │   ├── b8-repair.svg
│   │   ├── b8-full.svg
│   │   ├── uspsa-metric.svg
│   │   ├── idpa.svg
│   │   ├── circle-5.svg
│   │   ├── circle-8.svg
│   │   └── 3x5-card.svg
│   └── drills.json (built-in drill data)
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── db/
│   │   ├── index.ts (SQLocal + Drizzle setup)
│   │   ├── schema.ts (Drizzle table definitions)
│   │   ├── migrations.ts
│   │   └── queries/
│   │       ├── firearms.ts
│   │       ├── ammo.ts
│   │       ├── sessions.ts
│   │       ├── targets.ts
│   │       └── shots.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Sessions.tsx
│   │   ├── SessionDetail.tsx
│   │   ├── Inventory.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── calendar/
│   │   │   └── HeatmapCalendar.tsx
│   │   ├── target/
│   │   │   ├── TargetCapture.tsx      # Photo + marking (transient)
│   │   │   ├── TargetVisualization.tsx # SVG + shots (persistent view)
│   │   │   ├── ShotMarker.tsx
│   │   │   ├── CalibrationOverlay.tsx
│   │   │   └── NeutralGrid.tsx
│   │   ├── timer/
│   │   │   └── Timer.tsx
│   │   └── forms/
│   │       ├── SessionForm.tsx
│   │       ├── FirearmForm.tsx
│   │       └── AmmoForm.tsx
│   ├── hooks/
│   │   ├── useDatabase.ts
│   │   ├── useTimer.ts
│   │   ├── useSessions.ts
│   │   └── useTargets.ts
│   ├── lib/
│   │   ├── targetTemplates.ts
│   │   ├── measurements.ts
│   │   ├── captureTarget.ts
│   │   └── export.ts
│   ├── stores/
│   │   └── appStore.ts (Zustand)
│   └── types/
│       └── index.ts
├── components.json (shadcn/ui config)
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Appendix B: Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    
    "sqlocal": "^0.9.0",
    "drizzle-orm": "^0.29.0",
    
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "zod": "^3.22.0",
    
    "zustand": "^4.4.0",
    
    "react-zoom-pan-pinch": "^3.3.0",
    "@uiw/react-heat-map": "^2.2.0",
    
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Note:** `browser-image-compression` removed from dependencies since we no longer store images.

---

## Appendix C: Competitive Analysis

| App | Strengths | Weaknesses | Notes |
|-----|-----------|------------|-------|
| Range Buddy | Full-featured, good UI | Subscription, iOS only | $2.99/mo |
| ShootingLog | Simple, free | Limited analysis, dated UI | Android |
| Mantis X | Hardware integration | Expensive, specific use case | $150+ hardware |
| Practiscore | Competition standard | Complex, overkill for casual | Competition focus |

**Range App differentiates by:**
- Free, no subscription
- Offline-first PWA (works on any device)
- Focus on personal improvement tracking
- **Ultra-portable data (no photos = tiny backups)**
- **Clean visualizations instead of messy photos**
- Simple enough to actually use consistently

---

*Document maintained by the founding team. Last updated: December 20, 2025*
