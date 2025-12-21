# Range App 🎯

Range App is a privacy-first Progressive Web Application (PWA) designed for recreational shooters to track their progress, manage ammunition inventory, and document range sessions with precision.

## 🌟 Key Features

- **Session Tracking:** Log every range visit, including location, duration, weather, and firearms used.
- **Precision Shot Marking:** Capture target photos and mark shots to calculate metrics like extreme spread, MOA, and mean radius.
- **Privacy by Design:** All data (including shot coordinates) is stored locally on your device. No cloud synchronization, no accounts, and no image persistence—photos are discarded once metrics are saved.
- **Ammunition Inventory:** Track your ammo stock and usage per firearm to know when to restock.
- **Firearm Management:** Maintain a digital record of your collection, including round counts and maintenance logs.
- **Drill Performance:** Log times and scores for standardized drills to measure improvement over time.
- **Offline First:** Built as a PWA, the app works seamlessly even at ranges with no cell service.

## 🛠️ Tech Stack

- **Framework:** Vite + React 18
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** [SQLocal](https://github.com/folke/sqlocal) + [Drizzle ORM](https://orm.drizzle.team/) (SQLite in OPFS)
- **Forms:** React Hook Form + Zod
- **State Management:** Zustand
- **PWA Tooling:** `vite-plugin-pwa`
- **Hosting:** Static hosting (Vercel/Cloudflare Pages)

## 🔒 Data & Privacy

The Range App is **local-only by design**. 
- **Storage:** Your data lives entirely in your browser's Origin Private File System (OPFS) via SQLocal.
- **No Image Bloat:** To save space and ensure privacy, the app does not store target photos. It only persists shot coordinates and the resulting metrics.
- **Backups:** Users can explicitly export their entire database as a `.db` or portable `.json` file to their device's native Files app.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS)
- npm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/jordanstella/range-training.git
   cd range-training
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

*Built with passion for the shooting community.*
