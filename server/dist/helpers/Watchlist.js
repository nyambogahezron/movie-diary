"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watchlist = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class Watchlist {
    static async create(watchlistData) {
        const existingWatchlist = await db_1.db
            .select()
            .from(schema_1.watchlists)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.watchlists.userId, watchlistData.userId), (0, drizzle_orm_1.eq)(schema_1.watchlists.name, watchlistData.name)));
        if (existingWatchlist.length > 0) {
            throw new Error('A watchlist with this name already exists');
        }
        const result = await db_1.db
            .insert(schema_1.watchlists)
            .values({
            name: watchlistData.name,
            description: watchlistData.description || null,
            isPublic: watchlistData.isPublic,
            userId: watchlistData.userId,
        })
            .returning();
        return result[0];
    }
    static async findById(id) {
        const result = await db_1.db
            .select()
            .from(schema_1.watchlists)
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, id));
        return result[0];
    }
    static async findByUserId(userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.watchlists)
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.userId, userId));
        return result;
    }
    static async findPublic(params) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.watchlists.isPublic, true)];
        if (params?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.watchlists.name, `%${params.search}%`));
        }
        const getWatchlistSortColumn = (sortBy) => {
            switch (sortBy) {
                case 'name':
                    return schema_1.watchlists.name;
                case 'createdAt':
                    return schema_1.watchlists.createdAt;
                case 'updatedAt':
                    return schema_1.watchlists.updatedAt;
                default:
                    return schema_1.watchlists.updatedAt;
            }
        };
        const result = await db_1.db
            .select()
            .from(schema_1.watchlists)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(params?.sortOrder === 'desc'
            ? (0, drizzle_orm_1.desc)(getWatchlistSortColumn(params?.sortBy))
            : (0, drizzle_orm_1.asc)(getWatchlistSortColumn(params?.sortBy)))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result;
    }
    static async update(id, watchlistData) {
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            ...watchlistData,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, id));
    }
    static async delete(id) {
        await db_1.db.delete(schema_1.watchlistMovies).where((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, id));
        await db_1.db.delete(schema_1.watchlists).where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, id));
    }
    static async addMovie(watchlistId, movieId) {
        const existingEntry = await db_1.db
            .select()
            .from(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId), (0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, movieId)));
        if (existingEntry.length > 0) {
            return;
        }
        await db_1.db.insert(schema_1.watchlistMovies).values({
            watchlistId,
            movieId,
        });
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, watchlistId));
    }
    static async removeMovie(watchlistId, movieId) {
        await db_1.db
            .delete(schema_1.watchlistMovies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId), (0, drizzle_orm_1.eq)(schema_1.watchlistMovies.movieId, movieId)));
        await db_1.db
            .update(schema_1.watchlists)
            .set({
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.watchlists.id, watchlistId));
    }
    static async getMovies(watchlistId, params) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.watchlistMovies.watchlistId, watchlistId)];
        if (params?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.movies.title, `%${params.search}%`));
        }
        const getMovieSortColumn = (sortBy) => {
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
            ? (0, drizzle_orm_1.desc)(getMovieSortColumn(params?.sortBy))
            : (0, drizzle_orm_1.asc)(getMovieSortColumn(params?.sortBy)))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result.map((r) => r.movie);
    }
}
exports.Watchlist = Watchlist;
//# sourceMappingURL=Watchlist.js.map