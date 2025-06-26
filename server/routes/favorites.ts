import express from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router
	.route('/')
	.post(FavoriteController.addFavorite)
	.get(FavoriteController.getFavorites);

router.delete('/:movieId', FavoriteController.removeFavorite);

router.get('/:movieId/status', FavoriteController.checkFavorite);

export default router;
