"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostLikeService = void 0;
const PostLike_1 = require("../helpers/PostLike");
const Post_1 = require("../helpers/Post");
const errors_1 = require("../utils/errors");
class PostLikeService {
    static async likePost(userId, postId) {
        const post = await Post_1.Post.findById(postId);
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        const existingLike = await PostLike_1.PostLike.findByUserAndPost(userId, postId);
        if (existingLike) {
            throw new errors_1.BadRequestError('You have already liked this post');
        }
        const like = await PostLike_1.PostLike.create(userId, postId);
        await Post_1.Post.incrementLikes(postId);
        return like;
    }
    static async unlikePost(userId, postId) {
        const post = await Post_1.Post.findById(postId);
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        const existingLike = await PostLike_1.PostLike.findByUserAndPost(userId, postId);
        if (!existingLike) {
            throw new errors_1.NotFoundError('You have not liked this post');
        }
        await PostLike_1.PostLike.deleteByUserAndPost(userId, postId);
        await Post_1.Post.decrementLikes(postId);
    }
    static async hasUserLikedPost(userId, postId) {
        const like = await PostLike_1.PostLike.findByUserAndPost(userId, postId);
        return !!like;
    }
    static async getLikeCount(postId) {
        return await PostLike_1.PostLike.getLikeCount(postId);
    }
}
exports.PostLikeService = PostLikeService;
//# sourceMappingURL=PostLikeService.js.map