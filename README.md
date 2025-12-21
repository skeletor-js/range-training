# Range App

A privacy-first Progressive Web Application (PWA) for recreational shooters to track range sessions, manage ammunition inventory, document target performance with precision shot analysis, and measure improvement over time.

## Overview

Range App answers the question: **"How am I improving as a shooter?"** by connecting session logs, ammunition usage, target performance, and drill scores into a coherent personal record.

### Core Principles

- **Privacy by Design** - All data stored locally on your device. No accounts, no cloud sync, no tracking.
- **Offline First** - Works seamlessly at ranges with poor or no connectivity.
- **No Image Bloat** - Photos are used only during capture; only coordinates and metrics are saved.
- **Data Ownership** - Export your entire database anytime as `.db` or `.json`.

## Features

### Session Tracking
Log every range visit with date, location, duration, weather conditions, and notes. Track which firearms and ammunition you used, with automatic round count updates.

### Precision Shot Marking
Photograph your targets and mark shot impacts to calculate professional-grade metrics:
- **Extreme Spread** - Maximum distance between any two shots (inches)
- **Mean Radius** - Average distance of all shots from group center (inches)
- **Group Size in MOA** - Minutes of angle equivalent at your shooting distance
- **Group Center Offset** - How far your group center is from point of aim

### Firearm & Ammunition Inventory
- Maintain a digital record of your firearms with round counts and notes
- Track ammunition by caliber, brand, grain weight, and bullet type
- Log purchases with price tracking for cost-per-round analysis
- Rate ammunition for reliability and accuracy
- Document firearm-ammo compatibility with performance notes

### Drill Performance Tracking
- 8 built-in standardized drills (Bill Drill, El Presidente, FAST, etc.)
- Create custom drills with your own parameters
- Track attempts with time, points, hits, or pass/fail scoring
- View personal bests and performance trends over time
- Skill level benchmarks (Novice to Expert)

### Goals
Set shooting goals with optional target dates. Link goals to specific drills to automatically track progress toward your target scores.

### Activity Heatmap
GitHub-style contribution calendar showing your shooting frequency over time. See streaks and patterns at a glance.

### PWA Support
- Install to home screen on iOS and Android
- Full offline functionality
- Automatic updates with user notification
- Network status indicator

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Vite + React 18 | Fast builds, modern DX |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first styling |
| Components | shadcn/ui | Customizable UI primitives |
| Database | SQLocal + Drizzle ORM | SQLite in browser OPFS |
| State | Zustand | Lightweight global state |
| Forms | React Hook Form + Zod | Form handling and validation |
| Routing | React Router DOM | Client-side routing |
| Charts | Recharts | Data visualization |
| Calendar | @uiw/react-heat-map | Activity heatmap |
| PWA | vite-plugin-pwa | Service worker and manifest |

## Architecture

```
src/
├── pages/              # Route components (Home, Sessions, Training, Inventory, Settings, Capture)
├── components/         # UI components organized by domain
│   ├── ui/             # shadcn/ui base components
│   ├── capture/        # Target capture workflow
│   ├── sessions/       # Session list and cards
│   ├── inventory/      # Firearm and ammo management
│   ├── drills/         # Drill tracking components
│   ├── goals/          # Goal management
│   ├── targets/        # Target visualization
│   ├── timer/          # Retro LED timer
│   ├── charts/         # Data visualizations
│   └── pwa/            # PWA features (install, update, network)
├── stores/             # Zustand state management
│   ├── sessionStore    # Sessions and targets
│   ├── captureStore    # Capture workflow state
│   ├── inventoryStore  # Firearms and ammo
│   ├── drillStore      # Drills and attempts
│   ├── goalsStore      # User goals
│   └── settingsStore   # App settings
├── db/                 # Database layer
│   ├── schema.ts       # Drizzle ORM schema
│   └── index.ts        # Database initialization
├── lib/                # Utilities
│   ├── calibration.ts  # Target calibration math
│   ├── measurements.ts # Distance and metric calculations
│   ├── drillUtils.ts   # Drill score calculations
│   ├── validations.ts  # Zod schemas
│   └── constants.ts    # App constants
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── data/               # Static data (built-in drills)
```

### Key Architectural Decisions

- **Local-Only Storage** - SQLite database in browser OPFS via SQLocal. No backend required.
- **No Image Persistence** - Target photos are transient; only shot coordinates and computed metrics are saved. This keeps the database tiny (~2MB for 1000 targets vs ~200MB with images).
- **Zustand Stores** - Each domain (sessions, inventory, drills, goals) has its own store for clean separation.
- **Drizzle ORM** - Type-safe SQL queries with migrations managed through schema versions.

## Database Schema

```
firearms ─────────┐
                  │
sessions ─────────┼──── targets ──── shots
                  │
ammo ─────────────┘

drills ──── drillAttempts ──── drillBenchmarks

goals (optionally linked to drills)

firearmAmmoCompatibility (many-to-many)
ammoPurchases (purchase history)
```

Key tables:
- **sessions** - Range visits with date, location, weather
- **targets** - Shot groups with computed metrics (no images)
- **shots** - Individual shot coordinates in inches relative to POA
- **firearms** / **ammo** - Inventory with round counts
- **drills** / **drillAttempts** - Performance tracking
- **goals** - User goals with optional drill linking

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/jordanstella/range-training.git
cd range-training

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

### Building for Production

```bash
npm run build
```

Output is generated in the `dist/` directory. Deploy to any static hosting (Vercel, Cloudflare Pages, Netlify).

## Project Status

**Version:** 0.1.0

### Completed Phases

- **Phase 0: Foundation** - Vite + React + PWA scaffold, SQLocal + Drizzle setup
- **Phase 1: MVP Core Loop** - Sessions, target capture, firearms/ammo library
- **Phase 2: Inventory Enhancement** - Purchase tracking, reviews, compatibility
- **Phase 3: Performance Tracking** - Drills, attempts, goals, trends
- **Phase 4: Polish & Optimization** - Retro LED timer, visualizations, performance

### What's Working

- Complete session lifecycle (create, edit, delete)
- Target capture with calibration and shot marking
- Precision metrics calculation (ES, MR, MOA)
- Firearm and ammunition inventory management
- Ammo purchase history with price tracking
- 8 built-in drills with custom drill support
- Drill attempt logging with personal bests
- Goal setting with drill-linked progress
- Activity heatmap and dashboard stats
- Database export/import
- PWA installation and offline support

## Contributing

### Development Workflow

1. Create a feature branch from `main`
2. Make changes following existing patterns
3. Test on both desktop and mobile browsers
4. Submit a pull request

### Code Conventions

- Use shadcn/ui components from `src/components/ui/`
- Forms use React Hook Form with Zod validation
- Generate IDs with `generateId()` from `src/lib/utils.ts`
- Use Tailwind CSS with the `cn()` helper for conditional classes
- State changes go through Zustand store actions

### Commit Messages

Follow conventional commits:
```
feat: add ammunition price chart
fix: correct MOA calculation at long range
refactor: simplify capture store state
```

## Data & Privacy

### Storage

All data is stored locally in your browser's Origin Private File System (OPFS) via SQLite. Nothing is sent to any server.

### No Image Storage

To save space and ensure privacy, target photos are **never stored**. During capture, the image exists only in memory for shot marking. Once you save, only the shot coordinates and computed metrics are persisted. This results in:
- 90%+ smaller database size
- Faster queries and backups
- Clean, consistent visualizations
- No photos of your range sessions on device

### Backup & Restore

From the Settings page:
- **Export Database** - Download the entire SQLite `.db` file
- **Export as JSON** - Download a portable `.json` export
- **Import** - Restore from a previously exported file

Backups can be shared via iOS Files app, Android Downloads, or any file sharing method.

## Documentation

- [Product Requirements Document](docs/PRD.md) - Comprehensive product specification
- [Phase 0: Foundation](docs/planning/0-foundation.md)
- [Phase 1: MVP Core Loop](docs/planning/1-mvp-core-loop.md)
- [Phase 2: Inventory Enhancement](docs/planning/2-inventory-enhancement.md)
- [Phase 3: Performance Tracking](docs/planning/3-performance-tracking.md)
- [Phase 4: Polish & Optimization](docs/planning/4-polish-optimization.md)

## License

Private project. All rights reserved.

---

*Built with passion for the shooting community.*
