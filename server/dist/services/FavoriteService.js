"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteService = void 0;
const errors_1 = require("../utils/errors");
const Favorite_1 = require("../helpers/Favorite");
const Movie_1 = require("../helpers/Movie");
class FavoriteService {
    static async addFavorite(movieId, user) {
        const movie = await Movie_1.Movie.findById(movieId);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        const existingFavorite = await Favorite_1.Favorite.findByUserIdAndMovieId(user.id, movieId);
        if (existingFavorite) {
            throw new errors_1.BadRequestError('Movie is already in favorites');
        }
        return await Favorite_1.Favorite.create({
            userId: user.id,
            movieId,
        });
    }
    static async removeFavorite(movieId, user) {
        const movie = await Movie_1.Movie.findById(movieId);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        const favorite = await Favorite_1.Favorite.findByUserIdAndMovieId(user.id, movieId);
        if (!favorite) {
            throw new errors_1.NotFoundError('Movie is not in favorites');
        }
        await Favorite_1.Favorite.delete(user.id, movieId);
    }
    static async getFavoriteMovies(user, params) {
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
                const aValue = a[sortField] ?? '';
                const bValue = b[sortField] ?? '';
                if (aValue < bValue)
                    return -1 * sortOrder;
                if (aValue > bValue)
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
    static async isFavorite(movieId, user) {
        const movie = await Movie_1.Movie.findById(movieId);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        return Favorite_1.Favorite.isFavorite(user.id, movieId);
    }
}
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=FavoriteService.js.map