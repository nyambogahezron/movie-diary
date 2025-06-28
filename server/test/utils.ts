import { db } from '../db/test-db';
import jwt from 'jsonwebtoken';
import * as schema from '../db/schema';
import bcrypt from 'bcrypt';

export async function createTestUser(userData = {}) {
	const defaultUserData = {
		name: 'Test User',
		username: 'testuser',
		email: 'test@example.com',
		password: await bcrypt.hash('password123', 10),
	};

	const mergedData = { ...defaultUserData, ...userData };

	const insertedUser = await db
		.insert(schema.users)
		.values(mergedData)
		.returning();

	const user = insertedUser[0];

	const token = jwt.sign(
		{ id: user.id, email: user.email },
		process.env.JWT_SECRET || 'test_secret',
		{ expiresIn: '1h' }
	);

	return { user, token };
}

export async function createTestMovie(movieData = {}, userId: number) {
	const defaultMovieData = {
		title: 'Test Movie',
		tmdbId: '12345',
		posterPath: '/path/to/poster.jpg',
		releaseDate: '2023-01-01',
		overview: 'Test overview',
		userId,
	};

	const mergedData = { ...defaultMovieData, ...movieData };

	const insertedMovie = await db
		.insert(schema.movies)
		.values(mergedData)
		.returning();

	return insertedMovie[0];
}

export async function createTestWatchlist(watchlistData = {}, userId: number) {
	const defaultWatchlistData = {
		name: 'Test Watchlist',
		description: 'Test description',
		isPublic: false,
		userId,
	};

	const mergedData = { ...defaultWatchlistData, ...watchlistData };

	const insertedWatchlist = await db
		.insert(schema.watchlists)
		.values(mergedData)
		.returning();

	return insertedWatchlist[0];
}

export function attachAuthCookie(request: any, token: string) {
	return request.set('Cookie', [`accessToken=${token}`]);
}
