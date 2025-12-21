// Public database API
// Re-exports from internal modules for external use

export { db, sqlocal } from './client';
export { initializeDatabase, CURRENT_SCHEMA_VERSION } from './init';

/**
 * Get the database file for export
 */
export async function getDatabaseFile(): Promise<File> {
  const { sqlocal } = await import('./client');
  return await sqlocal.getDatabaseFile();
}

/**
 * Overwrite the database with imported data
 */
export async function overwriteDatabaseFile(data: ArrayBuffer | Uint8Array): Promise<void> {
  const { sqlocal } = await import('./client');
  await sqlocal.overwriteDatabaseFile(data);
}

/**
 * Destroy and recreate the database (for development/testing)
 */
export async function resetDatabase(): Promise<void> {
  const { sqlocal } = await import('./client');
  const { initializeDatabase } = await import('./init');
  await sqlocal.destroy();
  await initializeDatabase();
}
