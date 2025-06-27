"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MovieReviewController_1 = require("../controllers/MovieReviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authMiddleware, MovieReviewController_1.MovieReviewController.getUserReviews);
router
    .route('/:id')
    .patch(auth_1.authMiddleware, MovieReviewController_1.MovieReviewController.updateReview)
    .delete(auth_1.authMiddleware, MovieReviewController_1.MovieReviewController.deleteReview);
router
    .route('/movie/:movieId')
    .get(MovieReviewController_1.MovieReviewController.getMovieReviews)
    .post(auth_1.authMiddleware, MovieReviewController_1.MovieReviewController.addReview);
exports.default = router;
//# sourceMappingURL=movieReviews.js.map