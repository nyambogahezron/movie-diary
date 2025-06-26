import { Movie } from '../helpers/Movie';
import { Favorite } from '../helpers/Favorite';
import { Movie as MovieType, MovieInput, User, SearchInput } from '../types';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export class MovieService {
	static async addMovie(input: MovieInput, user: User) {
		const existingMovie = await Movie.findByTmdbId(input.tmdbId, user.id);

		if (existingMovie) {
			await Movie.update(existingMovie.id, input);
			return Movie.findById(existingMovie.id);
		}

		return Movie.create({
			...input,
			userId: user.id,
		});
	}

	static async updateMovie(id: number, input: Partial<MovieInput>, user: User) {
		const movie = await Movie.findById(id);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		if (movie.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to update this movie'
			);
		}

		await Movie.update(id, input);

		const updated = await Movie.findById(id);

		if (!updated) {
			throw new NotFoundError('Updated movie not found');
		}

		return updated;
	}

	static async deleteMovie(id: number, user: User) {
		const movie = await Movie.findById(id);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		if (movie.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to delete this movie'
			);
		}

		await Movie.delete(id);
	}

	static async getMovie(id: number, user: User) {
		const movie = await Movie.findById(id);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		if (movie.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to view this movie'
			);
		}

		const isFavorite = await Favorite.isFavorite(user.id, movie.id);

		return {
			...movie,
			isFavorite,
		};
	}

	static async getUserMovies(user: User, params?: SearchInput) {
		return Movie.findByUserId(user.id, params);
	}

	static async toggleFavorite(movieId: number, user: User) {
		const movie = await Movie.findById(movieId);

		if (!movie) {
			throw new NotFoundError('Movie not found');
		}

		if (movie.userId !== user.id) {
			throw new UnauthorizedError(
				'You do not have permission to favorite this movie'
			);
		}

		const existingFavorite = await Favorite.findByUserIdAndMovieId(
			user.id,
			movieId
		);

		if (existingFavorite) {
			await Favorite.delete(user.id, movieId);
			return { isFavorite: false };
		} else {
			await Favorite.create({ userId: user.id, movieId });
			return { isFavorite: true };
		}
	}

	static async getFavorites(user: User, params?: SearchInput) {
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
				const aVal = a[sortField] ?? '';
				const bVal = b[sortField] ?? '';

				if (aVal < bVal) return -1 * sortOrder;
				if (aVal > bVal) return 1 * sortOrder;
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
}
