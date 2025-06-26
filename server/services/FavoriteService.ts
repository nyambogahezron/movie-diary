import { BadRequestError, NotFoundError } from '../utils/errors';
import { Favorite } from '../helpers/Favorite';
import { Movie } from '../helpers/Movie';
import {
	Favorite as FavoriteType,
	Movie as MovieType,
	User,
	SearchInput,
} from '../types';

export class FavoriteService {
	static async addFavorite(movieId: number, user: User) {
		const movie = await Movie.findById(movieId);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		const existingFavorite = await Favorite.findByUserIdAndMovieId(
			user.id,
			movieId
		);

		if (existingFavorite) {
			throw new BadRequestError('Movie is already in favorites');
		}

		return await Favorite.create({
			userId: user.id,
			movieId,
		});
	}

	static async removeFavorite(movieId: number, user: User) {
		const movie = await Movie.findById(movieId);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		const favorite = await Favorite.findByUserIdAndMovieId(user.id, movieId);

		if (!favorite) {
			throw new NotFoundError('Movie is not in favorites');
		}

		await Favorite.delete(user.id, movieId);
	}

	static async getFavoriteMovies(user: User, params?: SearchInput) {
		let movies = await Favorite.getFavoriteMoviesByUserId(user.id);

		if (params?.search) {
			const searchTerm = params.search.toLowerCase();
			movies = movies.filter(
				(movie) =>
					movie.title.toLowerCase().includes(searchTerm) ||
					(movie.overview && movie.overview.toLowerCase().includes(searchTerm))
			);
		}

		if (params?.sortBy) {
			const sortField = params.sortBy as keyof MovieType;
			const sortOrder = params?.sortOrder === 'desc' ? -1 : 1;

			movies.sort((a, b) => {
				const aValue = a[sortField] ?? '';
				const bValue = b[sortField] ?? '';
				if (aValue < bValue) return -1 * sortOrder;
				if (aValue > bValue) return 1 * sortOrder;
				return 0;
			});
		}

		if (params?.offset !== undefined || params?.limit !== undefined) {
			const offset = params?.offset || 0;
			const limit = params?.limit || movies.length;
			movies = movies.slice(offset, offset + limit);
		}

		return movies;
	}

	static async isFavorite(movieId: number, user: User) {
		const movie = await Movie.findById(movieId);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		return Favorite.isFavorite(user.id, movieId);
	}
}
