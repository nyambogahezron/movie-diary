"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistMovieController = void 0;
const WatchlistMovieService_1 = require("../services/WatchlistMovieService");
class WatchlistMovieController {
    static async addMovieToWatchlist(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const watchlistId = parseInt(req.params.watchlistId, 10);
            const { movieId } = req.body;
            if (isNaN(watchlistId)) {
                res.status(400).json({ error: 'Invalid watchlist ID' });
                return;
            }
            if (!movieId || isNaN(parseInt(movieId, 10))) {
                res.status(400).json({ error: 'Valid movie ID is required' });
                return;
            }
            try {
                const watchlistMovie = await WatchlistMovieService_1.WatchlistMovieService.addMovieToWatchlist(watchlistId, parseInt(movieId, 10), req.user);
                res.status(201).json({
                    message: 'Movie added to watchlist successfully',
                    data: watchlistMovie,
                });
            }
            catch (error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: error.message });
                    return;
                }
                if (error.name === 'AuthorizationError') {
                    res.status(403).json({ error: error.message });
                    return;
                }
                if (error.name === 'ConflictError') {
                    res.status(409).json({ error: error.message });
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error adding movie to watchlist:', error);
            res
                .status(500)
                .json({ error: 'An error occurred while adding movie to watchlist' });
        }
    }
    // Get all movies in a watchlist
    static async getWatchlistMovies(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const watchlistId = parseInt(req.params.watchlistId, 10);
            if (isNaN(watchlistId)) {
                res.status(400).json({ error: 'Invalid watchlist ID' });
                return;
            }
            // Parse search, sort and pagination parameters
            const searchParams = {};
            if (req.query.search) {
                searchParams.search = req.query.search;
            }
            if (req.query.sortBy) {
                searchParams.sortBy = req.query.sortBy;
            }
            if (req.query.sortOrder) {
                searchParams.sortOrder = req.query.sortOrder;
            }
            if (req.query.limit) {
                searchParams.limit = parseInt(req.query.limit, 10);
            }
            if (req.query.offset) {
                searchParams.offset = parseInt(req.query.offset, 10);
            }
            try {
                const movies = await WatchlistMovieService_1.WatchlistMovieService.getWatchlistMovies(watchlistId, req.user, searchParams);
                res.status(200).json({
                    message: 'Watchlist movies retrieved successfully',
                    data: movies,
                });
            }
            catch (error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: error.message });
                    return;
                }
                if (error.name === 'AuthorizationError') {
                    res.status(403).json({ error: error.message });
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error getting watchlist movies:', error);
            res
                .status(500)
                .json({ error: 'An error occurred while retrieving watchlist movies' });
        }
    }
    // Get all watchlist-movie entries in a watchlist
    static async getWatchlistMovieEntries(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const watchlistId = parseInt(req.params.watchlistId, 10);
            if (isNaN(watchlistId)) {
                res.status(400).json({ error: 'Invalid watchlist ID' });
                return;
            }
            // Parse sort and pagination parameters
            const searchParams = {};
            if (req.query.sortBy) {
                searchParams.sortBy = req.query.sortBy;
            }
            if (req.query.sortOrder) {
                searchParams.sortOrder = req.query.sortOrder;
            }
            if (req.query.limit) {
                searchParams.limit = parseInt(req.query.limit, 10);
            }
            if (req.query.offset) {
                searchParams.offset = parseInt(req.query.offset, 10);
            }
            try {
                const entries = await WatchlistMovieService_1.WatchlistMovieService.getWatchlistMovieEntries(watchlistId, req.user, searchParams);
                res.status(200).json({
                    message: 'Watchlist movie entries retrieved successfully',
                    data: entries,
                });
            }
            catch (error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: error.message });
                    return;
                }
                if (error.name === 'AuthorizationError') {
                    res.status(403).json({ error: error.message });
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error getting watchlist movie entries:', error);
            res.status(500).json({
                error: 'An error occurred while retrieving watchlist movie entries',
            });
        }
    }
    // Get a specific watchlist-movie entry
    static async getWatchlistMovie(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid watchlist movie ID' });
                return;
            }
            try {
                const watchlistMovie = await WatchlistMovieService_1.WatchlistMovieService.getWatchlistMovie(id, req.user);
                res.status(200).json({
                    message: 'Watchlist movie entry retrieved successfully',
                    data: watchlistMovie,
                });
            }
            catch (error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: error.message });
                    return;
                }
                if (error.name === 'AuthorizationError') {
                    res.status(403).json({ error: error.message });
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error getting watchlist movie entry:', error);
            res.status(500).json({
                error: 'An error occurred while retrieving watchlist movie entry',
            });
        }
    }
    // Remove a movie from a watchlist
    static async removeMovieFromWatchlist(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const watchlistId = parseInt(req.params.watchlistId, 10);
            const movieId = parseInt(req.params.movieId, 10);
            if (isNaN(watchlistId)) {
                res.status(400).json({ error: 'Invalid watchlist ID' });
                return;
            }
            if (isNaN(movieId)) {
                res.status(400).json({ error: 'Invalid movie ID' });
                return;
            }
            try {
                await WatchlistMovieService_1.WatchlistMovieService.removeMovieFromWatchlist(watchlistId, movieId, req.user);
                res.status(200).json({
                    message: 'Movie removed from watchlist successfully',
                });
            }
            catch (error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: error.message });
                    return;
                }
                if (error.name === 'AuthorizationError') {
                    res.status(403).json({ error: error.message });
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error removing movie from watchlist:', error);
            res.status(500).json({
                error: 'An error occurred while removing movie from watchlist',
            });
        }
    }
    // Delete a specific watchlist-movie entry
    static async deleteWatchlistMovie(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                res.status(400).json({ error: 'Invalid watchlist movie ID' });
                return;
            }
            try {
                await WatchlistMovieService_1.WatchlistMovieService.deleteWatchlistMovie(id, req.user);
                res.status(200).json({
                    message: 'Watchlist movie entry deleted successfully',
                });
            }
            catch (error) {
                if (error.name === 'NotFoundError') {
                    res.status(404).json({ error: error.message });
                    return;
                }
                if (error.name === 'AuthorizationError') {
                    res.status(403).json({ error: error.message });
                    return;
                }
                throw error;
            }
        }
        catch (error) {
            console.error('Error deleting watchlist movie entry:', error);
            res.status(500).json({
                error: 'An error occurred while deleting watchlist movie entry',
            });
        }
    }
}
exports.WatchlistMovieController = WatchlistMovieController;
//# sourceMappingURL=WatchlistMovieController.js.map