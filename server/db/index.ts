import * as schema from './schema';

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool });

async function testDbConnection() {
	const result = await db.execute('select 1');
}
testDbConnection();

export { schema };
