"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteController = void 0;
const FavoriteService_1 = require("../services/FavoriteService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errors_1 = require("../utils/errors");
class FavoriteController {
}
exports.FavoriteController = FavoriteController;
_a = FavoriteController;
FavoriteController.addFavorite = (0, asyncHandler_1.default)(async (req, res) => {
    const { movieId } = req.body;
    if (!movieId || isNaN(parseInt(movieId, 10))) {
        throw new errors_1.BadRequestError('Movie ID is required and must be a number');
    }
    const favorite = await FavoriteService_1.FavoriteService.addFavorite(parseInt(movieId, 10), req.user);
    res.status(201).json({
        message: 'Movie added to favorites successfully',
        data: favorite,
    });
});
FavoriteController.getFavorites = (0, asyncHandler_1.default)(async (req, res) => {
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
    const movies = await FavoriteService_1.FavoriteService.getFavoriteMovies(req.user, searchParams);
    res.status(200).json({
        message: 'Favorite movies retrieved successfully',
        data: movies,
    });
});
FavoriteController.removeFavorite = (0, asyncHandler_1.default)(async (req, res) => {
    const movieId = parseInt(req.params.movieId, 10);
    if (!movieId || isNaN(movieId)) {
        throw new errors_1.BadRequestError('Movie ID is required and must be a number');
    }
    await FavoriteService_1.FavoriteService.removeFavorite(movieId, req.user);
    res.status(200).json({
        message: 'Movie removed from favorites successfully',
    });
});
FavoriteController.checkFavorite = (0, asyncHandler_1.default)(async (req, res) => {
    const movieId = parseInt(req.params.movieId, 10);
    if (isNaN(movieId)) {
        throw new errors_1.BadRequestError('Invalid movie ID');
    }
    const isFavorite = await FavoriteService_1.FavoriteService.isFavorite(movieId, req.user);
    res.status(200).json({
        message: 'Favorite status checked successfully',
        data: { isFavorite },
    });
});
//# sourceMappingURL=FavoriteController.js.map