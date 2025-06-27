"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WatchlistMovieController_1 = require("../controllers/WatchlistMovieController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router
    .route('/:id')
    .get(WatchlistMovieController_1.WatchlistMovieController.getWatchlistMovie)
    .delete(WatchlistMovieController_1.WatchlistMovieController.deleteWatchlistMovie);
router
    .route('/watchlists/:watchlistId/movies')
    .get(WatchlistMovieController_1.WatchlistMovieController.getWatchlistMovies)
    .post(WatchlistMovieController_1.WatchlistMovieController.addMovieToWatchlist);
router.get('/watchlists/:watchlistId/entries', WatchlistMovieController_1.WatchlistMovieController.getWatchlistMovieEntries);
router.delete('/watchlists/:watchlistId/movies/:movieId', WatchlistMovieController_1.WatchlistMovieController.removeMovieFromWatchlist);
exports.default = router;
//# sourceMappingURL=watchlistMovies.js.map