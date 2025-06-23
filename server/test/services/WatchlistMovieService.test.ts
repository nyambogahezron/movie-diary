import { WatchlistMovieService } from '../../services/WatchlistMovieService';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { createTestUser, createTestMovie, createTestWatchlist } from '../utils';
import { eq, and } from 'drizzle-orm';
import { User as UserType } from '../../types';

describe('WatchlistMovieService', () => {
	let user: UserType;
	let watchlistId: number;
	let movieId: number;

	beforeAll(async () => {
		await setupTestDatabase();
		// Create test user, watchlist and movie
		const { user: testUser } = await createTestUser();
		user = testUser as UserType;

		const watchlist = await createTestWatchlist(
			{ name: 'Test Watchlist' },
			user.id
		);
		watchlistId = watchlist.id;

		const movie = await createTestMovie({ title: 'Test Movie' }, user.id);
		movieId = movie.id;
	});

	afterAll(async () => {
		await teardownTestDatabase();
	});

	beforeEach(async () => {
		// Clear watchlist movies before each test
		await db.delete(schema.watchlistMovies);
	});

	describe('addMovieToWatchlist', () => {
		it('should add a movie to watchlist and return it', async () => {
			const result = await WatchlistMovieService.addMovieToWatchlist(
				watchlistId,
				movieId,
				user
			);

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('watchlistId', watchlistId);
			expect(result).toHaveProperty('movieId', movieId);

			// Check database
			const watchlistMovies = await db.select().from(schema.watchlistMovies);
			expect(watchlistMovies.length).toBe(1);
			expect(watchlistMovies[0].watchlistId).toBe(watchlistId);
			expect(watchlistMovies[0].movieId).toBe(movieId);
		});

		it('should throw error if movie is already in watchlist', async () => {
			// First add the movie to watchlist
			await db.insert(schema.watchlistMovies).values({
				watchlistId,
				movieId,
			});

			// Try to add it again
			await expect(
				WatchlistMovieService.addMovieToWatchlist(watchlistId, movieId, user)
			).rejects.toThrow('Movie is already in the watchlist');
		});

		it('should throw error if watchlist does not exist', async () => {
			const nonExistentWatchlistId = 9999;

			await expect(
				WatchlistMovieService.addMovieToWatchlist(
					nonExistentWatchlistId,
					movieId,
					user
				)
			).rejects.toThrow('Watchlist not found');
		});

		it('should throw error if user does not have permission', async () => {
			// Create a watchlist owned by a different user
			const otherUserWatchlist = await createTestWatchlist(
				{ name: 'Other User Watchlist' },
				999
			);

			await expect(
				WatchlistMovieService.addMovieToWatchlist(
					otherUserWatchlist.id,
					movieId,
					user
				)
			).rejects.toThrow('You do not have permission to modify this watchlist');
		});
	});

	describe('getWatchlistMovies', () => {
		beforeEach(async () => {
			// Create test movies
			const movie1 = await createTestMovie(
				{ title: 'Watchlist Movie 1' },
				user.id
			);
			const movie2 = await createTestMovie(
				{ title: 'Watchlist Movie 2' },
				user.id
			);

			// Create another watchlist
			const otherWatchlist = await createTestWatchlist(
				{ name: 'Other Watchlist' },
				user.id
			);

			// Add movies to watchlists
			await db.insert(schema.watchlistMovies).values([
				{ watchlistId, movieId: movie1.id },
				{ watchlistId, movieId: movie2.id },
				{ watchlistId: otherWatchlist.id, movieId }, // Different watchlist
			]);
		});

		it('should return movies for the specified watchlist', async () => {
			const movies = await WatchlistMovieService.getWatchlistMovies(
				watchlistId,
				user
			);

			expect(movies).toBeInstanceOf(Array);
			expect(movies.length).toBe(2);
			expect(movies[0]).toHaveProperty('title');
			expect(movies.map((m) => m.title)).toContain('Watchlist Movie 1');
			expect(movies.map((m) => m.title)).toContain('Watchlist Movie 2');
			expect(movies.map((m) => m.title)).not.toContain('Test Movie');
		});

		it('should throw error if watchlist does not exist', async () => {
			const nonExistentWatchlistId = 9999;

			await expect(
				WatchlistMovieService.getWatchlistMovies(nonExistentWatchlistId, user)
			).rejects.toThrow('Watchlist not found');
		});

		it('should throw error if user does not have permission', async () => {
			// Create a private watchlist owned by a different user
			const otherUserWatchlist = await createTestWatchlist(
				{ name: 'Private Watchlist', isPublic: false },
				999
			);

			await expect(
				WatchlistMovieService.getWatchlistMovies(otherUserWatchlist.id, user)
			).rejects.toThrow('You do not have permission to view this watchlist');
		});
	});

	describe('removeMovieFromWatchlist', () => {
		beforeEach(async () => {
			// Add movie to watchlist
			await db.insert(schema.watchlistMovies).values({
				watchlistId,
				movieId,
			});
		});

		it('should remove movie from watchlist', async () => {
			await WatchlistMovieService.removeMovieFromWatchlist(
				watchlistId,
				movieId,
				user
			);

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

		it('should throw error when movie is not in watchlist', async () => {
			const nonExistentMovieId = 9999;
			await expect(
				WatchlistMovieService.removeMovieFromWatchlist(
					watchlistId,
					nonExistentMovieId,
					user
				)
			).rejects.toThrow('Movie is not in the watchlist');
		});

		it('should throw error if watchlist does not exist', async () => {
			const nonExistentWatchlistId = 9999;

			await expect(
				WatchlistMovieService.removeMovieFromWatchlist(
					nonExistentWatchlistId,
					movieId,
					user
				)
			).rejects.toThrow('Watchlist not found');
		});

		it('should throw error if user does not have permission', async () => {
			// Create a watchlist owned by a different user
			const otherUserWatchlist = await createTestWatchlist(
				{ name: 'Other User Watchlist' },
				999
			);

			await expect(
				WatchlistMovieService.removeMovieFromWatchlist(
					otherUserWatchlist.id,
					movieId,
					user
				)
			).rejects.toThrow('You do not have permission to modify this watchlist');
		});
	});
});
