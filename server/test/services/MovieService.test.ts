import { MovieService } from '../../services/MovieService';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';
import { User as UserType } from '../../types';

describe('MovieService', () => {
	let user: UserType;

	beforeAll(async () => {
		await setupTestDatabase();
		// Create a test user
		const { user: testUser } = await createTestUser();
		user = testUser as UserType;
	});

	afterAll(async () => {
		await teardownTestDatabase();
	});

	beforeEach(async () => {
		// Clear movies before each test
		await db.delete(schema.movies);
	});

	describe('addMovie', () => {
		it('should create a new movie and return it', async () => {
			const movieData = {
				title: 'Test Movie',
				tmdbId: '12345',
				posterPath: '/test/poster.jpg',
				releaseDate: '2023-01-01',
				overview: 'Test overview',
				genres: ['Action', 'Drama'] as string[],
			};

			const result = await MovieService.addMovie(movieData, user);

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('title', movieData.title);
			expect(result).toHaveProperty('tmdbId', movieData.tmdbId);
			expect(result).toHaveProperty('posterPath', movieData.posterPath);

			// Check database
			const movies = await db.select().from(schema.movies);
			expect(movies.length).toBe(1);
			expect(movies[0].title).toBe(movieData.title);
			expect(movies[0].userId).toBe(user.id);
		});
	});

	describe('getUserMovies', () => {
		beforeEach(async () => {
			// Create test movies
			await db.insert(schema.movies).values([
				{
					title: 'Movie 1',
					tmdbId: '111',
					userId: user.id,
				},
				{
					title: 'Movie 2',
					tmdbId: '222',
					userId: user.id,
				},
				{
					title: 'Movie 3',
					tmdbId: '333',
					userId: 999, // Different user
				},
			]);
		});

		it('should return only movies for the specified user', async () => {
			const movies = await MovieService.getUserMovies(user);

			expect(movies).toBeInstanceOf(Array);
			expect(movies.length).toBe(2);
			expect(movies[0]).toHaveProperty('title');
			expect(movies.map((m: { title: string }) => m.title)).toContain(
				'Movie 1'
			);
			expect(movies.map((m: { title: string }) => m.title)).toContain(
				'Movie 2'
			);
			expect(movies.map((m: { title: string }) => m.title)).not.toContain(
				'Movie 3'
			);
		});
	});

	describe('getMovie', () => {
		let movieId: number;

		beforeEach(async () => {
			// Create a test movie
			const result = await db
				.insert(schema.movies)
				.values({
					title: 'Get By ID Movie',
					tmdbId: '12345',
					userId: user.id,
				})
				.returning();

			movieId = result[0].id;
		});

		it('should return movie when valid ID is provided', async () => {
			const movie = await MovieService.getMovie(movieId, user);

			expect(movie).toHaveProperty('id', movieId);
			expect(movie).toHaveProperty('title', 'Get By ID Movie');
			expect(movie).toHaveProperty('isFavorite', false);
		});

		it('should throw error when movie does not exist', async () => {
			await expect(MovieService.getMovie(9999, user)).rejects.toThrow(
				'Movie not found'
			);
		});
	});

	describe('updateMovie', () => {
		let movieId: number;

		beforeEach(async () => {
			// Create a test movie
			const result = await db
				.insert(schema.movies)
				.values({
					title: 'Original Title',
					tmdbId: '12345',
					overview: 'Original overview',
					userId: user.id,
				})
				.returning();

			movieId = result[0].id;
		});

		it('should update movie and return updated data', async () => {
			const updateData = {
				title: 'Updated Title',
				rating: 5,
				review: 'Great movie!',
			};

			const result = await MovieService.updateMovie(movieId, updateData, user);

			expect(result).toHaveProperty('id', movieId);
			expect(result).toHaveProperty('title', updateData.title);
			expect(result).toHaveProperty('rating', updateData.rating);
			expect(result).toHaveProperty('review', updateData.review);
			expect(result).toHaveProperty('tmdbId', '12345'); // Unchanged field

			// Check database
			const movies = await db
				.select()
				.from(schema.movies)
				.where(eq(schema.movies.id, movieId));

			expect(movies[0].title).toBe(updateData.title);
			expect(movies[0].rating).toBe(updateData.rating);
		});

		it('should throw error when movie does not exist', async () => {
			await expect(
				MovieService.updateMovie(9999, { title: 'Updated Title' }, user)
			).rejects.toThrow('Movie not found');
		});
	});

	describe('deleteMovie', () => {
		let movieId: number;

		beforeEach(async () => {
			// Create a test movie
			const result = await db
				.insert(schema.movies)
				.values({
					title: 'Delete Me',
					tmdbId: '12345',
					userId: user.id,
				})
				.returning();

			movieId = result[0].id;
		});

		it('should delete movie', async () => {
			await MovieService.deleteMovie(movieId, user);

			// Check database
			const movies = await db
				.select()
				.from(schema.movies)
				.where(eq(schema.movies.id, movieId));

			expect(movies.length).toBe(0);
		});

		it('should throw error when movie does not exist', async () => {
			await expect(MovieService.deleteMovie(9999, user)).rejects.toThrow(
				'Movie not found'
			);
		});
	});
});
