"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const Post_1 = require("../helpers/Post");
const errors_1 = require("../utils/errors");
class PostService {
    static async createPost(userId, postData) {
        return await Post_1.Post.create({
            ...postData,
            userId,
        });
    }
    static async getPostById(postId, userId) {
        const post = await Post_1.Post.findById(postId);
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        if (!post.isPublic && post.userId !== userId) {
            throw new errors_1.UnauthorizedError('You do not have permission to view this post');
        }
        return post;
    }
    static async getPostsByUserId(userId, params) {
        return await Post_1.Post.findByUserId(userId, params);
    }
    static async getFeed(userId, params) {
        return await Post_1.Post.getFeed(userId, params);
    }
    static async updatePost(userId, postId, postData) {
        const post = await this.getPostById(postId);
        if (post.userId !== userId) {
            throw new errors_1.UnauthorizedError('You do not have permission to update this post');
        }
        await Post_1.Post.update(postId, postData);
    }
    static async deletePost(userId, postId) {
        const post = await this.getPostById(postId);
        if (post.userId !== userId) {
            throw new errors_1.UnauthorizedError('You do not have permission to delete this post');
        }
        await Post_1.Post.delete(postId);
    }
    static async getPostsWithLikeStatus(userId, params) {
        return await Post_1.Post.getPostsWithLikeStatus(userId, params);
    }
}
exports.PostService = PostService;
//# sourceMappingURL=PostService.js.map