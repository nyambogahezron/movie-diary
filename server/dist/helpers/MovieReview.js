"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieReview = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class MovieReview {
    static async create(data) {
        const { userId, movieId, content, rating, isPublic = true } = data;
        const newReview = await db_1.db
            .insert(schema_1.movieReviews)
            .values({
            userId,
            movieId,
            content,
            rating,
            isPublic,
        })
            .returning();
        return newReview;
    }
    static async findById(id) {
        const review = await db_1.db
            .select()
            .from(schema_1.movieReviews)
            .where((0, drizzle_orm_1.eq)(schema_1.movieReviews.id, id))
            .get();
        return review;
    }
    static async findByMovieId(movieId) {
        const reviews = await db_1.db
            .select()
            .from(schema_1.movieReviews)
            .where((0, drizzle_orm_1.eq)(schema_1.movieReviews.movieId, movieId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.movieReviews.createdAt))
            .all();
        return reviews;
    }
    static async findPublicByMovieId(movieId) {
        const reviews = await db_1.db
            .select()
            .from(schema_1.movieReviews)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.movieReviews.movieId, movieId), (0, drizzle_orm_1.eq)(schema_1.movieReviews.isPublic, true)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.movieReviews.createdAt))
            .all();
        return reviews;
    }
    static async findByUserAndMovie(userId, movieId) {
        const review = await db_1.db
            .select()
            .from(schema_1.movieReviews)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.movieReviews.userId, userId), (0, drizzle_orm_1.eq)(schema_1.movieReviews.movieId, movieId)))
            .get();
        return review;
    }
    static async findByUserId(userId) {
        const reviews = await db_1.db
            .select()
            .from(schema_1.movieReviews)
            .where((0, drizzle_orm_1.eq)(schema_1.movieReviews.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.movieReviews.createdAt))
            .all();
        return reviews;
    }
    static async update(id, data) {
        await db_1.db
            .update(schema_1.movieReviews)
            .set({
            ...data,
            updatedAt: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.movieReviews.id, id))
            .run();
    }
    static async delete(id) {
        await db_1.db.delete(schema_1.movieReviews).where((0, drizzle_orm_1.eq)(schema_1.movieReviews.id, id)).run();
    }
}
exports.MovieReview = MovieReview;
//# sourceMappingURL=MovieReview.js.map