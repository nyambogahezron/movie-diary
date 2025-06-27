"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCommentService = void 0;
const PostComment_1 = require("../helpers/PostComment");
const Post_1 = require("../helpers/Post");
const errors_1 = require("../utils/errors");
class PostCommentService {
    static async createComment(userId, postId, commentData) {
        const post = await Post_1.Post.findById(postId);
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        const comment = await PostComment_1.PostComment.create({
            content: commentData.content,
            userId,
            postId,
        });
        await Post_1.Post.incrementComments(postId);
        return comment;
    }
    static async getCommentsByPostId(postId) {
        const post = await Post_1.Post.findById(postId);
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        return await PostComment_1.PostComment.findByPostId(postId);
    }
    static async updateComment(userId, commentId, content) {
        const comment = await PostComment_1.PostComment.findById(commentId);
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new errors_1.UnauthorizedError('You do not have permission to update this comment');
        }
        await PostComment_1.PostComment.update(commentId, content);
    }
    static async deleteComment(userId, commentId) {
        const comment = await PostComment_1.PostComment.findById(commentId);
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        if (comment.userId !== userId) {
            throw new errors_1.UnauthorizedError('You do not have permission to delete this comment');
        }
        await PostComment_1.PostComment.delete(commentId);
        await Post_1.Post.decrementComments(comment.postId);
    }
    static async getUserCommentsOnPost(userId, postId) {
        return await PostComment_1.PostComment.findByUserAndPost(userId, postId);
    }
}
exports.PostCommentService = PostCommentService;
//# sourceMappingURL=PostCommentService.js.map