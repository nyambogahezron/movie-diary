import { Request, Response } from 'express';
import { MovieReviewService } from '../services/MovieReviewService';
import AsyncHandler from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';

export class MovieReviewController {
	static addReview = AsyncHandler(async (req: Request, res: Response) => {
		const movieId = Number(req.params.movieId);

		if (isNaN(movieId)) {
			throw new BadRequestError('Invalid movie ID');
		}

		const { content, rating, isPublic } = req.body;

		if (!content) {
			throw new BadRequestError('Review content is required');
		}

		if (
			rating !== undefined &&
			(isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 10)
		) {
			throw new BadRequestError('Rating must be a number between 1 and 10');
		}

		const review = await MovieReviewService.addReview(
			movieId,
			{
				content,
				rating: rating ? Number(rating) : null,
				isPublic,
			},
			req.user!
		);

		res.status(201).json({
			message: 'Review added successfully',
			data: review,
		});
	});

	static getMovieReviews = AsyncHandler(async (req: Request, res: Response) => {
		const movieId = Number(req.params.movieId);
		if (isNaN(movieId)) {
			throw new BadRequestError('Invalid movie ID');
		}

		const reviews = await MovieReviewService.getReview(movieId);

		res.status(200).json({
			message: 'Reviews retrieved successfully',
			data: reviews,
		});
	});

	static updateReview = AsyncHandler(async (req: Request, res: Response) => {
		const reviewId = Number(req.params.id);
		if (isNaN(reviewId)) {
			throw new BadRequestError('Invalid review ID');
		}

		const existingReview = await MovieReviewService.findReviewById(reviewId);

		if (!existingReview) {
			throw new BadRequestError('Review not found');
		}

		if (existingReview.userId !== req.user?.id) {
			throw new BadRequestError(
				'You do not have permission to update this review'
			);
		}

		const content = req.body.content ?? existingReview.content;
		const rating = req.body.rating ?? existingReview.rating;
		const isPublic = req.body.isPublic ?? existingReview.isPublic;

		const review = await MovieReviewService.updateReview(reviewId, {
			content,
			rating,
			isPublic,
		});

		res.status(200).json({
			message: 'Review updated successfully',
			data: review,
		});
	});

	static deleteReview = AsyncHandler(async (req: Request, res: Response) => {
		const reviewId = Number(req.params.id);
		if (isNaN(reviewId)) {
			throw new BadRequestError('Invalid review ID');
		}

		await MovieReviewService.deleteReview(reviewId, req.user!);

		res.status(200).json({
			message: 'Review deleted successfully',
		});
	});

	static getUserReviews = AsyncHandler(async (req: Request, res: Response) => {
		const reviews = await MovieReviewService.getUserReviews(req.user!);

		res.status(200).json({
			message: 'User reviews retrieved successfully',
			data: reviews,
		});
	});
}
