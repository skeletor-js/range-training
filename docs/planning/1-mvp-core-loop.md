# Phase 1: MVP Core Loop

## Objective
Build the fundamental user loop: logged in range session, target marking with real-world measurements, and basic equipment management.

## Component Parts / Feature Branches

### 1. Equipment Management (`feat/equipment-basics`)
- Basic Firearms Library (Add/List/Edit).
- Basic Ammo Inventory (Add/List/Edit).
- Caliber-based grouping for inventory.

### 2. Target Capture Engine (`feat/target-capture`)
- Camera/File picker integration.
- Transient canvas with `react-zoom-pan-pinch` for zoom/pan.
- Calibration overlay system (Aligning preset SVGs or drawing custom reference lines).
- Point of Aim (POA) and Shot Marking logic (pixel-to-inch conversion).
- *Crucial:* Ensure original image is never saved to disk.

### 3. Target Visualization (`feat/target-viz`)
- SVG template library for standard targets (B-8, USPSA, etc.).
- Coordinate-based rendering engine to plot shots on SVG templates or neutral grids.
- Group metrics calculation: Extreme Spread, Mean Radius, MOA (1.047" @ 100yds).

### 4. Session Logging (`feat/sessions`)
- Session CRUD (Date, Location, Notes).
- Linking Firearms and Ammo to sessions.
- Auto-deduct ammo quantity from inventory upon session save.
- Session detail view with Target Gallery and Drill Attempts.

### 5. Dashboard & Timer (`feat/dashboard-stats`)
- Year-view Calendar Heatmap using `@uiw/react-heat-map`.
- Basic Stats (Streak, Total Rounds, Recent Activity).
- Functional Countdown Timer (Standard UI) with auto-log to session.

## Definition of Done
- A user can start a session, "photograph" a target, mark shots, see the MOA group, and save it.
- Ammo inventory correctly decrements after a session.
- The dashboard shows a heatmap of the session.
