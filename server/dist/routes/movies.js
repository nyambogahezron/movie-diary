"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MovieController_1 = require("../controllers/MovieController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authMiddleware);
router
    .route('/')
    .post(MovieController_1.MovieController.addMovie)
    .get(MovieController_1.MovieController.getUserMovies);
router
    .route('/:id')
    .get(MovieController_1.MovieController.getSingleMovie)
    .patch(MovieController_1.MovieController.updateMovie)
    .delete(MovieController_1.MovieController.deleteMovie);
exports.default = router;
//# sourceMappingURL=movies.js.map