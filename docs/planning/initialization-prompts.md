# Development Initialization Prompts

Use these prompts to kick off each phase of development with an LLM agent like Antigravity.

---

## Phase 0: Foundation & Storage
**Prompt:**
> Initialize the "Range App" project. Start by scaffolding a Vite + React + TypeScript project with Tailwind CSS and shadcn/ui. Configure the `vite-plugin-pwa` for offline support. Then, set up the data layer using `sqlocal` and `drizzle-orm` as defined in `docs/PRD.md` and `docs/planning/0-foundation.md`. Implement the full database schema in `src/db/schema.ts` and create a database initialization utility that ensures persistence in OPFS. Finally, implement a basic "Settings" page with "Export Database" and "Import Database" functionality to verify the storage engine.

---

## Phase 1: MVP Core Loop
**Prompt:**
> Initialize Phase 1 development according to `docs/planning/1-mvp-core-loop.md`. Focus on building the core shooting loop. 
> 1. Implement the "Firearms" and "Ammo" management screens (Basic CRUD).
> 2. Build the "Target Capture Engine" using `react-zoom-pan-pinch`. This must handle image selection (transient), calibration (preset and custom), POA setting, and shot marking. 
> 3. Implement the measurement algorithm in `src/lib/measurements.ts` to convert pixels to inches and calculate MOA/Extreme Spread.
> 4. Create the "Target Visualization" component to render shots on SVG templates.
> 5. Implement "Range Session" logging that ties it all together, ensures ammo is auto-deducted from inventory, and displays a GitHub-style activity heatmap on the dashboard.

---

## Phase 2: Inventory Pro
**Prompt:**
> Initialize Phase 2 development as defined in `docs/planning/2-inventory-enhancement.md`. Enhance the basic equipment libraries into a professional inventory system. 
> 1. Add "Purchase History" tracking for ammo, including price-per-round calculations and seller benchmarks. 
> 2. Implement an "Ammo Review" system with Reliability/Accuracy ratings and notes. 
> 3. Add "Compatibility/Load Notes" to link specific ammo to specific firearms, allowing the shooter to track which rounds perform best in which guns according to the data model in `docs/PRD.md`.

---

## Phase 3: Performance Pro
**Prompt:**
> Initialize Phase 3 development according to `docs/planning/3-performance-tracking.md`. Build the structured practice and progress layer. 
> 1. Implement the "Drill Library" with the built-in drills defined in the PRD (Bill Drill, Dot Torture, etc.) and a system for users to create custom drills. 
> 2. Build the "Drill Attempt" logging system that tracks Personal Bests (PBs) and links attempts to specific target measurements. 
> 3. Create a "Goals" management page and implement "Performance Trends" charts to visualize improvement over time.

---

## Phase 4: Final Polish
**Prompt:**
> Initialize Phase 4 development based on `docs/planning/4-polish-optimization.md`. 
> 1. Replace the standard timer with a premium "Retro LED Timer" featuring seven-segment digits, glow effects, and industrial styling. 
> 2. Implement advanced data visualizations, including accuracy comparisons across different firearms and price trend lines for ammunition. 
> 3. Perform a final sweep for technical polish: optimize DB queries, implement lazy loading for session history, and refine the UI for high-glare/outdoor scenarios as discussed in the PRD.
> 4. Make sure that each of the previous four phases have been completed sufficiently and ALL features are implemented and working.
> 5. Create a new folder in docs for testing checklists and list out how users should test each feature.

