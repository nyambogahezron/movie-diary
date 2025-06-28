import { client, db, resetTestDatabase } from '../db/test-db';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { sql } from 'drizzle-orm';

// Setup function to run before all tests
export async function setupTestDatabase() {
	try {
		const { db: freshDb } = await resetTestDatabase();

		await freshDb.run(sql`PRAGMA foreign_keys = ON;`);

		await migrate(freshDb, { migrationsFolder: './db/migrations' });
	} catch (error) {
		console.error('Error setting up test database:', error);
		throw error;
	}
}

export async function teardownTestDatabase() {}
