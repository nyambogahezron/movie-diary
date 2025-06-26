import { db } from '../db';
import { movieReviews, movies } from '../db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { MovieReviewInput } from '../types';

export class MovieReview {
	static async create(
		data: MovieReviewInput & { userId: number; movieId: number }
	) {
		const { userId, movieId, content, rating, isPublic = true } = data;

		const newReview = await db
			.insert(movieReviews)
			.values({
				userId,
				movieId,
				content,
				rating,
				isPublic,
			})
			.returning();

		return newReview;
	}

	static async findById(id: number) {
		const review = await db
			.select()
			.from(movieReviews)
			.where(eq(movieReviews.id, id))
			.get();
		return review;
	}

	static async findByMovieId(movieId: number) {
		const reviews = await db
			.select()
			.from(movieReviews)
			.where(eq(movieReviews.movieId, movieId))
			.orderBy(desc(movieReviews.createdAt))
			.all();

		return reviews;
	}

	static async findPublicByMovieId(movieId: number) {
		const reviews = await db
			.select()
			.from(movieReviews)
			.where(
				and(eq(movieReviews.movieId, movieId), eq(movieReviews.isPublic, true))
			)
			.orderBy(desc(movieReviews.createdAt))
			.all();

		return reviews;
	}

	static async findByUserAndMovie(userId: number, movieId: number) {
		const review = await db
			.select()
			.from(movieReviews)
			.where(
				and(eq(movieReviews.userId, userId), eq(movieReviews.movieId, movieId))
			)
			.get();

		return review;
	}

	static async findByUserId(userId: number) {
		const reviews = await db
			.select()
			.from(movieReviews)
			.where(eq(movieReviews.userId, userId))
			.orderBy(desc(movieReviews.createdAt))
			.all();

		return reviews;
	}

	static async update(id: number, data: Partial<MovieReviewInput>) {
		await db
			.update(movieReviews)
			.set({
				...data,
				updatedAt: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(movieReviews.id, id))
			.run();
	}

	static async delete(id: number) {
		await db.delete(movieReviews).where(eq(movieReviews.id, id)).run();
	}
}
