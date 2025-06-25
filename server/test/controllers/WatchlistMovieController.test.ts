import supertest from 'supertest';
import { createTestApp } from '../test-app';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import {
	createTestUser,
	createTestWatchlist,
	createTestMovie,
	attachAuthCookie,
} from '../utils';
import { eq, and } from 'drizzle-orm';

describe('WatchlistMovieController', () => {
	const app = createTestApp();
	const request = supertest(app);
	let authToken: string;
	let userId: number;
	let watchlistId: number;
	let movieId: number;

	beforeAll(async () => {
		await setupTestDatabase();
		// Create test user
		const { user, token } = await createTestUser();
		authToken = token;
		userId = user.id;

		// Create a test watchlist
		const watchlist = await createTestWatchlist(
			{ name: 'Test Watchlist' },
			userId
		);
		watchlistId = watchlist.id;

		// Create a test movie
		const movie = await createTestMovie({ title: 'Test Movie' }, userId);
		movieId = movie.id;
	});

	afterAll(async () => {
		await teardownTestDatabase();
	});

	beforeEach(async () => {
		// Clear watchlistMovies before each test
		await db.delete(schema.watchlistMovies);
	});

	describe('POST /api/watchlists/:watchlistId/movies', () => {
		it('should add a movie to a watchlist', async () => {
			const response = await request
				.post(`/api/watchlists/${watchlistId}/movies`)
				.set('Authorization', `Bearer ${authToken}`)
				.send({ movieId });

			expect(response.status).toBe(201);
			expect(response.body.message).toBe('Movie added to watchlist');
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data).toHaveProperty('watchlistId', watchlistId);
			expect(response.body.data).toHaveProperty('movieId', movieId);

			// Check database
			const watchlistMovies = await db.select().from(schema.watchlistMovies);
			expect(watchlistMovies.length).toBe(1);
			expect(watchlistMovies[0].watchlistId).toBe(watchlistId);
			expect(watchlistMovies[0].movieId).toBe(movieId);
		});

		it('should return 400 if movie is already in the watchlist', async () => {
			// Add movie to watchlist first
			await db.insert(schema.watchlistMovies).values({
				watchlistId,
				movieId,
			});

			// Try to add it again
			const response = await request
				.post(`/api/watchlists/${watchlistId}/movies`)
				.set('Authorization', `Bearer ${authToken}`)
				.send({ movieId });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 404 if watchlist does not exist', async () => {
			const response = await request
				.post('/api/watchlists/99999/movies')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ movieId });

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 400 if movieId is not provided', async () => {
			const response = await request
				.post(`/api/watchlists/${watchlistId}/movies`)
				.set('Authorization', `Bearer ${authToken}`)
				.send({});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request
				.post(`/api/watchlists/${watchlistId}/movies`)
				.send({ movieId });

			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/watchlists/:watchlistId/movies', () => {
		beforeEach(async () => {
			// Create test movies and add to watchlist
			const movie1 = await createTestMovie(
				{ title: 'Watchlist Movie 1' },
				userId
			);
			const movie2 = await createTestMovie(
				{ title: 'Watchlist Movie 2' },
				userId
			);

			await db.insert(schema.watchlistMovies).values([
				{ watchlistId, movieId: movie1.id },
				{ watchlistId, movieId: movie2.id },
				{ watchlistId, movieId },
			]);
		});

		it('should get all movies in a watchlist', async () => {
			const response = await request
				.get(`/api/watchlists/${watchlistId}/movies`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.data).toBeInstanceOf(Array);
			expect(response.body.data.length).toBe(3);

			// Verify that we get movie details
			expect(response.body.data[0]).toHaveProperty('id');
			expect(response.body.data[0]).toHaveProperty('title');
			expect(response.body.data[0]).toHaveProperty('tmdbId');
		});

		it('should return 404 if watchlist does not exist', async () => {
			const response = await request
				.get('/api/watchlists/99999/movies')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request.get(
				`/api/watchlists/${watchlistId}/movies`
			);

			expect(response.status).toBe(401);
		});
	});

	describe('DELETE /api/watchlists/:watchlistId/movies/:movieId', () => {
		beforeEach(async () => {
			// Add movie to watchlist
			await db.insert(schema.watchlistMovies).values({
				watchlistId,
				movieId,
			});
		});

		it('should remove a movie from a watchlist', async () => {
			const response = await request
				.delete(`/api/watchlists/${watchlistId}/movies/${movieId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Movie removed from watchlist');

			// Check database
			const watchlistMovies = await db
				.select()
				.from(schema.watchlistMovies)
				.where(
					and(
						eq(schema.watchlistMovies.watchlistId, watchlistId),
						eq(schema.watchlistMovies.movieId, movieId)
					)
				);
			expect(watchlistMovies.length).toBe(0);
		});

		it('should return 404 if movie is not in watchlist', async () => {
			// Use a non-existent movie ID
			const nonExistentMovieId = 99999;

			const response = await request
				.delete(`/api/watchlists/${watchlistId}/movies/${nonExistentMovieId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 404 if watchlist does not exist', async () => {
			const response = await request
				.delete(`/api/watchlists/99999/movies/${movieId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request.delete(
				`/api/watchlists/${watchlistId}/movies/${movieId}`
			);

			expect(response.status).toBe(401);
		});
	});
});
