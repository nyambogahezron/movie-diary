import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);
dotenv.config();

const migrationsFolder = path.join(__dirname, '../db/migrations');
const metaFolder = path.join(migrationsFolder, 'meta');

// Ensure migrations folder structure exists
if (!fs.existsSync(metaFolder)) {
	fs.mkdirSync(metaFolder, { recursive: true });
}

const journalPath = path.join(metaFolder, '_journal.json');
if (!fs.existsSync(journalPath)) {
	fs.writeFileSync(
		journalPath,
		JSON.stringify({
			version: '5',
			entries: [],
		})
	);
}

async function runDrizzleKit(command: string): Promise<string> {
	console.log(`Running drizzle-kit ${command}...`);
	try {
		const { stdout, stderr } = await execPromise(`bun drizzle-kit ${command}`);
		if (stderr) console.error(`drizzle-kit ${command} stderr:`, stderr);
		return stdout;
	} catch (e: any) {
		console.error(`Error running drizzle-kit ${command}:`, e.message);
		throw e;
	}
}

async function runMigrations() {
	try {
		// Step 1: Generate migrations based on current schema
		const generateOutput = await runDrizzleKit('generate');
		console.log('Migration generation completed:', generateOutput);

		// Step 2: Apply migrations to database
		const dbUrl = process.env.DATABASE_URL!;
		const client = createClient({ url: dbUrl });
		const db = drizzle(client, { schema });

		console.log('Applying migrations to database...');
		await migrate(db, { migrationsFolder });
		console.log('Migrations applied successfully!');

		client.close();
	} catch (error) {
		console.error('Migration process failed:', error);
		process.exit(1);
	}
}

runMigrations();
