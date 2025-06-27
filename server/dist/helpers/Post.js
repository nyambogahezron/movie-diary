"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class Post {
    static async create(postData) {
        const result = await db_1.db
            .insert(schema_1.posts)
            .values({
            title: postData.title,
            tmdbId: postData.tmdbId,
            posterPath: postData.posterPath || null,
            content: postData.content,
            userId: postData.userId,
            isPublic: postData.isPublic !== undefined ? postData.isPublic : true,
            likesCount: 0,
            commentsCount: 0,
        })
            .returning();
        return result[0];
    }
    static async findById(id) {
        const result = await db_1.db.select().from(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
        return result[0];
    }
    static async findByUserId(userId, params) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.posts.userId, userId)];
        if (params?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.posts.title, `%${params.search}%`));
        }
        if (params?.isPublic !== undefined) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.posts.isPublic, params.isPublic));
        }
        const getSortColumn = (sortBy) => {
            switch (sortBy) {
                case 'title':
                    return schema_1.posts.title;
                case 'createdAt':
                    return schema_1.posts.createdAt;
                case 'updatedAt':
                    return schema_1.posts.updatedAt;
                case 'likesCount':
                    return schema_1.posts.likesCount;
                case 'commentsCount':
                    return schema_1.posts.commentsCount;
                default:
                    return schema_1.posts.createdAt;
            }
        };
        const result = await db_1.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(params?.sortOrder === 'desc'
            ? (0, drizzle_orm_1.desc)(getSortColumn(params?.sortBy))
            : (0, drizzle_orm_1.asc)(getSortColumn(params?.sortBy)))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result;
    }
    static async getFeed(currentUserId, params) {
        const result = await db_1.db
            .select()
            .from(schema_1.posts)
            .where((0, drizzle_orm_1.eq)(schema_1.posts.isPublic, true))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.posts.createdAt))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result;
    }
    static async update(id, postData) {
        const updateData = {};
        if (postData.title !== undefined)
            updateData.title = postData.title;
        if (postData.content !== undefined)
            updateData.content = postData.content;
        if (postData.isPublic !== undefined)
            updateData.isPublic = postData.isPublic;
        updateData.updatedAt = new Date().toISOString();
        await db_1.db.update(schema_1.posts).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
    }
    static async delete(id) {
        await db_1.db.delete(schema_1.posts).where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
    }
    static async incrementLikes(id) {
        await db_1.db
            .update(schema_1.posts)
            .set({
            likesCount: (0, drizzle_orm_1.sql) `${schema_1.posts.likesCount} + 1`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
    }
    static async decrementLikes(id) {
        await db_1.db
            .update(schema_1.posts)
            .set({
            likesCount: (0, drizzle_orm_1.sql) `${schema_1.posts.likesCount} - 1`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
    }
    static async incrementComments(id) {
        await db_1.db
            .update(schema_1.posts)
            .set({
            commentsCount: (0, drizzle_orm_1.sql) `${schema_1.posts.commentsCount} + 1`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
    }
    static async decrementComments(id) {
        await db_1.db
            .update(schema_1.posts)
            .set({
            commentsCount: (0, drizzle_orm_1.sql) `${schema_1.posts.commentsCount} - 1`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.posts.id, id));
    }
    static async getPostsWithLikeStatus(userId, params) {
        const postsResult = await this.findByUserId(userId, params);
        if (postsResult.length === 0) {
            return [];
        }
        const postIds = postsResult.map((post) => post.id);
        const likes = await db_1.db
            .select()
            .from(schema_1.postLikes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.postLikes.userId, userId), (0, drizzle_orm_1.inArray)(schema_1.postLikes.postId, postIds)));
        const likeMap = new Map();
        likes.forEach((like) => {
            likeMap.set(like.postId, true);
        });
        return postsResult.map((post) => ({
            ...post,
            hasLiked: likeMap.has(post.id),
        }));
    }
}
exports.Post = Post;
//# sourceMappingURL=Post.js.map