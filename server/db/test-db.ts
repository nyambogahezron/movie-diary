import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

export const createTestClient = () => {
	return createClient({
		url: 'file::memory:',
	});
};

let client = createTestClient();
export const db = drizzle(client);

export const resetTestDatabase = async () => {
	if (client) {
		try {
			await client.close();
		} catch (error) {
			console.error('Error closing test database connection:', error);
		}
	}

	client = createTestClient();

	const newDb = drizzle(client);

	Object.assign(db, newDb);

	return { db, client };
};

export { client };
