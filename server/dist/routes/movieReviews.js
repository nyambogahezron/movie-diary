"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MovieReviewController_1 = require("../controllers/MovieReviewController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.route('/movie/:movieId').get(MovieReviewController_1.MovieReviewController.getMovieReviews);
router.use(auth_1.authMiddleware);
router.get('/', MovieReviewController_1.MovieReviewController.getUserReviews);
router
    .route('/:id')
    .patch(MovieReviewController_1.MovieReviewController.updateReview)
    .delete(MovieReviewController_1.MovieReviewController.deleteReview);
router.route('/movie/:movieId').post(MovieReviewController_1.MovieReviewController.addReview);
exports.default = router;
//# sourceMappingURL=movieReviews.js.map