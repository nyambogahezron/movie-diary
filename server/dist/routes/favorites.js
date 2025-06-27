"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FavoriteController_1 = require("../controllers/FavoriteController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router
    .route('/')
    .post(FavoriteController_1.FavoriteController.addFavorite)
    .get(FavoriteController_1.FavoriteController.getFavorites);
router.delete('/:movieId', FavoriteController_1.FavoriteController.removeFavorite);
router.get('/:movieId/status', FavoriteController_1.FavoriteController.checkFavorite);
exports.default = router;
//# sourceMappingURL=favorites.js.map