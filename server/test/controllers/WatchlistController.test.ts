import supertest from 'supertest';
import { createTestApp } from '../test-app';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import {
	createTestUser,
	createTestWatchlist,
	attachAuthCookie,
} from '../utils';
import { sql } from 'drizzle-orm';

describe('WatchlistController', () => {
	const app = createTestApp();
	const request = supertest(app);
	let authToken: string;
	let userId: number;

	beforeAll(async () => {
		await setupTestDatabase();
		// Create test user
		const { user, token } = await createTestUser();
		authToken = token;
		userId = user.id;
	});

	afterAll(async () => {
		await teardownTestDatabase();
	});

	beforeEach(async () => {
		// Clear watchlists before each test
		await db.delete(schema.watchlists);
	});

	describe('POST /api/watchlists', () => {
		it('should create a new watchlist', async () => {
			const watchlistData = {
				name: 'My Watchlist',
				description: 'Movies to watch later',
				isPublic: true,
			};

			const response = await attachAuthCookie(
				request.post('/api/watchlists'),
				authToken
			).send(watchlistData);

			expect(response.status).toBe(201);
			expect(response.body.message).toBe('Watchlist created successfully');
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data.name).toBe(watchlistData.name);
			expect(response.body.data.description).toBe(watchlistData.description);
			expect(response.body.data.isPublic).toBe(watchlistData.isPublic);

			// Check database
			const watchlists = await db.select().from(schema.watchlists);
			expect(watchlists.length).toBe(1);
			expect(watchlists[0].name).toBe(watchlistData.name);
		});

		it('should return 400 if required fields are missing', async () => {
			const response = await attachAuthCookie(
				request.post('/api/watchlists'),
				authToken
			).send({
				// Missing name
				description: 'Description only',
			});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request.post('/api/watchlists').send({
				name: 'Unauthorized Watchlist',
			});

			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/watchlists', () => {
		beforeEach(async () => {
			// Create test watchlists
			await createTestWatchlist({ name: 'Watchlist 1' }, userId);
			await createTestWatchlist({ name: 'Watchlist 2' }, userId);
			await createTestWatchlist({ name: 'Watchlist 3' }, userId);
		});

		it('should get all watchlists for the user', async () => {
			const response = await attachAuthCookie(
				request.get('/api/watchlists'),
				authToken
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toBeInstanceOf(Array);
			expect(response.body.data.length).toBe(3);
			expect(response.body.data[0]).toHaveProperty('id');
			expect(response.body.data[0]).toHaveProperty('name');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request.get('/api/watchlists');

			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/watchlists/:id', () => {
		let watchlistId: number;

		beforeEach(async () => {
			// Create a test watchlist
			const watchlist = await createTestWatchlist(
				{ name: 'Test Watchlist' },
				userId
			);
			watchlistId = watchlist.id;
		});

		it('should get a watchlist by id', async () => {
			const response = await attachAuthCookie(
				request.get(`/api/watchlists/${watchlistId}`),
				authToken
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty('id', watchlistId);
			expect(response.body.data).toHaveProperty('name', 'Test Watchlist');
		});

		it('should return 404 if watchlist not found', async () => {
			const response = await request
				.get('/api/watchlists/99999')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('PUT /api/watchlists/:id', () => {
		let watchlistId: number;

		beforeEach(async () => {
			// Create a test watchlist
			const watchlist = await createTestWatchlist(
				{ name: 'Original Name' },
				userId
			);
			watchlistId = watchlist.id;
		});

		it('should update a watchlist', async () => {
			const updateData = {
				name: 'Updated Name',
				description: 'Updated description',
				isPublic: true,
			};

			const response = await attachAuthCookie(
				request.put(`/api/watchlists/${watchlistId}`),
				authToken
			).send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Watchlist updated successfully');
			expect(response.body.data).toHaveProperty('name', updateData.name);
			expect(response.body.data).toHaveProperty(
				'description',
				updateData.description
			);
			expect(response.body.data).toHaveProperty(
				'isPublic',
				updateData.isPublic
			);

			// Check database
			const watchlists = await db
				.select()
				.from(schema.watchlists)
				.where(sql`${schema.watchlists.id} = ${watchlistId}`);
			expect(watchlists[0].name).toBe(updateData.name);
		});

		it('should return 404 if watchlist not found', async () => {
			const response = await attachAuthCookie(
				request.put('/api/watchlists/99999'),
				authToken
			).send({ name: 'Updated Name' });

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('DELETE /api/watchlists/:id', () => {
		let watchlistId: number;

		beforeEach(async () => {
			// Create a test watchlist
			const watchlist = await createTestWatchlist(
				{ name: 'Delete Me' },
				userId
			);
			watchlistId = watchlist.id;
		});

		it('should delete a watchlist', async () => {
			const response = await attachAuthCookie(
				request.delete(`/api/watchlists/${watchlistId}`),
				authToken
			);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Watchlist deleted successfully');

			// Check database
			const watchlists = await db
				.select()
				.from(schema.watchlists)
				.where(sql`${schema.watchlists.id} = ${watchlistId}`);
			expect(watchlists.length).toBe(0);
		});

		it('should return 404 if watchlist not found', async () => {
			const response = await attachAuthCookie(
				request.delete('/api/watchlists/99999'),
				authToken
			);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});
});
