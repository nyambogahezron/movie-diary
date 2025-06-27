"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PostController_1 = require("../controllers/PostController");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const post_validation_1 = require("../utils/validations/post.validation");
const router = express_1.default.Router();
router.get('/feed', (0, validate_1.validate)(post_validation_1.validatePostQuery), PostController_1.PostController.getFeed);
router.get('/:id', (0, validate_1.validate)(post_validation_1.validatePostIdParam), PostController_1.PostController.getSinglePost);
router.get('/:id/comments', (0, validate_1.validate)(post_validation_1.validatePostIdParam), PostController_1.PostController.getComments);
router.use(auth_1.authMiddleware);
router
    .route('/')
    .get((0, validate_1.validate)(post_validation_1.validatePostQuery), PostController_1.PostController.getUserPosts)
    .post((0, validate_1.validate)(post_validation_1.validatePostCreate), PostController_1.PostController.createPost);
router
    .route('/:id')
    .patch((0, validate_1.validate)(post_validation_1.validatePostUpdate), PostController_1.PostController.updatePost)
    .delete((0, validate_1.validate)(post_validation_1.validatePostIdParam), PostController_1.PostController.deletePost);
router
    .route('/:id/like')
    .post((0, validate_1.validate)(post_validation_1.validatePostIdParam), PostController_1.PostController.likePost)
    .delete((0, validate_1.validate)(post_validation_1.validatePostIdParam), PostController_1.PostController.unlikePost);
router.post('/:id/comments', (0, validate_1.validate)(post_validation_1.validatePostComment), PostController_1.PostController.addComment);
router
    .route('/comments/:commentId')
    .put((0, validate_1.validate)(post_validation_1.validateCommentUpdate), PostController_1.PostController.updateComment)
    .delete((0, validate_1.validate)(post_validation_1.validateCommentIdParam), PostController_1.PostController.deleteComment);
exports.default = router;
//# sourceMappingURL=posts.js.map