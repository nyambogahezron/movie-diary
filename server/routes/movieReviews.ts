import express from 'express';
import { MovieReviewController } from '../controllers/MovieReviewController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.route('/movie/:movieId').get(MovieReviewController.getMovieReviews);

router.use(authMiddleware);

router.get('/', MovieReviewController.getUserReviews);

router
	.route('/:id')
	.patch(MovieReviewController.updateReview)
	.delete(MovieReviewController.deleteReview);

router.route('/movie/:movieId').post(MovieReviewController.addReview);

export default router;
