# Phase 0: Foundation & Storage Spike

## Objective
Validate the core storage architecture (SQLocal + Drizzle in OPFS) and set up the project scaffold. Ensure offline persistence and backup/restore functionality work as expected before building the UI.

## Component Parts / Feature Branches

### 1. Project Scaffold (`feat/scaffold`)
- Initialize Vite + React + TypeScript project.
- Configure Tailwind CSS and shadcn/ui.
- Set up `vite-plugin-pwa` with basic manifest and service worker.
- Implement Folder Structure as defined in PRD Appendix A.

### 2. Database Core (`feat/database-setup`)
- Install and configure `sqlocal` and `drizzle-orm`.
- Implement `src/db/schema.ts` with all entities (Firearms, Ammo, Sessions, Targets, Shots, Drills).
- Create `initializeDatabase` utility to handle schema creation and migrations.
- Verify persistence in OPFS across browser restarts (especially on iOS Safari).

### 3. Backup & Restore (`feat/backup-restore`)
- Implement `exportDatabase` (Native SQLite file export).
- Implement `importDatabase` (Overwriting OPFS with uploaded file).
- Implement `exportAsJSON` for portable, human-readable data.

## Definition of Done
- App is installable as a PWA.
- Database persists data after browser is closed and reopened.
- A dummy record can be created, exported to a file, and re-imported successfully.
