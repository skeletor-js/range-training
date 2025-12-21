import { db, getDatabaseFile, overwriteDatabaseFile } from '@/db';
import {
  firearms, ammo, ammoPurchases, sessions, sessionFirearms,
  sessionAmmo, targets, shots, drills, drillBenchmarks,
  drillAttempts, goals, timerSessions
} from '@/db/schema';

/**
 * Generate a timestamp-based filename
 */
function generateFilename(extension: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `range-backup-${date}.${extension}`;
}

/**
 * Export the database as a SQLite file
 * Uses Web Share API on mobile, falls back to download on desktop
 */
export async function exportDatabase(): Promise<void> {
  try {
    const dbFile = await getDatabaseFile();
    const filename = generateFilename('db');

    // Create a new file with our preferred filename
    const file = new File([dbFile], filename, { type: 'application/x-sqlite3' });

    // Try native share first (works well on mobile)
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Range App Backup',
      });
    } else {
      // Fallback: trigger download
      downloadBlob(file, filename);
    }
  } catch (error) {
    // User cancelled share or other error
    if ((error as Error).name !== 'AbortError') {
      console.error('Export failed:', error);
      throw error;
    }
  }
}

/**
 * Export all data as a JSON file (human-readable, portable)
 */
export async function exportAsJSON(): Promise<void> {
  try {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '2.2',
      firearms: await db.select().from(firearms),
      ammo: await db.select().from(ammo),
      ammoPurchases: await db.select().from(ammoPurchases),
      sessions: await db.select().from(sessions),
      sessionFirearms: await db.select().from(sessionFirearms),
      sessionAmmo: await db.select().from(sessionAmmo),
      targets: await db.select().from(targets),
      shots: await db.select().from(shots),
      drills: await db.select().from(drills),
      drillBenchmarks: await db.select().from(drillBenchmarks),
      drillAttempts: await db.select().from(drillAttempts),
      goals: await db.select().from(goals),
      timerSessions: await db.select().from(timerSessions),
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = generateFilename('json');
    const file = new File([blob], filename, { type: 'application/json' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Range App Export',
      });
    } else {
      downloadBlob(blob, filename);
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('JSON export failed:', error);
      throw error;
    }
  }
}

/**
 * Import a database file, replacing the current database
 */
export async function importDatabase(file: File): Promise<void> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);

  // Basic validation: SQLite files start with "SQLite format 3"
  const header = new TextDecoder().decode(data.slice(0, 16));
  if (!header.startsWith('SQLite format 3')) {
    throw new Error('Invalid database file: not a SQLite database');
  }

  await overwriteDatabaseFile(data);

  // Reload to reinitialize with new data
  window.location.reload();
}

/**
 * Get database statistics for display
 */
export async function getDatabaseStats(): Promise<{
  firearms: number;
  ammo: number;
  sessions: number;
  targets: number;
  shots: number;
  drills: number;
}> {
  const [
    firearmsCount,
    ammoCount,
    sessionsCount,
    targetsCount,
    shotsCount,
    drillsCount,
  ] = await Promise.all([
    db.select().from(firearms).then(r => r.length),
    db.select().from(ammo).then(r => r.length),
    db.select().from(sessions).then(r => r.length),
    db.select().from(targets).then(r => r.length),
    db.select().from(shots).then(r => r.length),
    db.select().from(drills).then(r => r.length),
  ]);

  return {
    firearms: firearmsCount,
    ammo: ammoCount,
    sessions: sessionsCount,
    targets: targetsCount,
    shots: shotsCount,
    drills: drillsCount,
  };
}

/**
 * Helper to trigger a file download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
