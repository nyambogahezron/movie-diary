"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostLike = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class PostLike {
    static async create(userId, postId) {
        const result = await db_1.db
            .insert(schema_1.postLikes)
            .values({
            userId,
            postId,
        })
            .returning();
        return result[0];
    }
    static async findByUserAndPost(userId, postId) {
        const result = await db_1.db
            .select()
            .from(schema_1.postLikes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.postLikes.userId, userId), (0, drizzle_orm_1.eq)(schema_1.postLikes.postId, postId)));
        return result[0];
    }
    static async delete(id) {
        await db_1.db.delete(schema_1.postLikes).where((0, drizzle_orm_1.eq)(schema_1.postLikes.id, id));
    }
    static async deleteByUserAndPost(userId, postId) {
        await db_1.db
            .delete(schema_1.postLikes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.postLikes.userId, userId), (0, drizzle_orm_1.eq)(schema_1.postLikes.postId, postId)));
    }
    static async getLikeCount(postId) {
        const result = await db_1.db
            .select()
            .from(schema_1.postLikes)
            .where((0, drizzle_orm_1.eq)(schema_1.postLikes.postId, postId));
        return result.length;
    }
    static async getLikedByUser(userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.postLikes)
            .where((0, drizzle_orm_1.eq)(schema_1.postLikes.userId, userId));
        return result;
    }
}
exports.PostLike = PostLike;
//# sourceMappingURL=PostLike.js.map