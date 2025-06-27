"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Favorite = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class Favorite {
    static async create(favoriteData) {
        const existingFavorite = await db_1.db
            .select()
            .from(schema_1.favorites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.favorites.userId, favoriteData.userId), (0, drizzle_orm_1.eq)(schema_1.favorites.movieId, favoriteData.movieId)));
        if (existingFavorite.length > 0) {
            return existingFavorite[0];
        }
        const result = await db_1.db
            .insert(schema_1.favorites)
            .values({
            userId: favoriteData.userId,
            movieId: favoriteData.movieId,
        })
            .returning();
        return result[0];
    }
    static async findByUserIdAndMovieId(userId, movieId) {
        const result = await db_1.db
            .select()
            .from(schema_1.favorites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.favorites.userId, userId), (0, drizzle_orm_1.eq)(schema_1.favorites.movieId, movieId)));
        return result[0];
    }
    static async delete(userId, movieId) {
        await db_1.db
            .delete(schema_1.favorites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.favorites.userId, userId), (0, drizzle_orm_1.eq)(schema_1.favorites.movieId, movieId)));
    }
    static async getFavoriteMoviesByUserId(userId) {
        const result = await db_1.db
            .select({
            movie: schema_1.movies,
        })
            .from(schema_1.favorites)
            .innerJoin(schema_1.movies, (0, drizzle_orm_1.eq)(schema_1.favorites.movieId, schema_1.movies.id))
            .where((0, drizzle_orm_1.eq)(schema_1.favorites.userId, userId));
        return result.map((r) => r.movie);
    }
    static async isFavorite(userId, movieId) {
        const favorite = await this.findByUserIdAndMovieId(userId, movieId);
        return !!favorite;
    }
}
exports.Favorite = Favorite;
//# sourceMappingURL=Favorite.js.map