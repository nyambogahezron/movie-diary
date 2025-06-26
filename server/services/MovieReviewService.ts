import { MovieReview } from '../helpers/MovieReview';
import { Movie } from '../helpers/Movie';
import { MovieReviewInput, User } from '../types';
import {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} from '../utils/errors';

export class MovieReviewService {
	static async addReview(movieId: number, input: MovieReviewInput, user: User) {
		const movie = await Movie.findById(movieId);
		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		const existingReview = await MovieReview.findByUserAndMovie(
			user.id,
			movieId
		);
		if (existingReview) {
			throw new BadRequestError('You have already reviewed this movie');
		}

		return MovieReview.create({
			...input,
			userId: user.id,
			movieId,
		});
	}

	static async updateReview(id: number, input: Partial<MovieReviewInput>) {
		await MovieReview.update(id, input);

		const updated = await MovieReview.findById(id);
		if (!updated) {
			throw new NotFoundError('Updated review not found');
		}

		return updated;
	}

	static async deleteReview(id: number, user: User) {
		const review = await MovieReview.findById(id);

		if (!review) {
			throw new NotFoundError('Review not found');
		}

		if (review.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to delete this review'
			);
		}

		await MovieReview.delete(id);
	}

	static async getReview(id: number) {
		const review = await MovieReview.findByMovieId(id);

		if (!review) {
			throw new NotFoundError('Review not found');
		}

		return review;
	}

	static async getUserReviews(user: User) {
		return MovieReview.findByUserId(user.id);
	}

	static async getMovieReviews(userId: number, movieId: number) {
		const reviews = await MovieReview.findByUserAndMovie(userId, movieId);

		if (!reviews) {
			throw new NotFoundError('unauthorized or no reviews found');
		}
		return reviews;
	}

	static async findReviewById(id: number) {
		const review = await MovieReview.findById(id);

		if (!review) {
			throw new NotFoundError('Review not found');
		}

		return review;
	}
}
