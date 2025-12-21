# Range Training App - Testing Checklists

## Overview

These checklists ensure comprehensive testing of all app features across different phases of development.

## Testing Approach

### Platforms to Test
- iOS Safari (PWA installed)
- Android Chrome (PWA installed)
- Desktop Chrome
- Desktop Safari
- Desktop Firefox

### Testing Modes
- Normal mode (default theme)
- High-glare mode (outdoor/sunlight)
- Offline mode (airplane mode)

### Data States to Test
- Empty state (no data)
- Normal state (typical usage)
- Stress test (100+ sessions, 1000+ targets)

## Quick Links

- [Phase 1: MVP Core Loop](./phase-1-mvp-testing.md)
- [Phase 2: Inventory Enhancement](./phase-2-inventory-testing.md)
- [Phase 3: Performance Tracking](./phase-3-performance-testing.md)
- [Phase 4: Polish & Optimization](./phase-4-polish-testing.md)

## How to Use These Checklists

1. Before release, run through all checklists
2. Check off items as you verify them
3. Note any issues found with the date and description
4. Retest after fixes are applied

## Issue Template

When documenting issues found during testing:

```
**Issue:** [Brief description]
**Phase:** [1/2/3/4]
**Feature:** [Feature name]
**Steps to Reproduce:**
1.
2.
3.
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Platform:** [Where observed]
**Date Found:** [YYYY-MM-DD]
```
