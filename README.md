# Range App

[![License](https://img.shields.io/badge/License-Apache_2.0_+_Commons_Clause-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](CHANGELOG.md)
[![PWA](https://img.shields.io/badge/PWA-enabled-purple.svg)](https://range-app.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Live Demo](https://img.shields.io/badge/demo-range--app.com-orange.svg)](https://range-app.com)

> A privacy-first Progressive Web Application (PWA) for recreational shooters to track range sessions, manage ammunition inventory, document target performance with precision shot analysis, and measure improvement over time.

## Overview

Range App answers the question: **"How am I improving as a shooter?"** by connecting session logs, ammunition usage, target performance, and drill scores into a coherent personal record.

### Core Principles

- **Privacy by Design** – All data stored locally on your device. No accounts, no cloud sync, no tracking.
- **Offline First** – Works seamlessly at ranges with poor or no connectivity.
- **No Image Bloat** – Photos are used only during capture; only coordinates and metrics are saved.
- **Data Ownership** – Export your entire database anytime as `.db` or `.json`.

## Features

### Session Tracking
Log every range visit with date, location, duration, weather conditions, and notes. Track which firearms and ammunition you used, with automatic round count updates.

### Precision Shot Marking
Photograph your targets and mark shot impacts to calculate professional-grade metrics:
- **Extreme Spread** – Maximum distance between any two shots (inches)
- **Mean Radius** – Average distance of all shots from group center (inches)
- **Group Size in MOA** – Minutes of angle equivalent at your shooting distance
- **Group Center Offset** – How far your group center is from point of aim

### Firearm & Ammunition Inventory
- Maintain a digital record of your firearms with round counts and notes
- Track ammunition by caliber, brand, grain weight, and bullet type
- Log purchases with price tracking for cost-per-round analysis
- Rate ammunition for reliability and accuracy
- Document firearm-ammo compatibility with performance notes

### Drill Performance Tracking
- 25 built-in standardized drills (Bill Drill, El Presidente, FAST, Dot Torture, and more)
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
| `npm run deploy` | Deploy to Cloudflare Pages |

### Building for Production

```bash
npm run build
```

Output is generated in the `dist/` directory. Deploy to any static hosting (Vercel, Cloudflare Pages, Netlify).

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
| PWA | vite-plugin-pwa | Service worker and manifest |

## Data & Privacy

### Local Storage Only

All data is stored locally in your browser's Origin Private File System (OPFS) via SQLite. Nothing is sent to any server.

### No Image Storage

To save space and ensure privacy, target photos are **never stored**. During capture, the image exists only in memory for shot marking. Once you save, only the shot coordinates and computed metrics are persisted.

### Backup & Restore

From the Settings page:
- **Export Database** – Download the entire SQLite `.db` file
- **Export as JSON** – Download a portable `.json` export
- **Import** – Restore from a previously exported file

## Documentation

- [User Guide](docs/USER_GUIDE.md) – Complete guide to using all features
- [Product Requirements](docs/PRD.md) – Detailed product specification

## Contributing

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

## License

This project is licensed under the [Apache License 2.0](LICENSE) with the [Commons Clause](https://commonsclause.com/) restriction.

You are free to use, modify, and distribute this software, but you may not sell it as a hosted service.

See [LICENSE](LICENSE) for full details.

---

*Built with passion for the shooting community.*
