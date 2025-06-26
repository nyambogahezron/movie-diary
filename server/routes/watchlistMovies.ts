import express from 'express';
import { WatchlistMovieController } from '../controllers/WatchlistMovieController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router
	.route('/:id')
	.get(WatchlistMovieController.getWatchlistMovie)
	.delete(WatchlistMovieController.deleteWatchlistMovie);

router
	.route('/watchlists/:watchlistId/movies')
	.get(WatchlistMovieController.getWatchlistMovies)
	.post(WatchlistMovieController.addMovieToWatchlist);

router.get(
	'/watchlists/:watchlistId/entries',
	WatchlistMovieController.getWatchlistMovieEntries
);
router.delete(
	'/watchlists/:watchlistId/movies/:movieId',
	WatchlistMovieController.removeMovieFromWatchlist
);

export default router;
