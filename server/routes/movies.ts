import express from 'express';
import { MovieController } from '../controllers/MovieController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router
	.route('/')
	.post(MovieController.addMovie)
	.get(MovieController.getUserMovies);

router
	.route('/:id')
	.get(MovieController.getSingleMovie)
	.patch(MovieController.updateMovie)
	.delete(MovieController.deleteMovie);

export default router;
