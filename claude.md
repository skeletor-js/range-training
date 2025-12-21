# Range App - Development Context

This file provides context for AI assistants working on the Range App codebase.

## Quick Reference

| Aspect | Technology |
|--------|------------|
| Framework | Vite + React 18 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI primitives) |
| Database | SQLocal (SQLite in OPFS) + Drizzle ORM |
| State | Zustand |
| Forms | React Hook Form + Zod |
| Routing | React Router DOM |

## Project Structure

```
src/
├── pages/              # Route components
│   ├── Home.tsx        # Dashboard with stats and heatmap
│   ├── Sessions.tsx    # Session list
│   ├── Training.tsx    # Drills and goals tabs
│   ├── DrillDetail.tsx # Individual drill with attempts
│   ├── Inventory.tsx   # Armory and ammo tabs
│   ├── Settings.tsx    # App configuration (orchestrator)
│   └── Capture.tsx     # Full-screen target capture
│
├── components/         # UI components by domain
│   ├── ui/             # shadcn/ui base components (button, card, dialog, etc.)
│   ├── capture/        # CaptureCanvas, ImagePicker, ShotMarker, CalibrationOverlay
│   ├── sessions/       # SessionCard, SessionList, ActivityHeatmap
│   ├── inventory/      # FirearmForm/List, AmmoForm/List, CompatibilityForm
│   ├── drills/         # DrillCard, DrillForm, DrillAttemptForm, DrillTrendChart
│   │   └── scoring/    # TimeScoringSection, PointsScoringSection, HitsScoringSection, PassFailScoringSection
│   ├── goals/          # GoalCard, GoalForm, GoalProgress
│   ├── targets/        # TargetViewer, ShotPlot, MetricsDisplay, templates/
│   ├── timer/          # RetroLEDTimer, SevenSegmentDigit, TimerControls
│   ├── charts/         # ShootingFrequencyChart, AmmoPriceTrendChart
│   ├── settings/       # DatabaseStatsCard, ExportSection, ImportSection, DisplaySettingsCard, AboutCard
│   └── pwa/            # UpdateNotification, NetworkStatus
│
├── stores/             # Zustand state management (modular architecture)
│   ├── sessionStore.ts       # Combined session store (re-exports split stores)
│   ├── activeSessionStore.ts # Active session building (in-memory)
│   ├── sessionListStore.ts   # Saved sessions CRUD
│   ├── sessionStatsStore.ts  # Dashboard stats and heatmap
│   ├── inventoryStore.ts     # Combined inventory store (re-exports split stores)
│   ├── firearmStore.ts       # Firearm CRUD
│   ├── ammoStore.ts          # Ammo and purchases
│   ├── compatibilityStore.ts # Firearm-ammo compatibility
│   ├── drillStore.ts         # Drills, attempts, personal bests (with helper hooks)
│   ├── goalsStore.ts         # Goals with drill linking
│   ├── captureStore.ts       # Capture workflow state machine
│   └── settingsStore.ts      # App settings (highGlareMode)
│
├── db/                 # Database layer (modular architecture)
│   ├── index.ts        # Public API exports
│   ├── client.ts       # Core db and sqlocal instances
│   ├── schema.ts       # Drizzle ORM schema definitions
│   ├── init.ts         # Schema SQL and initialization
│   ├── migrations.ts   # All migrations (v1-v5)
│   └── seed.ts         # Built-in drill seeding
│
├── lib/                # Utility functions (modular architecture)
│   ├── calibration.ts    # Pixel-to-inch conversion, scale calculation
│   ├── measurements.ts   # Group metrics (ES, MR, MOA, center offset)
│   ├── drillUtils.ts     # Core drill logic (PB calculation, value comparison)
│   ├── drillTrendUtils.ts # Trend data generation and formatting
│   ├── goalUtils.ts      # Goal progress calculations
│   ├── formatUtils.ts    # Date formatting utilities
│   ├── validations.ts    # Zod schemas for all forms
│   ├── constants.ts      # Calibers, firearm types, drill categories
│   ├── utils.ts          # generateId(), cn(), formatters
│   ├── pprMetrics.ts     # Price-per-round calculations
│   └── export.ts         # Database export/import functions
│
├── hooks/
│   ├── useNetworkStatus.ts
│   ├── usePWAInstall.ts
│   └── useSWUpdate.ts
│
├── types/
│   └── index.ts        # TypeScript type definitions
│
└── data/
    └── builtinDrills.json  # 8 pre-configured drills with benchmarks
```

## Key Files

| File | Purpose |
|------|---------|
| `src/db/schema.ts` | Database schema (14 tables) with Drizzle ORM |
| `src/db/init.ts` | Schema SQL and database initialization |
| `src/db/migrations.ts` | All migrations (v1-v5) |
| `src/stores/activeSessionStore.ts` | Active session building logic |
| `src/stores/sessionListStore.ts` | Saved sessions CRUD |
| `src/stores/captureStore.ts` | Target capture state machine |
| `src/lib/measurements.ts` | Shot group metric calculations |
| `src/lib/calibration.ts` | Image calibration for shot marking |
| `src/App.tsx` | React Router setup with bottom navigation |
| `vite.config.ts` | Vite + PWA configuration |

## State Management

### Store Architecture

The app uses a modular store architecture where large stores are split into focused modules, with combined stores for backwards compatibility.

**Session Stores** (split from sessionStore.ts)
- `activeSessionStore` - In-memory session building
- `sessionListStore` - Saved sessions CRUD
- `sessionStatsStore` - Dashboard stats and heatmap
- `useSessionStore()` - Combined hook for all session functionality

**Inventory Stores** (split from inventoryStore.ts)
- `firearmStore` - Firearm CRUD and round count tracking
- `ammoStore` - Ammo, purchases, and inventory management
- `compatibilityStore` - Firearm-ammo compatibility records
- `useInventoryStore()` - Combined hook for all inventory functionality

**Drill Store** (single store with helper hooks)
- `useDrillStore()` - Full store access
- `useDrills()` - Drill library operations
- `useDrillAttempts()` - Attempt tracking and analytics

**Other Stores**
- `captureStore` - Capture workflow state machine
- `goalsStore` - Goals with drill linking
- `settingsStore` - App settings (highGlareMode)

## Armory (Weapon Types)

The app supports multiple weapon categories in the "Armory" section:

**Traditional Firearms**
- `handgun`, `rifle`, `shotgun`, `sbr`, `pcc`

**Air-Powered**
- `air_rifle`, `air_pistol`

**Black Powder**
- `bp_rifle`, `bp_pistol`, `bp_shotgun`

**Other**
- `other`

Calibers are organized with suffixes for special types:
- Air calibers: `.177 (Air)`, `.20 (Air)`, `.22 (Air)`, `.25 (Air)`, `.30 (Air)`
- Black powder: `.36 BP`, `.44 BP`, `.45 BP`, `.50 BP`, `.54 BP`, `.58 BP`

## Common Development Tasks

### Add a New Page

1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```
3. Add to navigation in the `Layout` component if needed

### Add a Database Table

1. Define table in `src/db/schema.ts`:
   ```ts
   export const newTable = sqliteTable('new_table', {
     id: text('id').primaryKey(),
     // ... columns
     createdAt: text('created_at').default(sql`(datetime('now'))`),
   });
   ```
2. Increment schema version in `src/db/init.ts`
3. Add migration logic in `src/db/migrations.ts` (`runMigrations()`)
4. Add types to `src/types/index.ts` if needed

### Add a Form

1. Define Zod schema in `src/lib/validations.ts`:
   ```ts
   export const newItemSchema = z.object({
     name: z.string().min(1, 'Required'),
     // ...
   });
   ```
2. Create form component using React Hook Form:
   ```tsx
   const form = useForm<z.infer<typeof newItemSchema>>({
     resolver: zodResolver(newItemSchema),
   });
   ```

### Add a shadcn/ui Component

Components are already installed in `src/components/ui/`. Available:
- button, card, dialog, tabs, input, label, select, checkbox
- dropdown-menu, sheet, tooltip, accordion, badge, separator
- alert-dialog, progress, scroll-area, textarea, switch

To use:
```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

## Code Conventions

### Styling
- Use Tailwind CSS classes
- Use `cn()` helper for conditional classes:
  ```ts
  cn('base-class', condition && 'conditional-class')
  ```
- Dark theme is default (bg-neutral-900, text-white)

### IDs
- Generate with `generateId()` from `src/lib/utils.ts`
- All primary keys are TEXT (UUIDs)

### Forms
- Always use React Hook Form with Zod resolver
- Form schemas live in `src/lib/validations.ts`
- Use shadcn/ui form components

### State Updates
- All DB operations go through Zustand stores
- Stores handle async DB queries internally
- Components call store actions, stores update state
- Use combined store hooks (`useSessionStore()`, `useInventoryStore()`) for convenience
- Use specific store hooks (`useFirearmStore()`, `useAmmoStore()`) for focused components

### Component Organization
- Domain components in `src/components/{domain}/`
- Shared UI in `src/components/ui/`
- One component per file
- Complex forms split into section components (e.g., `scoring/` for drill attempt scoring)

## Important Patterns

### No Image Storage
- Target photos are transient (Object URLs)
- Only shot coordinates (inches from POA) are persisted
- Metrics calculated at capture time, stored in `targets` table
- Clean SVG visualizations for viewing

### Capture Workflow
```
Load Image → Calibrate (preset/custom) → Set POA → Mark Shots → Review → Save
```
- Image released from memory after save
- Coordinates converted from pixels to inches before persistence

### Built-in Drills
- Defined in `src/data/builtinDrills.json`
- Seeded on first DB init (see `src/db/seed.ts`)
- `isBuiltin: true` prevents editing/deletion
- Have benchmarks for skill levels

### Session Save Flow
1. Insert session record
2. Insert session_firearms junctions
3. Insert session_ammo records
4. Deduct ammo inventory
5. Increment firearm round counts
6. Insert targets with metrics
7. Insert individual shots

## Testing

```bash
npm run dev      # Development server (localhost:5173)
npm run build    # Type-check + production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

### Manual Testing Checklist
- [ ] Session create/edit/delete
- [ ] Target capture workflow
- [ ] Firearm/ammo CRUD (including air guns and black powder)
- [ ] Drill attempt logging (all scoring types)
- [ ] Export/import database
- [ ] PWA installation
- [ ] Offline functionality

## Database Notes

### Current Schema Version: 5

**Migration History:**
- v1: Initial schema
- v2: Added drill benchmarks
- v3: Added firearm-ammo compatibility
- v4: Added performance indexes
- v5: Added air rifle/pistol and black powder weapon types

### Key Relationships
- `sessions` → `targets` → `shots` (cascade delete)
- `sessions` → `session_firearms` → `session_ammo` (cascade delete)
- `drills` → `drill_attempts` (cascade delete)
- `drills` → `drill_benchmarks` (cascade delete)
- `ammo` → `ammo_purchases` (cascade delete)

### Indexes (added in v4)
- `idx_sessions_date` on sessions(date)
- `idx_targets_session` on targets(session_id)
- `idx_shots_target` on shots(target_id)
- `idx_drill_attempts_drill` on drill_attempts(drill_id)
- `idx_drill_attempts_session` on drill_attempts(session_id)

## Performance Considerations

- Session list uses `@tanstack/react-virtual` for virtualization
- Charts render only when visible
- Service worker caches app shell and assets
- Database is ~2MB for 1000 targets (no images)

## Environment

- Node.js LTS required
- Vite dev server on port 5173
- PWA requires HTTPS in production (or localhost)
- OPFS storage is browser-specific (tested on Chrome, Safari, Firefox)
