import { client, db, resetTestDatabase } from '../db/test-db';
import * as schema from '../db/schema';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { sql } from 'drizzle-orm';

// Setup function to run before all tests
export async function setupTestDatabase() {
	try {
		// Reset the database connection to ensure it's fresh for each test suite
		const { db: freshDb } = await resetTestDatabase();

		// Enable foreign keys
		await freshDb.run(sql`PRAGMA foreign_keys = ON;`);

		// Apply migrations
		await migrate(freshDb, { migrationsFolder: './db/migrations' });

		// You can add seed data here if needed
	} catch (error) {
		console.error('Error setting up test database:', error);
		throw error;
	}
}

// Teardown function to run after all tests - if needed
export async function teardownTestDatabase() {
	// We handle this in resetTestDatabase now
}
