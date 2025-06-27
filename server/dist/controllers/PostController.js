"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const PostService_1 = require("../services/PostService");
const PostLikeService_1 = require("../services/PostLikeService");
const PostCommentService_1 = require("../services/PostCommentService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errors_1 = require("../utils/errors");
class PostController {
}
exports.PostController = PostController;
_a = PostController;
PostController.createPost = (0, asyncHandler_1.default)(async (req, res) => {
    const postData = req.body;
    const post = await PostService_1.PostService.createPost(req.user.id, postData);
    res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully',
    });
});
PostController.getSinglePost = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new errors_1.BadRequestError('Invalid post ID');
    }
    const userId = req.user?.id;
    const post = await PostService_1.PostService.getPostById(postId, userId);
    const hasLiked = userId
        ? await PostLikeService_1.PostLikeService.hasUserLikedPost(userId, postId)
        : false;
    res.status(200).json({
        success: true,
        data: { ...post, hasLiked },
        message: 'Post retrieved successfully',
    });
});
PostController.getUserPosts = (0, asyncHandler_1.default)(async (req, res) => {
    const params = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        search: req.query.search,
        isPublic: req.query.isPublic === 'true'
            ? true
            : req.query.isPublic === 'false'
                ? false
                : undefined,
    };
    const posts = await PostService_1.PostService.getPostsWithLikeStatus(req.user.id, params);
    res.status(200).json({
        success: true,
        data: posts,
        message: 'User posts retrieved successfully',
    });
});
PostController.getFeed = (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const params = {
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
        search: req.query.search,
    };
    const posts = await PostService_1.PostService.getFeed(userId, params);
    res.status(200).json({
        success: true,
        data: posts,
        message: 'Post feed retrieved successfully',
    });
});
PostController.updatePost = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new Error('Invalid post ID');
    }
    const postData = req.body;
    await PostService_1.PostService.updatePost(req.user.id, postId, postData);
    res.status(200).json({
        success: true,
        message: 'Post updated successfully',
    });
});
PostController.deletePost = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new errors_1.BadRequestError('Invalid post ID');
    }
    await PostService_1.PostService.deletePost(req.user.id, postId);
    res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
    });
});
PostController.likePost = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new errors_1.BadRequestError('Invalid post ID');
    }
    await PostLikeService_1.PostLikeService.likePost(req.user.id, postId);
    res.status(200).json({
        success: true,
        message: 'Post liked successfully',
    });
});
PostController.unlikePost = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new errors_1.BadRequestError('Invalid post ID');
    }
    await PostLikeService_1.PostLikeService.unlikePost(req.user.id, postId);
    res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
    });
});
PostController.addComment = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new errors_1.BadRequestError('Invalid post ID');
    }
    const commentData = req.body;
    const comment = await PostCommentService_1.PostCommentService.createComment(req.user.id, postId, commentData);
    res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment added successfully',
    });
});
PostController.getComments = (0, asyncHandler_1.default)(async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) {
        throw new errors_1.BadRequestError('Invalid post ID');
    }
    const comments = await PostCommentService_1.PostCommentService.getCommentsByPostId(postId);
    res.status(200).json({
        success: true,
        data: comments,
        message: 'Comments retrieved successfully',
    });
});
PostController.updateComment = (0, asyncHandler_1.default)(async (req, res) => {
    const commentId = Number(req.params.commentId);
    if (isNaN(commentId)) {
        throw new errors_1.BadRequestError('Invalid comment ID');
    }
    const { content } = req.body;
    await PostCommentService_1.PostCommentService.updateComment(req.user.id, commentId, content);
    res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
    });
});
PostController.deleteComment = (0, asyncHandler_1.default)(async (req, res) => {
    const commentId = Number(req.params.commentId);
    if (isNaN(commentId)) {
        throw new errors_1.BadRequestError('Invalid comment ID');
    }
    await PostCommentService_1.PostCommentService.deleteComment(req.user.id, commentId);
    res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
    });
});
//# sourceMappingURL=PostController.js.map