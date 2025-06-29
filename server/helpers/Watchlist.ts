import { db } from '../db';
import { watchlists, watchlistMovies, movies } from '../db/schema';
import { eq, and, desc, asc, like } from 'drizzle-orm';
import { Watchlist as WatchlistType } from '../types';
import { SearchInput } from '../types';

export class Watchlist {
	static async create(watchlistData: {
		name: string;
		description?: string;
		isPublic: boolean;
		userId: number;
	}) {
		const existingWatchlist = await db
			.select()
			.from(watchlists)
			.where(
				and(
					eq(watchlists.userId, watchlistData.userId),
					eq(watchlists.name, watchlistData.name)
				)
			);

		if (existingWatchlist.length > 0) {
			throw new Error('A watchlist with this name already exists');
		}

		const result = await db
			.insert(watchlists)
			.values({
				name: watchlistData.name,
				description: watchlistData.description || null,
				isPublic: watchlistData.isPublic,
				userId: watchlistData.userId,
			})
			.returning();

		return result[0];
	}

	static async findById(id: number) {
		const result = await db
			.select()
			.from(watchlists)
			.where(eq(watchlists.id, id));
		return result[0];
	}

	static async findByUserId(userId: number) {
		const result = await db
			.select()
			.from(watchlists)
			.where(eq(watchlists.userId, userId));

		return result;
	}

	static async findPublic(params?: SearchInput) {
		const conditions = [eq(watchlists.isPublic, true)];

		if (params?.search) {
			conditions.push(like(watchlists.name, `%${params.search}%`));
		}

		const getWatchlistSortColumn = (sortBy?: string) => {
			switch (sortBy) {
				case 'name':
					return watchlists.name;
				case 'createdAt':
					return watchlists.createdAt;
				case 'updatedAt':
					return watchlists.updatedAt;
				default:
					return watchlists.updatedAt;
			}
		};

		const result = await db
			.select()
			.from(watchlists)
			.where(and(...conditions))
			.orderBy(
				params?.sortOrder === 'desc'
					? desc(getWatchlistSortColumn(params?.sortBy))
					: asc(getWatchlistSortColumn(params?.sortBy))
			)
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result;
	}

	static async update(id: number, watchlistData: Partial<WatchlistType>) {
		await db
			.update(watchlists)
			.set({
				...Object.fromEntries(
					Object.entries(watchlistData).filter(([key]) => key !== 'createdAt')
				),
				updatedAt: new Date(),
			})
			.where(eq(watchlists.id, id));
	}

	static async delete(id: number) {
		await db.delete(watchlistMovies).where(eq(watchlistMovies.watchlistId, id));
		await db.delete(watchlists).where(eq(watchlists.id, id));
	}

	static async addMovie(watchlistId: number, movieId: number) {
		const existingEntry = await db
			.select()
			.from(watchlistMovies)
			.where(
				and(
					eq(watchlistMovies.watchlistId, watchlistId),
					eq(watchlistMovies.movieId, movieId)
				)
			);

		if (existingEntry.length > 0) {
			return;
		}

		await db.insert(watchlistMovies).values({
			watchlistId,
			movieId,
		});

		await db
			.update(watchlists)
			.set({
				updatedAt: new Date(),
			})
			.where(eq(watchlists.id, watchlistId));
	}

	static async removeMovie(watchlistId: number, movieId: number) {
		await db
			.delete(watchlistMovies)
			.where(
				and(
					eq(watchlistMovies.watchlistId, watchlistId),
					eq(watchlistMovies.movieId, movieId)
				)
			);

		await db
			.update(watchlists)
			.set({
				updatedAt: new Date(),
			})
			.where(eq(watchlists.id, watchlistId));
	}

	static async getMovies(watchlistId: number, params?: SearchInput) {
		const conditions = [eq(watchlistMovies.watchlistId, watchlistId)];

		if (params?.search) {
			conditions.push(like(movies.title, `%${params.search}%`));
		}

		const getMovieSortColumn = (sortBy?: string) => {
			switch (sortBy) {
				case 'title':
					return movies.title;
				case 'releaseDate':
					return movies.releaseDate;
				case 'rating':
					return movies.rating;
				default:
					return movies.title;
			}
		};

		const result = await db
			.select({
				movie: movies,
			})
			.from(watchlistMovies)
			.innerJoin(movies, eq(watchlistMovies.movieId, movies.id))
			.where(and(...conditions))
			.orderBy(
				params?.sortOrder === 'desc'
					? desc(getMovieSortColumn(params?.sortBy))
					: asc(getMovieSortColumn(params?.sortBy))
			)
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result.map((r) => r.movie);
	}
}
