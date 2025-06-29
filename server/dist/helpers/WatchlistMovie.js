"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistMovie = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
class WatchlistMovie {
    static async create(data) {
        const existingEntry = await db_1.db
            .select()
            .from(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, data.watchlistId), (0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, data.movieId)));
        if (existingEntry.length > 0) {
            throw new errors_1.BadRequestError('Movie is already in the watchlist');
        }
        const result = await db_1.db
            .insert(schema_1.watchlistMovies)
            .values({
            watchlistId: data.watchlistId,
            movieId: data.movieId,
        })
            .returning();
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, data.watchlistId));
        return result[0];
    }
    static async findById(id) {
        const result = await db_1.db
            .select()
            .from(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.id, id));
        return result[0];
    }
    static async findByWatchlistId(watchlistId, params) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId)];
        const getSortColumn = (sortBy) => {
            switch (sortBy) {
                case 'createdAt':
                    return schema_1.watchlistMovies.createdAt;
                default:
                    return schema_1.watchlistMovies.createdAt;
            }
        };
        const result = await db_1.db
            .select()
            .from(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(params?.sortOrder === 'desc'
            ? (0, drizzle_orm_1.desc)(getSortColumn(params?.sortBy))
            : (0, drizzle_orm_1.asc)(getSortColumn(params?.sortBy)))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result;
    }
    static async findByMovieId(movieId) {
        const result = await db_1.db
            .select()
            .from(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, movieId));
        return result;
    }
    static async findByWatchlistIdAndMovieId(watchlistId, movieId) {
        const result = await db_1.db
            .select()
            .from(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId), (0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, movieId)));
        return result[0];
    }
    static async getMoviesByWatchlistId(watchlistId, params) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId)];
        if (params?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.movies.title, `%${params.search}%`));
        }
        const getSortColumn = (sortBy) => {
            switch (sortBy) {
                case 'title':
                    return schema_1.movies.title;
                case 'releaseDate':
                    return schema_1.movies.releaseDate;
                case 'rating':
                    return schema_1.movies.rating;
                default:
                    return schema_1.movies.title;
            }
        };
        const result = await db_1.db
            .select({
            movie: schema_1.movies,
        })
            .from(schema_1.watchlistMovies)
            .innerJoin(schema_1.movies, (0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, schema_1.movies.id))
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(params?.sortOrder === 'desc'
            ? (0, drizzle_orm_1.desc)(getSortColumn(params?.sortBy))
            : (0, drizzle_orm_1.asc)(getSortColumn(params?.sortBy)))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result.map((r) => r.movie);
    }
    static async delete(id) {
        const entry = await this.findById(id);
        if (!entry) {
            throw new errors_1.BadRequestError('WatchlistMovie not found');
        }
        await db_1.db.delete(schema_1.watchlistMovies).where((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.id, id));
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, entry.watchlistId));
    }
    static async deleteByWatchlistIdAndMovieId(watchlistId, movieId) {
        await db_1.db
            .delete(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId), (0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, movieId)));
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, watchlistId));
    }
    static async deleteAllByWatchlistId(watchlistId) {
        await db_1.db
            .delete(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId));
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, watchlistId));
    }
    static async deleteAllByMovieId(movieId) {
        const entries = await this.findByMovieId(movieId);
        const watchlistIds = [
            ...new Set(entries.map((entry) => entry.watchlistId)),
        ];
        await db_1.db
            .delete(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, movieId));
        for (const watchlistId of watchlistIds) {
            await db_1.db
                .update(schema_1.watchlists)
                .set({
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, watchlistId));
        }
    }
}
exports.WatchlistMovie = WatchlistMovie;
//# sourceMappingURL=WatchlistMovie.js.map