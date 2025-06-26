import { db } from '../db';
import { movies } from '../db/schema';
import { eq, like, desc, asc, and } from 'drizzle-orm';
import { Movie as MovieType, MovieInput, SearchInput } from '../types';
import { BadRequestError } from '../utils/errors';

export class Movie {
	static async create(
		movieData: MovieInput & { userId: number }
	): Promise<MovieType> {
		const genresJson = movieData.genres
			? JSON.stringify(movieData.genres)
			: null;

		if (
			movieData.rating !== undefined &&
			movieData.rating !== null &&
			(movieData.rating < 0 || movieData.rating > 10)
		) {
			throw new Error('Rating must be between 0 and 10');
		}

		const result = await db
			.insert(movies)
			.values({
				title: movieData.title,
				tmdbId: movieData.tmdbId,
				posterPath: movieData.posterPath || null,
				releaseDate: movieData.releaseDate || null,
				overview: movieData.overview || null,
				rating: movieData.rating || null,
				watchDate: movieData.watchDate || null,
				review: movieData.review || null,
				genres: genresJson,
				userId: movieData.userId,
			})
			.returning();

		return result[0];
	}

	static async findById(id: number): Promise<MovieType | undefined> {
		const result = await db.select().from(movies).where(eq(movies.id, id));
		return result[0];
	}

	static async findByTmdbId(
		tmdbId: string,
		userId: number
	): Promise<MovieType | undefined> {
		const result = await db
			.select()
			.from(movies)
			.where(and(eq(movies.tmdbId, tmdbId), eq(movies.userId, userId)));
		return result[0];
	}

	static async findByUserId(
		userId: number,
		params?: SearchInput
	): Promise<MovieType[]> {
		const conditions = [];
		conditions.push(eq(movies.userId, userId));

		if (params?.search) {
			conditions.push(like(movies.title, `%${params.search}%`));
		}

		let orderByColumn: any = movies.createdAt;
		let orderByDirection: 'asc' | 'desc' = 'desc';

		if (params?.sortBy && params.sortBy in movies) {
			const column = movies[params.sortBy as keyof typeof movies];
			if (column && typeof column !== 'function') {
				orderByColumn = column;
				orderByDirection = params?.sortOrder === 'desc' ? 'desc' : 'asc';
			}
		}

		const result = await db
			.select()
			.from(movies)
			.where(and(...conditions))
			.orderBy(
				orderByDirection === 'desc' ? desc(orderByColumn) : asc(orderByColumn)
			)
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result;
	}

	static async update(id: number, movieData: Partial<MovieInput>) {
		const existingMovie = await this.findById(id);
		if (!existingMovie) {
			throw new BadRequestError(`Movie with ID ${id} not found`);
		}

		const title = movieData.title || existingMovie.title;
		const tmdbId = movieData.tmdbId || existingMovie.tmdbId;
		const posterPath = movieData.posterPath || existingMovie.posterPath;
		const releaseDate = movieData.releaseDate || existingMovie.releaseDate;
		const overview = movieData.overview || existingMovie.overview;
		const rating = movieData.rating ?? existingMovie.rating;
		const watchDate = movieData.watchDate || existingMovie.watchDate;
		const review = movieData.review || existingMovie.review;
		const genres =
			movieData.genres !== undefined
				? movieData.genres
					? JSON.stringify(movieData.genres)
					: null
				: existingMovie.genres;

		const dataToUpdate = {
			title,
			tmdbId,
			posterPath,
			releaseDate,
			overview,
			rating,
			watchDate,
			review,
			genres,
		};

		await db.update(movies).set(dataToUpdate).where(eq(movies.id, id));
	}

	static async delete(id: number) {
		await db.delete(movies).where(eq(movies.id, id));
	}
}
