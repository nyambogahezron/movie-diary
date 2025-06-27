"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostComment = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class PostComment {
    static async create(commentData) {
        const result = await db_1.db
            .insert(schema_1.postComments)
            .values({
            content: commentData.content,
            userId: commentData.userId,
            postId: commentData.postId,
        })
            .returning();
        return result[0];
    }
    static async findById(id) {
        const result = await db_1.db
            .select()
            .from(schema_1.postComments)
            .where((0, drizzle_orm_1.eq)(schema_1.postComments.id, id));
        return result[0];
    }
    static async findByPostId(postId) {
        const result = await db_1.db
            .select({
            id: schema_1.postComments.id,
            userId: schema_1.postComments.userId,
            postId: schema_1.postComments.postId,
            content: schema_1.postComments.content,
            createdAt: schema_1.postComments.createdAt,
            updatedAt: schema_1.postComments.updatedAt,
            username: schema_1.users.username,
            avatar: schema_1.users.avatar,
        })
            .from(schema_1.postComments)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.postComments.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(schema_1.postComments.postId, postId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.postComments.createdAt));
        return result[0];
    }
    static async update(id, content) {
        await db_1.db
            .update(schema_1.postComments)
            .set({
            content,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.postComments.id, id));
    }
    static async delete(id) {
        await db_1.db.delete(schema_1.postComments).where((0, drizzle_orm_1.eq)(schema_1.postComments.id, id));
    }
    static async deleteAllByPostId(postId) {
        await db_1.db.delete(schema_1.postComments).where((0, drizzle_orm_1.eq)(schema_1.postComments.postId, postId));
    }
    static async findByUserAndPost(userId, postId) {
        const result = await db_1.db
            .select()
            .from(schema_1.postComments)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.postComments.userId, userId), (0, drizzle_orm_1.eq)(schema_1.postComments.postId, postId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.postComments.createdAt));
        return result[0];
    }
}
exports.PostComment = PostComment;
//# sourceMappingURL=PostComment.js.map