# GEMINI Project Context: Range App

This document provides a comprehensive overview of the "Range App" project, designed to give an AI assistant the necessary context to understand and contribute to the codebase effectively.

## 1. Project Overview

Range App is a privacy-first Progressive Web Application (PWA) for recreational shooters. It allows users to track range sessions, manage firearm and ammunition inventory, and analyze shooting performance with precision metrics.

The core principles of the application are:
- **Privacy by Design:** All user data is stored locally in the browser's Origin Private File System (OPFS) using SQLite. There is no cloud sync, no user accounts, and no backend server.
- **Offline First:** The application is designed to be fully functional without an internet connection.
- **Data Ownership:** Users can export their entire database at any time.
- **Minimalist Data:** Target photos are used only for the initial capture process and are not stored, keeping the database small and private.

## 2. Tech Stack

- **Framework:** Vite + React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** SQLocal (SQLite in browser) + Drizzle ORM
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod for validation
- **Routing:** React Router DOM
- **Charts:** Recharts
- **PWA:** `vite-plugin-pwa`

## 3. Architecture & Project Structure

The project follows a feature-based structure within the `src/` directory.

```
src/
├── pages/              # Top-level route components (e.g., Home, Inventory, Capture)
├── components/         # Reusable UI components, organized by feature/domain
│   ├── ui/             # Base shadcn/ui components
│   ├── capture/        # Components for the target photo analysis workflow
│   ├── inventory/      # Firearm and ammo management components
│   ├── drills/         # Drill logging and performance tracking
│   └── ...
├── stores/             # Zustand state management stores, organized by feature
├── db/                 # Database layer (Drizzle ORM schema, client)
│   ├── schema.ts       # The single source of truth for the database structure
│   └── index.ts        # Database initialization logic
├── lib/                # Utility functions, constants, and business logic
├── hooks/              # Custom React hooks
├── types/              # Core TypeScript type definitions
└── data/               # Static data (e.g., built-in drill definitions)
```

### Key Architectural Concepts:
- **Local-Only Database:** The entire application state is stored in a local SQLite database in the browser's Origin Private File System (OPFS). The `sqlocal` package provides the interface, and Drizzle ORM ensures type-safe queries.
- **Zustand for State Management:** Global state is managed with Zustand. State is logically separated into multiple stores (e.g., `drillStore`, `inventoryStore`, `captureStore`), which are sometimes combined into a single facade hook for easier consumption by components.
- **Type-Safe Schema:** `src/db/schema.ts` defines all database tables and relationships. Drizzle ORM uses this file to generate TypeScript types, ensuring that all database interactions are type-safe.
- **Service Worker & PWA:** The `vite-plugin-pwa` is configured in `vite.config.ts` to provide full offline capabilities, caching of assets, and the "Add to Home Screen" install prompt.

## 4. Development Workflow

### Prerequisites
- Node.js (LTS)
- npm

### Setup
1.  `npm install`

### Key Commands
- **`npm run dev`**: Starts the Vite development server with hot module reloading.
- **`npm run build`**: Type-checks the code with `tsc` and creates a production build in the `dist/` directory.
- **`npm run lint`**: Runs ESLint to check for code quality and style issues, based on the rules in `eslint.config.js`.
- **`npm run preview`**: Serves the production build locally for testing.
- **`npm run deploy`**: Deploys the application to Cloudflare Pages using the `wrangler.toml` configuration.

## 5. Coding Conventions & Best Practices

- **Component Library:** Use `shadcn/ui` components from `src/components/ui/` as the base for all UI elements.
- **Styling:** Use Tailwind CSS utility classes. The `cn()` helper from `src/lib/utils.ts` should be used for conditionally applying classes.
- **State Management:**
    - State should be managed in the appropriate Zustand store.
    - Actions that modify state should be defined within the store.
    - Components should select only the state slices and actions they need.
- **Forms:** All forms should use React Hook Form for handling state and Zod for schema-based validation. Validation schemas are typically located in `src/lib/validations.ts`.
- **Database:**
    - All database queries must go through the Drizzle ORM client.
    - Do not write raw SQL strings; use the Drizzle query builder.
    - The schema is defined exclusively in `src/db/schema.ts`.
- **IDs:** Generate unique IDs for new database entries using `generateId()` from `src/lib/utils.ts`.
- **Commit Messages:** Follow the Conventional Commits specification (e.g., `feat: ...`, `fix: ...`, `refactor: ...`).
