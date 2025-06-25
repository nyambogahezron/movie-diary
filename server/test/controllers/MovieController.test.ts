import supertest from 'supertest';
import { createTestApp } from '../test-app';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import { createTestUser, createTestMovie, attachAuthCookie } from '../utils';
import { sql } from 'drizzle-orm';

describe('MovieController', () => {
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
		// Clear movies before each test
		await db.delete(schema.movies);
	});

	describe('POST /api/movies', () => {
		it('should create a new movie', async () => {
			const movieData = {
				title: 'Test Movie',
				tmdbId: '12345',
				posterPath: '/test/path.jpg',
				releaseDate: '2023-01-01',
				overview: 'Test overview',
				genres: JSON.stringify(['Action', 'Drama']),
			};

			const response = await attachAuthCookie(
				request.post('/api/movies'),
				authToken
			).send(movieData);

			expect(response.status).toBe(201);
			expect(response.body.message).toBe('Movie created successfully');
			expect(response.body.data).toHaveProperty('id');
			expect(response.body.data.title).toBe(movieData.title);
			expect(response.body.data.tmdbId).toBe(movieData.tmdbId);

			// Check database
			const movies = await db.select().from(schema.movies);
			expect(movies.length).toBe(1);
			expect(movies[0].title).toBe(movieData.title);
		});

		it('should return 400 if required fields are missing', async () => {
			const response = await attachAuthCookie(
				request.post('/api/movies'),
				authToken
			).send({
				// Missing required fields
				posterPath: '/test/path.jpg',
			});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty('error');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request.post('/api/movies').send({
				title: 'Unauthorized Movie',
				tmdbId: '12345',
			});

			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/movies', () => {
		beforeEach(async () => {
			// Create test movies
			await createTestMovie({ title: 'Movie 1', tmdbId: '111' }, userId);
			await createTestMovie({ title: 'Movie 2', tmdbId: '222' }, userId);
			await createTestMovie({ title: 'Movie 3', tmdbId: '333' }, userId);
		});

		it('should get all movies for the user', async () => {
			const response = await attachAuthCookie(
				request.get('/api/movies'),
				authToken
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toBeInstanceOf(Array);
			expect(response.body.data.length).toBe(3);
			expect(response.body.data[0]).toHaveProperty('id');
			expect(response.body.data[0]).toHaveProperty('title');
		});

		it('should return 401 if not authenticated', async () => {
			const response = await request.get('/api/movies');

			expect(response.status).toBe(401);
		});
	});

	describe('GET /api/movies/:id', () => {
		let movieId: number;

		beforeEach(async () => {
			// Create a test movie
			const movie = await createTestMovie(
				{ title: 'Test Movie', tmdbId: '12345' },
				userId
			);
			movieId = movie.id;
		});

		it('should get a movie by id', async () => {
			const response = await attachAuthCookie(
				request.get(`/api/movies/${movieId}`),
				authToken
			);

			expect(response.status).toBe(200);
			expect(response.body.data).toHaveProperty('id', movieId);
			expect(response.body.data).toHaveProperty('title', 'Test Movie');
		});

		it('should return 404 if movie not found', async () => {
			const response = await request
				.get('/api/movies/99999')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('PUT /api/movies/:id', () => {
		let movieId: number;

		beforeEach(async () => {
			// Create a test movie
			const movie = await createTestMovie(
				{ title: 'Original Title', tmdbId: '12345' },
				userId
			);
			movieId = movie.id;
		});

		it('should update a movie', async () => {
			const updateData = {
				title: 'Updated Title',
				rating: 5,
				review: 'Great movie!',
			};

			const response = await request
				.put(`/api/movies/${movieId}`)
				.set('Authorization', `Bearer ${authToken}`)
				.send(updateData);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Movie updated successfully');
			expect(response.body.data).toHaveProperty('title', updateData.title);
			expect(response.body.data).toHaveProperty('rating', updateData.rating);
			expect(response.body.data).toHaveProperty('review', updateData.review);

			// Check database
			const movies = await db
				.select()
				.from(schema.movies)
				.where(sql`${schema.movies.id} = ${movieId}`);
			expect(movies[0].title).toBe(updateData.title);
		});

		it('should return 404 if movie not found', async () => {
			const response = await request
				.put('/api/movies/99999')
				.set('Authorization', `Bearer ${authToken}`)
				.send({ title: 'Updated Title' });

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});

	describe('DELETE /api/movies/:id', () => {
		let movieId: number;

		beforeEach(async () => {
			// Create a test movie
			const movie = await createTestMovie(
				{ title: 'Delete Me', tmdbId: '12345' },
				userId
			);
			movieId = movie.id;
		});

		it('should delete a movie', async () => {
			const response = await request
				.delete(`/api/movies/${movieId}`)
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toBe('Movie deleted successfully');

			// Check database
			const movies = await db
				.select()
				.from(schema.movies)
				.where(sql`${schema.movies.id} = ${movieId}`);
			expect(movies.length).toBe(0);
		});

		it('should return 404 if movie not found', async () => {
			const response = await request
				.delete('/api/movies/99999')
				.set('Authorization', `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty('error');
		});
	});
});
