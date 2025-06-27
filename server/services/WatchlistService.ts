import { Watchlist } from '../helpers/Watchlist';
import { Movie } from '../helpers/Movie';
import {
	Watchlist as WatchlistType,
	WatchlistInput,
	Movie as MovieType,
	User,
	SearchInput,
} from '../types';
import {
	UnauthorizedError,
	NotFoundError,
	BadRequestError,
} from '../utils/errors';

export class WatchlistService {
	static async createWatchlist(input: WatchlistInput, user: User) {
		try {
			return await Watchlist.create({
				name: input.name,
				description: input.description ?? undefined,
				isPublic: input.isPublic ?? false,
				userId: user.id,
			});
		} catch (error) {
			if (error instanceof Error && error.message.includes('already exists')) {
				throw new BadRequestError('A watchlist with this name already exists');
			}
			throw error;
		}
	}

	static async getWatchlists(user: User) {
		return Watchlist.findByUserId(user.id);
	}

	static async getWatchlist(id: number, user: User) {
		const watchlist = await Watchlist.findById(id);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id && !watchlist.isPublic) {
			throw new UnauthorizedError(
				'You do not have permission to view this watchlist'
			);
		}

		const movies = await Watchlist.getMovies(id);

		return {
			...watchlist,
			movies,
		};
	}

	static async updateWatchlist(
		id: number,
		input: Partial<WatchlistType>,
		user: User
	) {
		const watchlist = await Watchlist.findById(id);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to update this watchlist'
			);
		}

		await Watchlist.update(id, input);

		const updated = await Watchlist.findById(id);
		if (!updated) {
			throw new NotFoundError('Updated watchlist not found');
		}

		return updated;
	}

	static async deleteWatchlist(id: number, user: User) {
		const watchlist = await Watchlist.findById(id);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to delete this watchlist'
			);
		}

		await Watchlist.delete(id);
	}

	static async getPublicWatchlists(params?: SearchInput) {
		return Watchlist.findPublic(params);
	}

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

		await Watchlist.addMovie(watchlistId, movieId);
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

		await Watchlist.removeMovie(watchlistId, movieId);
	}

	static async getWatchlistMovies(
		watchlistId: number,
		user: User,
		params?: SearchInput
	) {
		const watchlist = await Watchlist.findById(watchlistId);

		if (!watchlist) {
			throw new NotFoundError('Watchlist not found');
		}

		if (watchlist.userId !== user.id && !watchlist.isPublic) {
			throw new UnauthorizedError(
				'You do not have permission to view this watchlist'
			);
		}

		return Watchlist.getMovies(watchlistId, params);
	}
}
