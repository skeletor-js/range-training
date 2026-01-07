# Range App User Guide

Welcome to **Range App** – your privacy-first companion for tracking range sessions, managing your armory, and improving your shooting performance. This comprehensive guide covers all features and how to use them effectively.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Privacy & Data](#privacy--data)
3. [Dashboard (Home)](#dashboard-home)
4. [Sessions](#sessions)
5. [Armory (Inventory)](#armory-inventory)
6. [Training](#training)
7. [Target Capture](#target-capture)
8. [Settings](#settings)
9. [Installing as an App (PWA)](#installing-as-an-app-pwa)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

Range App is a **Progressive Web Application (PWA)** that runs entirely in your browser. There's no account to create, no cloud sync, and no backend server—your data belongs to you.

### First Launch

1. Navigate to the app URL in a modern browser (Chrome, Safari, Firefox, Edge)
2. The app initializes a local SQLite database in your browser
3. You'll see the Home dashboard with prompts to start your first session
4. Consider installing the app to your device for the best experience (see [Installing as an App](#installing-as-an-app-pwa))

### System Requirements

- Modern web browser with IndexedDB support
- JavaScript enabled
- Works on desktop, tablet, and mobile devices
- Fully functional offline after initial load

---

## Privacy & Data

Range App is built on the principle of **"Privacy by Design"**:

| Feature | Description |
|---------|-------------|
| **Local Storage Only** | All data is stored in your browser's Origin Private File System (OPFS) using SQLite |
| **No Cloud Sync** | Your data never leaves your device |
| **No User Accounts** | No login, no passwords, no tracking |
| **No Images Stored** | Target photos are used only during capture and immediately discarded |
| **Full Export** | Export your complete database at any time |

> [!IMPORTANT]
> Clearing browser data will delete your Range App data. Use the Export feature regularly to back up your information!

---

## Dashboard (Home)

The Home screen provides an at-a-glance overview of your training progress.

### Stats Cards

Four key metrics displayed at the top:
- **Sessions** – Total number of range sessions logged
- **Targets** – Total targets analyzed
- **Rounds** – Cumulative rounds fired across all sessions
- **Streak** – Current consecutive days/weeks with activity

### Activity Heatmap

A GitHub-style contribution heatmap showing your training frequency over time. Darker squares indicate more sessions on that day.

### Performance Insights

When you have target data, this section displays:
- Recent group size trends
- MOA averages
- Accuracy improvements or areas needing attention

### Training Recommendations

Based on your activity, the app suggests drills to help you improve areas identified from your performance data.

### Recent Sessions

Quick access to your three most recent range sessions. Tap "View all" to see complete history.

### Starting a New Session

Tap **"New Session"** to choose:
- **Full Session with Targets** – Complete workflow with target capture
- **Quick Log (Date + Notes)** – Fast entry for when you just want to record a visit

---

## Sessions

Access via the **Sessions** tab in the bottom navigation.

### Session List

Displays all your range sessions chronologically with:
- Date
- Location (if provided)
- Rounds fired
- Number of targets

Tap any session to view details, or swipe/long-press to delete.

### Session Details

View comprehensive information about a single session:

#### Basic Info
- Date and time
- Location
- Duration
- Weather conditions and temperature

#### Stats
- Total rounds fired
- Number of targets captured
- Malfunctions logged

#### Malfunctions

Log and track equipment issues:

| Malfunction Type | Description |
|-----------------|-------------|
| Failure to Feed | Round fails to chamber |
| Failure to Eject | Spent case not extracted |
| Failure to Fire | Round doesn't fire on trigger pull |
| Light Primer Strike | Primer dented but no ignition |
| Squib | Underpowered round; bullet stuck in barrel |
| Hang Fire | Delayed ignition |
| Misfire | Complete failure to fire |
| Jam | General mechanical stoppage |
| Other | Custom description |

Tracking malfunctions helps identify problematic ammo or firearms needing service.

---

## Armory (Inventory)

Manage your firearms, ammunition, and preferred ranges from the **Armory** tab.

### Weapons Tab

Track all your firearms and airguns:

#### Adding a Weapon

Tap **"Add Weapon"** to enter:
- **Name** – Your identifier for the firearm
- **Type** – Handgun, Rifle, Shotgun, SBR, PCC, Air Rifle, Air Pistol, Black Powder variants, or Other
- **Caliber** – The chambering/gauge
- **Manufacturer** – Gun maker
- **Model** – Specific model name
- **Serial Number** – For your records (optional)
- **Purchase Date** – When you acquired it
- **Notes** – Any additional information

#### Round Count Tracking

The app automatically tracks total rounds fired through each weapon based on session data.

### Ammo Tab

Manage your ammunition inventory:

#### Adding Ammo

- **Caliber** – Match to your weapons
- **Brand** – Manufacturer
- **Product Line** – Specific product name
- **Grain Weight** – Bullet weight
- **Bullet Type** – FMJ, JHP, etc.
- **Round Count** – Current inventory

#### Performance Ratings

Rate your ammo after use:
- **Overall Rating** – 1-5 stars
- **Reliability** – Excellent/Good/Fair/Poor
- **Accuracy** – Excellent/Good/Fair/Poor
- **Review Notes** – Your observations

#### Purchase Tracking

Log individual purchases to track:
- Quantity purchased
- Total price (calculates price per round)
- Seller/retailer
- Purchase date
- Notes

View complete purchase history for any ammo type.

### Ranges Tab

Save your favorite shooting locations:

- **Name** – Range name
- **Address, City, State** – Location details
- **Phone & Website** – Contact info
- **Range Type** – Indoor, Outdoor, or Both
- **Max Distance** – Maximum shooting distance available
- **Notes** – Hours, membership info, etc.
- **Favorite** – Quick access to preferred ranges

### Compatibility Tracking

Link specific ammo to firearms and track how they perform together:
- Performance rating per combination
- Load notes
- Testing date
- Helps identify ideal ammo for each weapon

---

## Training

The **Training** tab provides tools for structured practice.

### Drills Tab

Range App includes **25 built-in drills** covering various skill categories:

#### Categories

| Category | Focus Area |
|----------|------------|
| **Speed** | Draw speed, split times, rapid engagement |
| **Accuracy** | Precision shooting, group size |
| **Movement** | Shooting while moving, position changes |
| **Reload** | Magazine change speed |
| **Other** | Multi-discipline or unique drills |

#### Built-in Drills Include

**Handgun Drills:**
- Bill Drill, Failure Drill (Mozambique), Draw to First Shot
- Dot Torture, 5x5 Drill, 10-10-10
- FAST Drill, El Presidente, Casino Drill
- Cold Start, 1-R-1 Reload, Triple Nickel
- FBI Qualification (2019), Double Tap String

**Carbine Drills:**
- Carbine Bill Drill, VTAC 1-5
- Appleseed AQT, Carbine Ready-Up
- Carbine Emergency Reload, iHack Drill
- Box Drill, Carbine Failure Drill
- Defoor Carbine Test, MOAT Standard

#### Creating Custom Drills

Tap **"Add Drill"** to create your own:
- Name and description
- Category and scoring type
- Platform (handgun/carbine/both)
- Par time and max points
- Round count and target count
- Distance

#### Drill Detail Page

Tap any drill to view:
- Full description and specifications
- Personal best with date achieved
- Performance trend chart
- Complete attempt history

#### Logging Attempts

From the drill detail page, tap **"Log Attempt"** to record:
- Time (for timed drills)
- Points or hits scored
- Pass/fail status
- Firearm and ammo used
- Notes

#### "Surprise Me" Feature

Can't decide what to practice? Tap **"Surprise Me"** for a random drill recommendation. Shuffle again if you want a different option.

### Goals Tab

Set and track training goals:

#### Creating Goals

- **Title** – What you want to achieve
- **Description** – Details about the goal
- **Target Date** – Deadline (optional)
- **Linked Drill** – Connect to a specific drill
- **Target Score** – The performance level to hit

#### Progress Tracking

The app tracks progress toward drill-linked goals automatically, showing:
- Current best vs. target
- Percentage complete
- Days remaining

---

## Target Capture

### How It Works

The target capture feature lets you analyze your groups and shot placement:

1. **Take/Select Photo** – Use your camera or select from photos
2. **Calibrate** – Set the scale using a known reference (target ring diameter)
3. **Mark POA** – Indicate your point of aim
4. **Mark Shots** – Tap each shot hole
5. **Capture** – Save the data (photo is discarded)

### Precision Metrics

For each target, the app calculates:

| Metric | Description |
|--------|-------------|
| **Shot Count** | Total shots on target |
| **Extreme Spread** | Diameter of the smallest circle containing all shots (group size) |
| **Mean Radius** | Average distance from group center |
| **Group Size MOA** | Group size converted to Minute of Angle |
| **Center Offset** | Distance from POA to group center |

### Target Types

The app supports various target types with preset calibration:
- B8 Repair Center
- USPSA/IPSC Metric
- Custom targets with manual calibration

> [!NOTE]
> Photos are used only during the capture process. Only the shot coordinates and calculated metrics are stored—no images are saved.

---

## Settings

Access app configuration from the **Settings** tab.

### Database Statistics

View counts for all stored data:
- Firearms, Ammo entries
- Sessions, Targets, Shots
- Drills

### Export Data

Two export formats available:

| Format | Use Case |
|--------|----------|
| **SQLite Database (.db)** | Complete backup, can be re-imported |
| **JSON Export** | Human-readable, use with other tools |

**Recommended:** Export regularly as a backup strategy.

### Import Data

Restore from a previous SQLite export:
1. Tap "Import Database"
2. Select your .db file
3. Confirm the import (replaces existing data)

> [!CAUTION]
> Importing a database will overwrite all existing data. Export first if you have data you want to keep!

### Theme Settings

Customize the app's appearance:
- Multiple preset themes
- Custom theme creator
- Dark/light mode support

### Session Templates

Create templates for quick session setup:
- Pre-fill location
- Default firearm selection
- Ammo presets

### Display Settings

Adjust the experience to your preferences:

| Setting | Description |
|---------|-------------|
| **High Glare Mode** | Increased contrast for outdoor visibility |
| **Sound Effects** | Audio feedback for timer and actions |
| **Haptic Feedback** | Vibration for timer alerts (on supported devices) |
| **Shot Detection** | Automatic shot detection via microphone |
| **Low Stock Warnings** | Alert when ammo drops below threshold |

### About

View app version and information.

---

## Installing as an App (PWA)

For the best experience, install Range App to your device:

### On iPhone/iPad (Safari)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### On Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen" or "Install app"
4. Confirm

### On Desktop (Chrome/Edge)
1. Look for the install icon in the address bar
2. Click "Install"

### Benefits of Installing
- App icon on your home screen
- Full-screen experience (no browser UI)
- Faster launch
- Works offline
- Feels like a native app

---

## Tips & Best Practices

### Data Backup

1. **Export regularly** – Before clearing browser data or switching devices
2. **Save to cloud storage** – Store your .db exports in iCloud, Google Drive, or Dropbox
3. **Multiple versions** – Keep dated backups (e.g., `range-backup-2026-01-06.db`)

### Session Logging

- **Log immediately** – Record sessions while details are fresh
- **Use Quick Log** – Don't let lack of time stop you from recording at minimum the date
- **Add notes** – Document what worked and what didn't
- **Track conditions** – Weather affects performance; logging helps spot patterns

### Drill Practice

- **Variety matters** – Rotate through different drill categories
- **Cold starts** – Log your first shot of the day as a Cold Start drill
- **Track over time** – Improvement comes from consistent measurement
- **Link goals** – Connect goals to specific drills for focused improvement

### Inventory Management

- **Update ammo counts** – Log purchases and keep session ammo usage accurate
- **Rate after testing** – Review ammo performance while it's fresh in your mind
- **Note compatibility** – Some firearms run better with specific ammo

### Performance Analysis

- **Review trends** – Check the performance charts regularly
- **Identify weaknesses** – Use recommendations to guide practice
- **Celebrate progress** – Personal bests are worth noting!

---

## Quick Reference

### Navigation

| Tab | Purpose |
|-----|---------|
| Home | Dashboard, stats, quick session start |
| Sessions | Session history and details |
| Training | Drills and goals |
| Armory | Weapons, ammo, ranges |
| Settings | Configuration, export/import |

### Keyboard Shortcuts

*Coming in a future update*

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not saving | Ensure sufficient storage space in browser |
| App won't load | Clear cache and refresh |
| Timer not working | Check sound/haptic settings |
| Lost data | Import from your latest backup export |

---

## Support

Range App is a personal, privacy-focused tool. For issues or feature requests, refer to the project documentation or open source repository.

---

*Range App – Own your data. Improve your shooting.*
