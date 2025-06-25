import { WatchlistService } from '../../services/WatchlistService';
import { db } from '../../db/test-db';
import * as schema from '../../db/schema';
import { setupTestDatabase, teardownTestDatabase } from '../setup';
import { createTestUser } from '../utils';
import { eq } from 'drizzle-orm';
import { User as UserType } from '../../types';

describe('WatchlistService', () => {
	let user: UserType;

	beforeAll(async () => {
		// Setup fresh database for each test suite
		await setupTestDatabase();
	});

	beforeEach(async () => {
		// Clear any existing data
		await db.delete(schema.watchlistMovies);
		await db.delete(schema.watchlists);
		await db.delete(schema.users);

		// Create a test user for each test
		const { user: testUser } = await createTestUser();
		user = testUser as UserType;
	});

	describe('createWatchlist', () => {
		it('should create a new watchlist and return it', async () => {
			const watchlistData = {
				name: 'My Watchlist',
				description: 'Test description',
				isPublic: true,
			};

			const result = await WatchlistService.createWatchlist(
				watchlistData,
				user
			);

			expect(result).toHaveProperty('id');
			expect(result).toHaveProperty('name', watchlistData.name);
			expect(result).toHaveProperty('description', watchlistData.description);
			expect(result).toHaveProperty('isPublic', watchlistData.isPublic);
			expect(result).toHaveProperty('userId', user.id);

			// Check database
			const watchlists = await db.select().from(schema.watchlists);
			expect(watchlists.length).toBe(1);
			expect(watchlists[0].name).toBe(watchlistData.name);
			expect(watchlists[0].userId).toBe(user.id);
		});
	});

	describe('getWatchlists', () => {
		beforeEach(async () => {
			// Create test watchlists
			await db.insert(schema.watchlists).values([
				{
					name: 'Watchlist 1',
					description: 'Test 1',
					isPublic: false,
					userId: user.id,
				},
				{
					name: 'Watchlist 2',
					description: 'Test 2',
					isPublic: true,
					userId: user.id,
				},
				{
					name: 'Watchlist 3',
					description: 'Test 3',
					isPublic: false,
					userId: 999, // Different user
				},
			]);
		});

		it('should return only watchlists for the specified user', async () => {
			const watchlists = await WatchlistService.getWatchlists(user);

			expect(watchlists).toBeInstanceOf(Array);
			expect(watchlists.length).toBe(2);
			expect(watchlists[0]).toHaveProperty('name');
			expect(watchlists.map((w) => w.name)).toContain('Watchlist 1');
			expect(watchlists.map((w) => w.name)).toContain('Watchlist 2');
			expect(watchlists.map((w) => w.name)).not.toContain('Watchlist 3');
		});
	});

	describe('getWatchlist', () => {
		let watchlistId: number;

		beforeEach(async () => {
			// Create a test watchlist
			const result = await db
				.insert(schema.watchlists)
				.values({
					name: 'Get By ID Watchlist',
					description: 'Test description',
					isPublic: false,
					userId: user.id,
				})
				.returning();

			watchlistId = result[0].id;
		});

		it('should return watchlist when valid ID is provided', async () => {
			const watchlist = await WatchlistService.getWatchlist(watchlistId, user);

			expect(watchlist).toHaveProperty('id', watchlistId);
			expect(watchlist).toHaveProperty('name', 'Get By ID Watchlist');
			expect(watchlist).toHaveProperty('userId', user.id);
		});

		it('should throw error when watchlist does not exist', async () => {
			await expect(WatchlistService.getWatchlist(9999, user)).rejects.toThrow(
				'Watchlist not found'
			);
		});

		it('should throw error when user does not have permission', async () => {
			// Create a watchlist owned by a different user
			const otherUserWatchlist = await db
				.insert(schema.watchlists)
				.values({
					name: 'Private Watchlist',
					description: 'Private description',
					isPublic: false,
					userId: 999,
				})
				.returning();

			await expect(
				WatchlistService.getWatchlist(otherUserWatchlist[0].id, user)
			).rejects.toThrow('You do not have permission to view this watchlist');
		});
	});

	describe('updateWatchlist', () => {
		let watchlistId: number;

		beforeEach(async () => {
			// Create a test watchlist
			const result = await db
				.insert(schema.watchlists)
				.values({
					name: 'Original Name',
					description: 'Original description',
					isPublic: false,
					userId: user.id,
				})
				.returning();

			watchlistId = result[0].id;
		});

		it('should update watchlist and return updated data', async () => {
			const updateData = {
				name: 'Updated Name',
				description: 'Updated description',
				isPublic: true,
			};

			const result = await WatchlistService.updateWatchlist(
				watchlistId,
				updateData,
				user
			);

			expect(result).toHaveProperty('id', watchlistId);
			expect(result).toHaveProperty('name', updateData.name);
			expect(result).toHaveProperty('description', updateData.description);
			expect(result).toHaveProperty('isPublic', updateData.isPublic);

			// Check database
			const watchlists = await db
				.select()
				.from(schema.watchlists)
				.where(eq(schema.watchlists.id, watchlistId));

			expect(watchlists[0].name).toBe(updateData.name);
			expect(watchlists[0].isPublic).toBe(updateData.isPublic);
		});

		it('should throw error when watchlist does not exist', async () => {
			await expect(
				WatchlistService.updateWatchlist(9999, { name: 'Updated Name' }, user)
			).rejects.toThrow('Watchlist not found');
		});

		it('should throw error when user does not have permission', async () => {
			// Create a watchlist owned by a different user
			const otherUserWatchlist = await db
				.insert(schema.watchlists)
				.values({
					name: 'Private Watchlist',
					description: 'Private description',
					isPublic: false,
					userId: 999,
				})
				.returning();

			await expect(
				WatchlistService.updateWatchlist(
					otherUserWatchlist[0].id,
					{ name: 'Updated Name' },
					user
				)
			).rejects.toThrow('You do not have permission to update this watchlist');
		});
	});

	describe('deleteWatchlist', () => {
		let watchlistId: number;

		beforeEach(async () => {
			// Create a test watchlist
			const result = await db
				.insert(schema.watchlists)
				.values({
					name: 'Delete Me',
					description: 'To be deleted',
					isPublic: false,
					userId: user.id,
				})
				.returning();

			watchlistId = result[0].id;
		});

		it('should delete watchlist', async () => {
			await WatchlistService.deleteWatchlist(watchlistId, user);

			// Check database
			const watchlists = await db
				.select()
				.from(schema.watchlists)
				.where(eq(schema.watchlists.id, watchlistId));

			expect(watchlists.length).toBe(0);
		});

		it('should throw error when watchlist does not exist', async () => {
			await expect(
				WatchlistService.deleteWatchlist(9999, user)
			).rejects.toThrow('Watchlist not found');
		});

		it('should throw error when user does not have permission', async () => {
			// Create a watchlist owned by a different user
			const otherUserWatchlist = await db
				.insert(schema.watchlists)
				.values({
					name: 'Private Watchlist',
					description: 'Private description',
					isPublic: false,
					userId: 999,
				})
				.returning();

			await expect(
				WatchlistService.deleteWatchlist(otherUserWatchlist[0].id, user)
			).rejects.toThrow('You do not have permission to delete this watchlist');
		});
	});
});
