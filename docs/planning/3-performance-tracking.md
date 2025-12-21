# Phase 3: Performance Tracking

## Objective
Provide structured training tools and progress visualization to answer: "Am I getting better?"

## Component Parts / Feature Branches

### 1. Drill Library (`feat/drill-library`)
- Built-in library of common drills (Bill Drill, Dot Torture, etc.) via JSON.
- Interface for users to create and save "Custom Drills" (Par time, distance, round count).

### 2. Performance Logger (`feat/drill-logging`)
- Log drill attempts during or after a session.
- Automatic Personal Best (PB) tracking.
- Linking drill attempts to specific targets for visual proof.

### 3. Goals & Progress (`feat/goals-tracking`)
- Goal Management (Create/Complete).
- Progress charts for specific drills (Time/Score over time).
- Streak counting improvements.

## Definition of Done
- User can select "Bill Drill," log a time of 2.1s, and see if it beats their previous PB.
- Progress chart shows a downward trend for time (or upward for score) for a specific drill.
