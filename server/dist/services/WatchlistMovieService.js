"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistMovieService = void 0;
const WatchlistMovie_1 = require("../helpers/WatchlistMovie");
const Watchlist_1 = require("../helpers/Watchlist");
const Movie_1 = require("../helpers/Movie");
const errors_1 = require("../utils/errors");
class WatchlistMovieService {
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
        try {
            return await WatchlistMovie_1.WatchlistMovie.create({
                watchlistId,
                movieId,
            });
        }
        catch (error) {
            if (error instanceof Error &&
                error.message.includes('already in the watchlist')) {
                throw new errors_1.BadRequestError('Movie is already in the watchlist');
            }
            throw error;
        }
    }
    static async removeMovieFromWatchlist(watchlistId, movieId, user) {
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to modify this watchlist');
        }
        const watchlistMovie = await WatchlistMovie_1.WatchlistMovie.findByWatchlistIdAndMovieId(watchlistId, movieId);
        if (!watchlistMovie) {
            throw new errors_1.NotFoundError('Movie is not in the watchlist');
        }
        await WatchlistMovie_1.WatchlistMovie.deleteByWatchlistIdAndMovieId(watchlistId, movieId);
    }
    static async getWatchlistMovies(watchlistId, user, params) {
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id && !watchlist.isPublic) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this watchlist');
        }
        return WatchlistMovie_1.WatchlistMovie.getMoviesByWatchlistId(watchlistId, params);
    }
    static async getWatchlistMovieEntries(watchlistId, user, params) {
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id && !watchlist.isPublic) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this watchlist');
        }
        return WatchlistMovie_1.WatchlistMovie.findByWatchlistId(watchlistId, params);
    }
    static async getWatchlistMovie(id, user) {
        const watchlistMovie = await WatchlistMovie_1.WatchlistMovie.findById(id);
        if (!watchlistMovie) {
            throw new errors_1.NotFoundError('Watchlist movie entry not found');
        }
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistMovie.watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id && !watchlist.isPublic) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this watchlist');
        }
        return watchlistMovie;
    }
    static async deleteWatchlistMovie(id, user) {
        const watchlistMovie = await WatchlistMovie_1.WatchlistMovie.findById(id);
        if (!watchlistMovie) {
            throw new errors_1.NotFoundError('Watchlist movie entry not found');
        }
        const watchlist = await Watchlist_1.Watchlist.findById(watchlistMovie.watchlistId);
        if (!watchlist) {
            throw new errors_1.NotFoundError('Watchlist not found');
        }
        if (watchlist.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to modify this watchlist');
        }
        await WatchlistMovie_1.WatchlistMovie.delete(id);
    }
}
exports.WatchlistMovieService = WatchlistMovieService;
//# sourceMappingURL=WatchlistMovieService.js.map