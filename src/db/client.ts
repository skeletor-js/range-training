import { SQLocalDrizzle } from 'sqlocal/drizzle';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

// Database name stored in OPFS
const DATABASE_NAME = 'range-app.db';

// Initialize SQLocal with Drizzle integration
export const sqlocal = new SQLocalDrizzle(DATABASE_NAME);

// Create Drizzle ORM instance
export const db = drizzle(sqlocal.driver, sqlocal.batchDriver, { schema });
