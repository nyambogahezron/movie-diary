import express from 'express';
import { MovieReviewController } from '../controllers/MovieReviewController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, MovieReviewController.getUserReviews);

router
	.route('/:id')
	.patch(authMiddleware, MovieReviewController.updateReview)
	.delete(authMiddleware, MovieReviewController.deleteReview);

router
	.route('/movie/:movieId')
	.get(MovieReviewController.getMovieReviews)
	.post(authMiddleware, MovieReviewController.addReview);

export default router;
