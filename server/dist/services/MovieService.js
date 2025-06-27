"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieService = void 0;
const Movie_1 = require("../helpers/Movie");
const Favorite_1 = require("../helpers/Favorite");
const errors_1 = require("../utils/errors");
class MovieService {
    static async addMovie(input, user) {
        const existingMovie = await Movie_1.Movie.findByTmdbId(input.tmdbId, user.id);
        if (existingMovie) {
            await Movie_1.Movie.update(existingMovie.id, input);
            return Movie_1.Movie.findById(existingMovie.id);
        }
        return Movie_1.Movie.create({
            ...input,
            userId: user.id,
        });
    }
    static async updateMovie(id, input, user) {
        const movie = await Movie_1.Movie.findById(id);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        if (movie.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to update this movie');
        }
        await Movie_1.Movie.update(id, input);
        const updated = await Movie_1.Movie.findById(id);
        if (!updated) {
            throw new errors_1.NotFoundError('Updated movie not found');
        }
        return updated;
    }
    static async deleteMovie(id, user) {
        const movie = await Movie_1.Movie.findById(id);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        if (movie.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to delete this movie');
        }
        await Movie_1.Movie.delete(id);
    }
    static async getMovie(id, user) {
        const movie = await Movie_1.Movie.findById(id);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        if (movie.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this movie');
        }
        const isFavorite = await Favorite_1.Favorite.isFavorite(user.id, movie.id);
        return {
            ...movie,
            isFavorite,
        };
    }
    static async getUserMovies(user, params) {
        return Movie_1.Movie.findByUserId(user.id, params);
    }
    static async toggleFavorite(movieId, user) {
        const movie = await Movie_1.Movie.findById(movieId);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        if (movie.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to favorite this movie');
        }
        const existingFavorite = await Favorite_1.Favorite.findByUserIdAndMovieId(user.id, movieId);
        if (existingFavorite) {
            await Favorite_1.Favorite.delete(user.id, movieId);
            return { isFavorite: false };
        }
        else {
            await Favorite_1.Favorite.create({ userId: user.id, movieId });
            return { isFavorite: true };
        }
    }
    static async getFavorites(user, params) {
        let movies = await Favorite_1.Favorite.getFavoriteMoviesByUserId(user.id);
        if (params?.search) {
            const searchTerm = params.search.toLowerCase();
            movies = movies.filter((movie) => movie.title.toLowerCase().includes(searchTerm) ||
                (movie.overview && movie.overview.toLowerCase().includes(searchTerm)));
        }
        if (params?.sortBy) {
            const sortField = params.sortBy;
            const sortOrder = params?.sortOrder === 'desc' ? -1 : 1;
            movies.sort((a, b) => {
                const aVal = a[sortField] ?? '';
                const bVal = b[sortField] ?? '';
                if (aVal < bVal)
                    return -1 * sortOrder;
                if (aVal > bVal)
                    return 1 * sortOrder;
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
exports.MovieService = MovieService;
//# sourceMappingURL=MovieService.js.map