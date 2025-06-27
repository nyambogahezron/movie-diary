"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistService = void 0;
const Watchlist_1 = require("../helpers/Watchlist");
const Movie_1 = require("../helpers/Movie");
const errors_1 = require("../utils/errors");
class WatchlistService {
    static async createWatchlist(input, user) {
        try {
            return await Watchlist_1.Watchlist.create({
                name: input.name,
                description: input.description ?? undefined,
                isPublic: input.isPublic ?? false,
                userId: user.id,
            });
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('already exists')) {
                throw new errors_1.BadRequestError('A watchlist with this name already exists');
            }
            throw error;
        }
    }
    static async getWatchlists(user) {
        return Watchlist_1.Watchlist.findByUserId(user.id);
    }
    static async getWatchlist(id, user) {
        const watchlist = await Watchlist_1.Watchlist.findById(id);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id && !watchlist.isPublic) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this watchlist');
        }
        const movies = await Watchlist_1.Watchlist.getMovies(id);
        return {
            ...watchlist,
            movies,
        };
    }
    static async updateWatchlist(id, input, user) {
        const watchlist = await Watchlist_1.Watchlist.findById(id);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to update this watchlist');
        }
        await Watchlist_1.Watchlist.update(id, input);
        const updated = await Watchlist_1.Watchlist.findById(id);
        if (!updated) {
            throw new errors_1.NotFoundError('Updated watchlist not found');
        }
        return updated;
    }
    static async deleteWatchlist(id, user) {
        const watchlist = await Watchlist_1.Watchlist.findById(id);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to delete this watchlist');
        }
        await Watchlist_1.Watchlist.delete(id);
    }
    static async getPublicWatchlists(params) {
        return Watchlist_1.Watchlist.findPublic(params);
    }
    static async addMovieToWatchlist(watchlistId, movieId, user) {
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to modify this watchlist');
        }
        const movie = await Movie_1.Movie.findById(movieId);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        await Watchlist_1.Watchlist.addMovie(watchlistId, movieId);
    }
    static async removeMovieFromWatchlist(watchlistId, movieId, user) {
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to modify this watchlist');
        }
        await Watchlist_1.Watchlist.removeMovie(watchlistId, movieId);
    }
    static async getWatchlistMovies(watchlistId, user, params) {
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id && !watchlist.isPublic) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this watchlist');
        }
        return Watchlist_1.Watchlist.getMovies(watchlistId, params);
    }
}
exports.WatchlistService = WatchlistService;
//# sourceMappingURL=WatchlistService.js.map