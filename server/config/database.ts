import { drizzle } from 'drizzle-orm/node-postgres';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import * as schema from '../db/schema';

const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL,
});

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });

export { schema, prisma };
