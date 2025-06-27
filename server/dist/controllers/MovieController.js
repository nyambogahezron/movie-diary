"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieController = void 0;
const MovieService_1 = require("../services/MovieService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errors_1 = require("../utils/errors");
class MovieController {
}
exports.MovieController = MovieController;
_a = MovieController;
MovieController.addMovie = (0, asyncHandler_1.default)(async (req, res) => {
    const { title, tmdbId } = req.body;
    if (!title || !tmdbId) {
        throw new errors_1.BadRequestError('Title and TMDB ID are required');
    }
    const movie = await MovieService_1.MovieService.addMovie({ ...req.body }, req.user);
    res.status(201).json({
        message: 'Movie added successfully',
        data: movie,
    });
});
MovieController.getSingleMovie = (0, asyncHandler_1.default)(async (req, res) => {
    const movieId = Number(req.params.id);
    if (isNaN(movieId)) {
        throw new errors_1.BadRequestError('Invalid movie ID');
    }
    const movie = await MovieService_1.MovieService.getMovie(movieId, req.user);
    res.status(200).json({
        message: 'Movie retrieved successfully',
        data: movie,
    });
});
MovieController.getUserMovies = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.BadRequestError('Authentication required');
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
    const movies = await MovieService_1.MovieService.getUserMovies(req.user, searchParams);
    res.status(200).json({
        message: 'Movies retrieved successfully',
        data: movies,
    });
});
MovieController.updateMovie = (0, asyncHandler_1.default)(async (req, res) => {
    const movieId = Number(req.params.id);
    if (isNaN(movieId)) {
        throw new Error('Invalid movie ID');
    }
    const movie = await MovieService_1.MovieService.updateMovie(movieId, req.body, req.user);
    res.status(200).json({
        message: 'Movie updated successfully',
        data: movie,
    });
});
MovieController.deleteMovie = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new errors_1.BadRequestError('Authentication required');
    }
    const movieId = Number(req.params.id);
    if (isNaN(movieId)) {
        throw new Error('Invalid movie ID');
    }
    await MovieService_1.MovieService.deleteMovie(movieId, req.user);
    res.status(200).json({
        message: 'Movie deleted successfully',
    });
});
//# sourceMappingURL=MovieController.js.map