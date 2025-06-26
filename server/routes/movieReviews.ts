import express from 'express';
import { MovieReviewController } from '../controllers/MovieReviewController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', MovieReviewController.getUserReviews);

router
	.route('/:id')
	.get(MovieReviewController.getReview)
	.patch(MovieReviewController.updateReview)
	.delete(MovieReviewController.deleteReview);

router
	.route('/movie/:movieId')
	.get(MovieReviewController.getMovieReviews)
	.post(MovieReviewController.addReview);

export default router;
