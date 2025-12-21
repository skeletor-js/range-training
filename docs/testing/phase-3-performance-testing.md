# Phase 3: Performance Tracking Testing

## Drill Library

### Built-in Drills
- [ ] Bill Drill displays correctly
- [ ] Failure Drill (Mozambique) displays correctly
- [ ] Draw to First Shot displays correctly
- [ ] Dot Torture displays correctly
- [ ] 5x5 Drill displays correctly
- [ ] 10-10-10 Drill displays correctly
- [ ] FAST Drill displays correctly
- [ ] El Presidente displays correctly
- [ ] Casino Drill displays correctly

### Drill Details
- [ ] Description shows
- [ ] Category badge displays
- [ ] Par time shows (if applicable)
- [ ] Max points shows (if applicable)
- [ ] Round count shows
- [ ] Target count shows
- [ ] Distance shows

### Custom Drills
- [ ] Create new custom drill
- [ ] All scoring types work (time/points/pass_fail/hits)
- [ ] Edit custom drill
- [ ] Delete custom drill
- [ ] Cannot edit/delete built-in drills

## Drill Attempt Logging

### Time-Based Drills
- [ ] Timer mode toggle works
- [ ] Retro LED timer displays correctly
- [ ] Start/stop captures time
- [ ] Reset clears timer
- [ ] Manual entry works
- [ ] Time saves correctly

### Points-Based Drills
- [ ] Points input accepts valid values
- [ ] Max points validation works
- [ ] Points save correctly

### Pass/Fail Drills
- [ ] Toggle shows pass/fail state
- [ ] Pass/fail saves correctly

### Hits-Based Drills
- [ ] Hits input works
- [ ] Misses input works
- [ ] Max hits validation works
- [ ] Values save correctly

### Optional Fields
- [ ] Firearm selection works
- [ ] Ammo selection filters by firearm caliber
- [ ] Notes field works

### Attempt Management
- [ ] View attempt history
- [ ] Delete attempt
- [ ] Attempts sorted by date

## Personal Best (PB) Tracking

### PB Calculation
- [ ] Time drills: lowest time is PB
- [ ] Points drills: highest points is PB
- [ ] Hits drills: highest hits is PB
- [ ] Pass/fail: first pass is PB

### PB Display
- [ ] PB badge shows on drill card
- [ ] PB highlighted in attempt list
- [ ] PB value displays correctly
- [ ] Improvement indicator shows

## Goals & Progress

### Goal Creation
- [ ] Create goal with title
- [ ] Add description
- [ ] Set target date (optional)
- [ ] Link to drill (optional)
- [ ] Set target score for linked drill

### Goal Progress
- [ ] Progress bar shows for linked goals
- [ ] Percentage calculates correctly
- [ ] Completion detected automatically
- [ ] Manual completion works

### Goal Management
- [ ] Edit goal
- [ ] Delete goal
- [ ] Mark as complete
- [ ] View completed goals

## Trend Analytics

### DrillTrendChart
- [ ] Chart displays with data
- [ ] Empty state shows message
- [ ] Time drills have reversed Y-axis
- [ ] PB points highlighted
- [ ] Tooltip shows details
- [ ] Date labels readable

### Data Points
- [ ] All attempts plotted
- [ ] Chronological order correct
- [ ] Values accurate

## Training Pages

### Drills Tab
- [ ] Lists all drills (built-in + custom)
- [ ] Filter by category works
- [ ] Search works
- [ ] Tap opens drill detail

### Goals Tab
- [ ] Lists all goals
- [ ] Active goals separated from completed
- [ ] Progress visible at a glance
- [ ] Tap opens goal edit

### Drill Detail Page
- [ ] Back navigation works
- [ ] Drill info displays
- [ ] PB shows prominently
- [ ] Trend chart loads
- [ ] Benchmarks display
- [ ] Attempt list loads
- [ ] Add attempt button works

## Cross-Platform Tests

### Retro LED Timer
- [ ] Timer visible on all screen sizes
- [ ] Touch controls work on mobile
- [ ] Audio plays (if enabled)
- [ ] Vibration works (mobile)

### Charts
- [ ] Charts render on mobile
- [ ] Charts render on desktop
- [ ] Touch tooltips work
- [ ] Mouse tooltips work

## Offline Testing

- [ ] Drills load offline
- [ ] Can log attempts offline
- [ ] Goals accessible offline
- [ ] Charts render with cached data
