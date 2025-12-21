# Phase 4: Polish & Optimization Testing

## Retro LED Timer

### Visual Display
- [ ] Seven-segment digits render correctly (0-9)
- [ ] Colon separator displays between MM:SS
- [ ] Glow effect visible on digits
- [ ] Industrial frame displays with beveled edges
- [ ] Screw aesthetics in corners render
- [ ] Timer colors correct (amber default)
- [ ] Blinking colon when running

### Timer Modes
- [ ] Countdown mode starts from par time
- [ ] Countdown reaches 0:00 and stops
- [ ] Stopwatch mode starts from 0:00
- [ ] Stopwatch counts up correctly
- [ ] Centiseconds display (if enabled)

### Controls
- [ ] Start button begins timer
- [ ] Stop button pauses timer
- [ ] Reset button clears to initial value
- [ ] Industrial button styling displays
- [ ] Button press feedback visible

### Audio/Haptic Feedback
- [ ] Beep plays on timer complete
- [ ] Vibration triggers on complete (mobile)
- [ ] Sound can be disabled in settings
- [ ] Haptic can be disabled in settings

### Integration
- [ ] Timer toggle appears for time-based drills
- [ ] Captured time fills form field
- [ ] Manual entry still works
- [ ] Timer state resets on drill change

## Advanced Charts

### AccuracyComparisonChart
- [ ] Chart renders with drill data
- [ ] Bars grouped by firearm
- [ ] Average score displays
- [ ] Best score displays
- [ ] Empty state shows message
- [ ] Tooltip shows details on hover/tap

### AmmoPriceTrendChart
- [ ] Chart renders with purchase data
- [ ] X-axis shows purchase dates
- [ ] Y-axis shows PPR values
- [ ] Reference line for average PPR
- [ ] Summary stats display (low/avg/high)
- [ ] Empty state shows message
- [ ] Currency formatting correct

### ShootingFrequencyChart
- [ ] Chart renders with session data
- [ ] Monthly view works
- [ ] Yearly view works
- [ ] Toggle switches views
- [ ] Bar heights reflect session counts
- [ ] Empty state shows message
- [ ] Date labels readable

### Chart Cross-Platform
- [ ] Charts render on mobile Safari
- [ ] Charts render on Android Chrome
- [ ] Charts render on desktop browsers
- [ ] Touch tooltips work
- [ ] Mouse tooltips work
- [ ] Responsive sizing works

## Technical Polish

### Database Indexes
- [ ] Migration v4 runs without errors
- [ ] Sessions query faster with date filter
- [ ] Targets query faster by session
- [ ] Shots query faster by target
- [ ] Drill attempts query faster
- [ ] Ammo purchases query faster

### High-Glare Mode
- [ ] Toggle appears in Settings
- [ ] Enabling switches to pure black background
- [ ] Text becomes pure white
- [ ] Buttons meet 48px minimum height
- [ ] Font sizes increase appropriately
- [ ] Contrast ratios meet accessibility standards
- [ ] Disabling reverts to normal theme
- [ ] Setting persists across sessions

### Settings Persistence
- [ ] High-glare mode setting saved
- [ ] Sound enabled setting saved
- [ ] Haptic enabled setting saved
- [ ] Settings restore on app reload

## PWA Enhancements

### Install Prompt
- [ ] Install button appears in Settings
- [ ] Button hidden if already installed
- [ ] Clicking prompts native install dialog
- [ ] Successful install hides button
- [ ] Works on Android Chrome
- [ ] Works on iOS Safari (shows instructions)

### Update Notifications
- [ ] Toast appears when update available
- [ ] "Update" button triggers refresh
- [ ] "Later" dismisses toast
- [ ] Update actually applies new version

### Network Status
- [ ] Indicator hidden when online
- [ ] Indicator appears when offline
- [ ] Position doesn't obstruct UI
- [ ] Status updates in real-time
- [ ] Reconnection clears indicator

### Offline Functionality
- [ ] App loads when offline
- [ ] All cached pages accessible
- [ ] Can create new sessions offline
- [ ] Can log drill attempts offline
- [ ] Data persists after reconnection

### Icons & Splash Screens
- [ ] 192x192 icon displays
- [ ] 512x512 icon displays
- [ ] Maskable icon works on Android
- [ ] Apple touch icon works on iOS
- [ ] Splash screen shows on iOS launch
- [ ] Splash screen shows on Android launch

## Cross-Platform Tests

### iOS Safari
- [ ] Timer runs in background (tab switch)
- [ ] Audio plays correctly
- [ ] All touch targets 44px minimum
- [ ] Charts render correctly
- [ ] Install prompt shows instructions

### Android Chrome
- [ ] Timer runs correctly
- [ ] Vibration works
- [ ] Push notifications work (if enabled)
- [ ] Install prompt native dialog works
- [ ] Charts render correctly

### Desktop Browsers
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Keyboard navigation works

## Performance Tests

### Load Times
- [ ] Initial load under 3 seconds
- [ ] Session list loads smoothly with 100+ items
- [ ] Drill list loads smoothly
- [ ] Charts render under 1 second
- [ ] No jank during scroll

### Memory
- [ ] No memory leaks on navigation
- [ ] Charts don't cause memory bloat
- [ ] Long session doesn't degrade performance

### Battery (Mobile)
- [ ] Timer doesn't drain battery excessively
- [ ] Background behavior is efficient
- [ ] Service worker is efficient

## Accessibility Tests

### Screen Readers
- [ ] Timer announces state changes
- [ ] Chart data accessible via table alternative
- [ ] All buttons have labels
- [ ] Form fields properly labeled

### Keyboard Navigation
- [ ] Tab order logical
- [ ] Focus indicators visible
- [ ] All interactive elements reachable
- [ ] Escape closes modals

### Color Contrast
- [ ] Normal mode meets WCAG AA
- [ ] High-glare mode meets WCAG AAA
- [ ] Charts have sufficient contrast
