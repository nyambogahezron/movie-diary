"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieReviewController = void 0;
const MovieReviewService_1 = require("../services/MovieReviewService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errors_1 = require("../utils/errors");
class MovieReviewController {
}
exports.MovieReviewController = MovieReviewController;
_a = MovieReviewController;
MovieReviewController.addReview = (0, asyncHandler_1.default)(async (req, res) => {
    const movieId = Number(req.params.movieId);
    if (isNaN(movieId)) {
        throw new errors_1.BadRequestError('Invalid movie ID');
    }
    const { content, rating, isPublic } = req.body;
    if (!content) {
        throw new errors_1.BadRequestError('Review content is required');
    }
    if (rating !== undefined &&
        (isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 10)) {
        throw new errors_1.BadRequestError('Rating must be a number between 1 and 10');
    }
    const review = await MovieReviewService_1.MovieReviewService.addReview(movieId, {
        content,
        rating: rating ? Number(rating) : null,
        isPublic,
    }, req.user);
    res.status(201).json({
        message: 'Review added successfully',
        data: review,
    });
});
MovieReviewController.getMovieReviews = (0, asyncHandler_1.default)(async (req, res) => {
    const movieId = Number(req.params.movieId);
    if (isNaN(movieId)) {
        throw new errors_1.BadRequestError('Invalid movie ID');
    }
    const reviews = await MovieReviewService_1.MovieReviewService.getReview(movieId);
    res.status(200).json({
        message: 'Reviews retrieved successfully',
        data: reviews,
    });
});
MovieReviewController.updateReview = (0, asyncHandler_1.default)(async (req, res) => {
    const reviewId = Number(req.params.id);
    if (isNaN(reviewId)) {
        throw new errors_1.BadRequestError('Invalid review ID');
    }
    const existingReview = await MovieReviewService_1.MovieReviewService.findReviewById(reviewId);
    if (!existingReview) {
        throw new errors_1.BadRequestError('Review not found');
    }
    if (existingReview.userId !== req.user?.id) {
        throw new errors_1.BadRequestError('You do not have permission to update this review');
    }
    const content = req.body.content ?? existingReview.content;
    const rating = req.body.rating ?? existingReview.rating;
    const isPublic = req.body.isPublic ?? existingReview.isPublic;
    const review = await MovieReviewService_1.MovieReviewService.updateReview(reviewId, {
        content,
        rating,
        isPublic,
    });
    res.status(200).json({
        message: 'Review updated successfully',
        data: review,
    });
});
MovieReviewController.deleteReview = (0, asyncHandler_1.default)(async (req, res) => {
    const reviewId = Number(req.params.id);
    if (isNaN(reviewId)) {
        throw new errors_1.BadRequestError('Invalid review ID');
    }
    await MovieReviewService_1.MovieReviewService.deleteReview(reviewId, req.user);
    res.status(200).json({
        message: 'Review deleted successfully',
    });
});
MovieReviewController.getUserReviews = (0, asyncHandler_1.default)(async (req, res) => {
    const reviews = await MovieReviewService_1.MovieReviewService.getUserReviews(req.user);
    res.status(200).json({
        message: 'User reviews retrieved successfully',
        data: reviews,
    });
});
//# sourceMappingURL=MovieReviewController.js.map