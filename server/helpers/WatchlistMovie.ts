import { db } from '../db';
import { watchlistMovies, watchlists, movies } from '../db/schema';
import { eq, and, asc, desc, like } from 'drizzle-orm';
import {
	WatchlistMovie as WatchlistMovieType,
	Movie as MovieType,
} from '../types';
import { SearchInput } from '../types';
import { BadRequestError } from '../utils/errors';

export class WatchlistMovie {
	static async create(data: { watchlistId: number; movieId: number }) {
		const existingEntry = await db
			.select()
			.from(watchlistMovies)
			.where(
				and(
					eq(watchlistMovies.watchlistId, data.watchlistId),
					eq(watchlistMovies.movieId, data.movieId)
				)
			);

		if (existingEntry.length > 0) {
			throw new BadRequestError('Movie is already in the watchlist');
		}

		const result = await db
			.insert(watchlistMovies)
			.values({
				watchlistId: data.watchlistId,
				movieId: data.movieId,
			})
			.returning();

		await db
			.update(watchlists)
			.set({
				updatedAt: new Date().toISOString(),
			})
			.where(eq(watchlists.id, data.watchlistId));

		return result[0];
	}

	static async findById(id: number) {
		const result = await db
			.select()
			.from(watchlistMovies)
			.where(eq(watchlistMovies.id, id));

		return result[0];
	}

	static async findByWatchlistId(
		watchlistId: number,
		params?: SearchInput
	): Promise<WatchlistMovieType[]> {
		const conditions = [eq(watchlistMovies.watchlistId, watchlistId)];

		const getSortColumn = (sortBy?: string) => {
			switch (sortBy) {
				case 'createdAt':
					return watchlistMovies.createdAt;
				default:
					return watchlistMovies.createdAt;
			}
		};

		const result = await db
			.select()
			.from(watchlistMovies)
			.where(and(...conditions))
			.orderBy(
				params?.sortOrder === 'desc'
					? desc(getSortColumn(params?.sortBy))
					: asc(getSortColumn(params?.sortBy))
			)
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result;
	}

	static async findByMovieId(movieId: number): Promise<WatchlistMovieType[]> {
		const result = await db
			.select()
			.from(watchlistMovies)
			.where(eq(watchlistMovies.movieId, movieId));

		return result;
	}

	static async findByWatchlistIdAndMovieId(
		watchlistId: number,
		movieId: number
	) {
		const result = await db
			.select()
			.from(watchlistMovies)
			.where(
				and(
					eq(watchlistMovies.watchlistId, watchlistId),
					eq(watchlistMovies.movieId, movieId)
				)
			);

		return result[0];
	}

	static async getMoviesByWatchlistId(
		watchlistId: number,
		params?: SearchInput
	) {
		const conditions = [eq(watchlistMovies.watchlistId, watchlistId)];

		if (params?.search) {
			conditions.push(like(movies.title, `%${params.search}%`));
		}

		const getSortColumn = (sortBy?: string) => {
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
					? desc(getSortColumn(params?.sortBy))
					: asc(getSortColumn(params?.sortBy))
			)
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result.map((r) => r.movie) as unknown as MovieType[];
	}

	static async delete(id: number) {
		const entry = await this.findById(id);
		if (!entry) {
			throw new BadRequestError('WatchlistMovie not found');
		}

		await db.delete(watchlistMovies).where(eq(watchlistMovies.id, id));

		await db
			.update(watchlists)
			.set({
				updatedAt: new Date().toISOString(),
			})
			.where(eq(watchlists.id, entry.watchlistId));
	}

	static async deleteByWatchlistIdAndMovieId(
		watchlistId: number,
		movieId: number
	) {
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
				updatedAt: new Date().toISOString(),
			})
			.where(eq(watchlists.id, watchlistId));
	}

	static async deleteAllByWatchlistId(watchlistId: number) {
		await db
			.delete(watchlistMovies)
			.where(eq(watchlistMovies.watchlistId, watchlistId));

		await db
			.update(watchlists)
			.set({
				updatedAt: new Date().toISOString(),
			})
			.where(eq(watchlists.id, watchlistId));
	}

	static async deleteAllByMovieId(movieId: number) {
		const entries = await this.findByMovieId(movieId);
		const watchlistIds = [
			...new Set(entries.map((entry) => entry.watchlistId)),
		];

		await db
			.delete(watchlistMovies)
			.where(eq(watchlistMovies.movieId, movieId));

		for (const watchlistId of watchlistIds) {
			await db
				.update(watchlists)
				.set({
					updatedAt: new Date().toISOString(),
				})
				.where(eq(watchlists.id, watchlistId));
		}
	}
}
