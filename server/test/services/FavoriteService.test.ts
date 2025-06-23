import { FavoriteService } from '../../services/FavoriteService';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { createTestUser, createTestMovie } from '../utils';
import { User as UserType } from '../../types';
import { eq, and } from 'drizzle-orm';

describe('FavoriteService', () => {
	let user: UserType;
	let movieId: number;

	beforeAll(async () => {
		await setupTestDatabase();
		// Create test user and movie
		const { user: testUser } = await createTestUser();
		user = testUser as UserType;

		const movie = await createTestMovie({ title: 'Test Movie' }, user.id);
		movieId = movie.id;
	});

	afterAll(async () => {
		await teardownTestDatabase();
	});

	beforeEach(async () => {
		// Clear favorites before each test
		await db.delete(schema.favorites);
	});

	describe('addFavorite', () => {
		it('should add a movie to favorites and return it', async () => {
			const result = await FavoriteService.addFavorite(movieId, user);

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('userId', user.id);
			expect(result).toHaveProperty('movieId', movieId);

			// Check database
			const favorites = await db.select().from(schema.favorites);
			expect(favorites.length).toBe(1);
			expect(favorites[0].userId).toBe(user.id);
			expect(favorites[0].movieId).toBe(movieId);
		});

		it('should throw error if movie is already in favorites', async () => {
			// First add the movie to favorites
			await db.insert(schema.favorites).values({
				userId: user.id,
				movieId,
			});

			// Try to add it again
			await expect(FavoriteService.addFavorite(movieId, user)).rejects.toThrow(
				'Movie already in favorites'
			);
		});

		it('should throw error if movie does not exist', async () => {
			const nonExistentMovieId = 9999;

			await expect(
				FavoriteService.addFavorite(nonExistentMovieId, user)
			).rejects.toThrow('Movie not found');
		});
	});

	describe('getFavoriteMovies', () => {
		beforeEach(async () => {
			// Create test movies
			const movie1 = await createTestMovie(
				{ title: 'Favorite Movie 1' },
				user.id
			);
			const movie2 = await createTestMovie(
				{ title: 'Favorite Movie 2' },
				user.id
			);
			const movie3 = await createTestMovie({ title: 'Not Favorite' }, user.id);

			// Add movies to favorites
			await db.insert(schema.favorites).values([
				{ userId: user.id, movieId: movie1.id },
				{ userId: user.id, movieId: movie2.id },
			]);
		});

		it('should return favorite movies for the user', async () => {
			const movies = await FavoriteService.getFavoriteMovies(user);

			expect(movies).toBeInstanceOf(Array);
			expect(movies.length).toBe(2);
			expect(movies[0]).toHaveProperty('title');
			expect(movies.map((m: any) => m.title)).toContain('Favorite Movie 1');
			expect(movies.map((m: any) => m.title)).toContain('Favorite Movie 2');
			expect(movies.map((m: any) => m.title)).not.toContain('Not Favorite');
		});
	});

	describe('isFavorite', () => {
		beforeEach(async () => {
			// Add movie to favorites
			await db.insert(schema.favorites).values({
				userId: user.id,
				movieId,
			});
		});

		it('should return true if movie is in favorites', async () => {
			const result = await FavoriteService.isFavorite(movieId, user);
			expect(result).toBe(true);
		});

		it('should return false if movie is not in favorites', async () => {
			const nonExistentMovieId = 9999;
			const result = await FavoriteService.isFavorite(nonExistentMovieId, user);
			expect(result).toBe(false);
		});
	});

	describe('removeFavorite', () => {
		beforeEach(async () => {
			// Add movie to favorites
			await db.insert(schema.favorites).values({
				userId: user.id,
				movieId,
			});
		});

		it('should remove movie from favorites', async () => {
			await FavoriteService.removeFavorite(movieId, user);

			// Check database
			const favorites = await db
				.select()
				.from(schema.favorites)
				.where(
					and(
						eq(schema.favorites.userId, user.id),
						eq(schema.favorites.movieId, movieId)
					)
				);

			expect(favorites.length).toBe(0);
		});

		it('should throw error when favorite relationship does not exist', async () => {
			const nonExistentMovieId = 9999;
			await expect(
				FavoriteService.removeFavorite(nonExistentMovieId, user)
			).rejects.toThrow('Movie is not in favorites');
		});
	});
});
