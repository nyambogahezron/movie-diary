"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieReviewService = void 0;
const MovieReview_1 = require("../helpers/MovieReview");
const Movie_1 = require("../helpers/Movie");
const errors_1 = require("../utils/errors");
class MovieReviewService {
    static async addReview(movieId, input, user) {
        const movie = await Movie_1.Movie.findById(movieId);
        if (!movie) {
            throw new errors_1.NotFoundError('Movie not found');
        }
        const existingReview = await MovieReview_1.MovieReview.findByUserAndMovie(user.id, movieId);
        if (existingReview) {
            throw new errors_1.BadRequestError('You have already reviewed this movie');
        }
        return MovieReview_1.MovieReview.create({
            ...input,
            userId: user.id,
            movieId,
        });
    }
    static async updateReview(id, input) {
        await MovieReview_1.MovieReview.update(id, input);
        const updated = await MovieReview_1.MovieReview.findById(id);
        if (!updated) {
            throw new errors_1.NotFoundError('Updated review not found');
        }
        return updated;
    }
    static async deleteReview(id, user) {
        const review = await MovieReview_1.MovieReview.findById(id);
        if (!review) {
            throw new errors_1.NotFoundError('Review not found');
        }
        if (review.userId !== user.id) {
            throw new errors_1.UnauthorizedError('You do not have permission to delete this review');
        }
        await MovieReview_1.MovieReview.delete(id);
    }
    static async getReview(id) {
        const review = await MovieReview_1.MovieReview.findByMovieId(id);
        if (!review) {
            throw new errors_1.NotFoundError('Review not found');
        }
        return review;
    }
    static async getUserReviews(user) {
        return MovieReview_1.MovieReview.findByUserId(user.id);
    }
    static async getMovieReviews(userId, movieId) {
        const reviews = await MovieReview_1.MovieReview.findByUserAndMovie(userId, movieId);
        if (!reviews) {
            throw new errors_1.NotFoundError('unauthorized or no reviews found');
        }
        return reviews;
    }
    static async findReviewById(id) {
        const review = await MovieReview_1.MovieReview.findById(id);
        if (!review) {
            throw new errors_1.NotFoundError('Review not found');
        }
        return review;
    }
}
exports.MovieReviewService = MovieReviewService;
//# sourceMappingURL=MovieReviewService.js.map