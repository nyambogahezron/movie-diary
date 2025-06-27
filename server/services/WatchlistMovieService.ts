import { WatchlistMovie } from '../helpers/WatchlistMovie';
import { Watchlist } from '../helpers/Watchlist';
import { Movie } from '../helpers/Movie';
import {
	WatchlistMovie as WatchlistMovieType,
	Movie as MovieType,
	User,
	SearchInput,
} from '../types';
import {
	UnauthorizedError,
	NotFoundError,
	BadRequestError,
} from '../utils/errors';

export class WatchlistMovieService {
	static async addMovieToWatchlist(
		watchlistId: number,
		movieId: number,
		user: User
	) {
		const watchlist = await Watchlist.findById(watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to modify this watchlist'
			);
		}

		const movie = await Movie.findById(movieId);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		try {
			return await WatchlistMovie.create({
				watchlistId,
				movieId,
			});
		} catch (error) {
			if (
				error instanceof Error &&
				error.message.includes('already in the watchlist')
			) {
				throw new BadRequestError('Movie is already in the watchlist');
			}
			throw error;
		}
	}

	static async removeMovieFromWatchlist(
		watchlistId: number,
		movieId: number,
		user: User
	) {
		const watchlist = await Watchlist.findById(watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to modify this watchlist'
			);
		}

		const watchlistMovie = await WatchlistMovie.findByWatchlistIdAndMovieId(
			watchlistId,
			movieId
		);

		if (!watchlistMovie) {
			throw new NotFoundError('Movie is not in the watchlist');
		}

		await WatchlistMovie.deleteByWatchlistIdAndMovieId(watchlistId, movieId);
	}

	static async getWatchlistMovies(
		watchlistId: number,
		user: User,
		params?: SearchInput
	): Promise<MovieType[]> {
		const watchlist = await Watchlist.findById(watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id && !watchlist.isPublic) {
			throw new UnauthorizedError(
				'You do not have permission to view this watchlist'
			);
		}

		return WatchlistMovie.getMoviesByWatchlistId(watchlistId, params);
	}

	static async getWatchlistMovieEntries(
		watchlistId: number,
		user: User,
		params?: SearchInput
	): Promise<WatchlistMovieType[]> {
		const watchlist = await Watchlist.findById(watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id && !watchlist.isPublic) {
			throw new UnauthorizedError(
				'You do not have permission to view this watchlist'
			);
		}

		return WatchlistMovie.findByWatchlistId(watchlistId, params);
	}

	static async getWatchlistMovie(id: number, user: User) {
		const watchlistMovie = await WatchlistMovie.findById(id);

		if (!watchlistMovie) {
			throw new NotFoundError('Watchlist movie entry not found');
		}

		const watchlist = await Watchlist.findById(watchlistMovie.watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id && !watchlist.isPublic) {
			throw new UnauthorizedError(
				'You do not have permission to view this watchlist'
			);
		}

		return watchlistMovie;
	}

	static async deleteWatchlistMovie(id: number, user: User) {
		const watchlistMovie = await WatchlistMovie.findById(id);

		if (!watchlistMovie) {
			throw new NotFoundError('Watchlist movie entry not found');
		}

		const watchlist = await Watchlist.findById(watchlistMovie.watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to modify this watchlist'
			);
		}

		await WatchlistMovie.delete(id);
	}
}
