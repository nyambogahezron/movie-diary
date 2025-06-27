"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const WatchlistController_1 = require("../controllers/WatchlistController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router
    .route('/')
    .post(WatchlistController_1.WatchlistController.createWatchlist)
    .get(WatchlistController_1.WatchlistController.getUserWatchlists);
router.get('/public', WatchlistController_1.WatchlistController.getPublicWatchlists);
router
    .route('/:id')
    .get(WatchlistController_1.WatchlistController.getWatchlist)
    .put(WatchlistController_1.WatchlistController.updateWatchlist)
    .delete(WatchlistController_1.WatchlistController.deleteWatchlist);
router
    .route('/:id/movies')
    .get(WatchlistController_1.WatchlistController.getWatchlistMovies)
    .post(WatchlistController_1.WatchlistController.addMovieToWatchlist)
    .delete(WatchlistController_1.WatchlistController.removeMovieFromWatchlist);
exports.default = router;
//# sourceMappingURL=watchlists.js.map