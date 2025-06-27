import express from 'express';
import { WatchlistController } from '../controllers/WatchlistController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router
	.route('/')
	.post(WatchlistController.createWatchlist)
	.get(WatchlistController.getUserWatchlists);

router.get('/public', WatchlistController.getPublicWatchlists);

router
	.route('/:id')
	.get(WatchlistController.getWatchlist)
	.put(WatchlistController.updateWatchlist)
	.delete(WatchlistController.deleteWatchlist);

router
	.route('/:id/movies')
	.get(WatchlistController.getWatchlistMovies)
	.post(WatchlistController.addMovieToWatchlist)
	.delete(WatchlistController.removeMovieFromWatchlist);

export default router;
