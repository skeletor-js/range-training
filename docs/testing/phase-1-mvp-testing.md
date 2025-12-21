# Phase 1: MVP Core Loop Testing

## Equipment Management

### Firearms
- [ ] Add new firearm with all fields
- [ ] Add firearm with minimum required fields
- [ ] Edit existing firearm
- [ ] Delete firearm
- [ ] Verify firearm shows in list
- [ ] Verify firearm caliber grouping works
- [ ] Test all firearm types: handgun, rifle, shotgun, SBR, PCC, other

### Ammunition
- [ ] Add new ammo with all fields
- [ ] Add ammo with minimum required fields
- [ ] Edit existing ammo
- [ ] Delete ammo
- [ ] Verify ammo shows in list grouped by caliber
- [ ] Verify round count displays correctly

## Target Capture Engine

### Image Selection
- [ ] Select image from camera (mobile)
- [ ] Select image from file picker
- [ ] Cancel image selection returns to previous screen
- [ ] Large images load without crashing

### Calibration
- [ ] B-8 preset calibration works
- [ ] USPSA preset calibration works
- [ ] IDPA preset calibration works
- [ ] Index Card preset calibration works
- [ ] Paper Plate preset calibration works
- [ ] MOA Grid preset calibration works
- [ ] Dot Torture preset calibration works
- [ ] Multi-Bullseye preset calibration works
- [ ] Custom calibration works
- [ ] Changing preset updates overlay correctly

### Shot Marking
- [ ] Tap to add shot marker
- [ ] Markers appear at correct position
- [ ] Can add multiple shots (test 10+)
- [ ] Shot sequence numbers increment correctly
- [ ] Can undo last shot
- [ ] Can clear all shots
- [ ] Zoom and pan work while marking

### POA (Point of Aim)
- [ ] Can set POA marker
- [ ] POA shows as distinct marker
- [ ] POA position persists during session

## Measurement Algorithm

### Group Metrics
- [ ] Group center calculates correctly
- [ ] Extreme spread displays correctly
- [ ] Mean radius displays correctly
- [ ] MOA conversion is accurate (verify with known values)
- [ ] Metrics update as shots are added/removed

### Target Templates
- [ ] B-8 target displays correctly
- [ ] USPSA target displays correctly
- [ ] IDPA target displays correctly
- [ ] Index Card target displays correctly
- [ ] Paper Plate target displays correctly
- [ ] MOA Grid target displays correctly
- [ ] Dot Torture target displays correctly
- [ ] Multi-Bullseye target displays correctly
- [ ] Neutral grid displays correctly
- [ ] Shot positions align with templates

## Session Logging

### Session Creation
- [ ] Start new session
- [ ] Date defaults to today
- [ ] Can change date
- [ ] Can set location
- [ ] Can set weather and temperature
- [ ] Can add notes

### Equipment Linking
- [ ] Add firearm to session
- [ ] Remove firearm from session
- [ ] Record ammo usage per firearm
- [ ] Caliber filtering works for ammo selection

### Target Capture in Session
- [ ] Capture target during session
- [ ] Link target to firearm
- [ ] Link target to ammo
- [ ] View captured targets in session

### Session Save
- [ ] Save session successfully
- [ ] Verify session appears in history
- [ ] Verify ammo is deducted from inventory
- [ ] Verify firearm round count increases

### Session Management
- [ ] View session details
- [ ] Delete session
- [ ] Discard unsaved session

## Dashboard & Stats

### Home Page
- [ ] Dashboard loads without errors
- [ ] Stats cards show correct numbers
- [ ] Activity heatmap displays correctly
- [ ] Heatmap shows correct activity intensity
- [ ] Recent sessions list populates
- [ ] "Start Session" button works

### Empty States
- [ ] Dashboard shows appropriate empty state with no data
- [ ] Heatmap handles no data gracefully

## Cross-Platform Tests

### iOS Safari
- [ ] All features work on iOS
- [ ] Touch interactions work correctly
- [ ] Safe area insets handled

### Android Chrome
- [ ] All features work on Android
- [ ] Touch interactions work correctly
- [ ] Back button behavior correct

### Desktop
- [ ] All features work on desktop
- [ ] Mouse interactions work correctly
- [ ] Keyboard navigation works

## Offline Testing

- [ ] App loads when offline
- [ ] Data persists after closing app
- [ ] All features work offline
- [ ] No network error messages appear
