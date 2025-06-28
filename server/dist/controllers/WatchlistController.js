"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistController = void 0;
const WatchlistService_1 = require("../services/WatchlistService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errors_1 = require("../utils/errors");
class WatchlistController {
}
exports.WatchlistController = WatchlistController;
_a = WatchlistController;
WatchlistController.createWatchlist = (0, asyncHandler_1.default)(async (req, res) => {
    const { name, description, isPublic } = req.body;
    if (!name) {
        throw new errors_1.BadRequestError('Watchlist name is required');
    }
    const watchlist = await WatchlistService_1.WatchlistService.createWatchlist({
        name,
        description,
        isPublic,
    }, req.user);
    res.status(201).json({
        message: 'Watchlist created successfully',
        data: watchlist,
    });
});
WatchlistController.getUserWatchlists = (0, asyncHandler_1.default)(async (req, res) => {
    const watchlists = await WatchlistService_1.WatchlistService.getWatchlists(req.user);
    res.status(200).json({
        message: 'Watchlists retrieved successfully',
        data: watchlists,
    });
});
WatchlistController.getPublicWatchlists = (0, asyncHandler_1.default)(async (req, res) => {
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
        searchParams.limit = Number(req.query.limit);
    }
    if (req.query.offset) {
        searchParams.offset = Number(req.query.offset);
    }
    const watchlists = await WatchlistService_1.WatchlistService.getPublicWatchlists(searchParams);
    res.status(200).json({
        message: 'Public watchlists retrieved successfully',
        data: watchlists,
    });
});
WatchlistController.getSingleWatchlist = (0, asyncHandler_1.default)(async (req, res) => {
    const watchlistId = Number(req.params.id);
    if (isNaN(watchlistId)) {
        throw new errors_1.BadRequestError('Invalid watchlist ID');
    }
    const watchlist = await WatchlistService_1.WatchlistService.getWatchlist(watchlistId, req.user);
    res.status(200).json({
        message: 'Watchlist retrieved successfully',
        data: watchlist,
    });
});
WatchlistController.updateWatchlist = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.BadRequestError('Authentication required');
    }
    const watchlistId = Number(req.params.id);
    if (isNaN(watchlistId)) {
        throw new errors_1.BadRequestError('Invalid watchlist ID');
    }
    const watchlist = await WatchlistService_1.WatchlistService.updateWatchlist(watchlistId, req.body, req.user);
    res.status(200).json({
        message: 'Watchlist updated successfully',
        data: watchlist,
    });
});
WatchlistController.deleteWatchlist = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.BadRequestError('Authentication required');
    }
    const watchlistId = Number(req.params.id);
    if (isNaN(watchlistId)) {
        throw new errors_1.BadRequestError('Invalid watchlist ID');
    }
    await WatchlistService_1.WatchlistService.deleteWatchlist(watchlistId, req.user);
    res.status(200).json({
        message: 'Watchlist deleted successfully',
    });
});
WatchlistController.addMovieToWatchlist = (0, asyncHandler_1.default)(async (req, res) => {
    const watchlistId = Number(req.params.id);
    const movieId = Number(req.params.movieId);
    if (isNaN(watchlistId) || isNaN(movieId)) {
        throw new errors_1.BadRequestError('Invalid watchlist ID or movie ID');
    }
    await WatchlistService_1.WatchlistService.addMovieToWatchlist(watchlistId, movieId, req.user);
    res.status(200).json({
        message: 'Movie added to watchlist successfully',
    });
});
WatchlistController.removeMovieFromWatchlist = (0, asyncHandler_1.default)(async (req, res) => {
    const watchlistId = Number(req.params.id);
    const movieId = Number(req.params.movieId);
    if (isNaN(watchlistId) || isNaN(movieId)) {
        throw new errors_1.BadRequestError('Invalid watchlist ID or movie ID');
    }
    await WatchlistService_1.WatchlistService.removeMovieFromWatchlist(watchlistId, movieId, req.user);
    res.status(200).json({
        message: 'Movie removed from watchlist successfully',
    });
});
WatchlistController.getWatchlistMovies = (0, asyncHandler_1.default)(async (req, res) => {
    const watchlistId = Number(req.params.id);
    if (isNaN(watchlistId)) {
        throw new errors_1.BadRequestError('Invalid watchlist ID');
    }
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
        searchParams.limit = Number(req.query.limit);
    }
    if (req.query.offset) {
        searchParams.offset = Number(req.query.offset);
    }
    const movies = await WatchlistService_1.WatchlistService.getWatchlistMovies(watchlistId, req.user, searchParams);
    res.status(200).json({
        message: 'Watchlist movies retrieved successfully',
        data: movies,
    });
});
//# sourceMappingURL=WatchlistController.js.map