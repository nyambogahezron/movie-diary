"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movie = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
class Movie {
    static async create(movieData) {
        const genresJson = movieData.genres
            ? JSON.stringify(movieData.genres)
            : null;
        if (movieData.rating !== undefined &&
            movieData.rating !== null &&
            (movieData.rating < 0 || movieData.rating > 10)) {
            throw new Error('Rating must be between 0 and 10');
        }
        const result = await db_1.db
            .insert(schema_1.movies)
            .values({
            title: movieData.title,
            tmdbId: movieData.tmdbId,
            posterPath: movieData.posterPath || null,
            releaseDate: movieData.releaseDate || null,
            overview: movieData.overview || null,
            rating: movieData.rating || null,
            watchDate: movieData.watchDate || null,
            review: movieData.review || null,
            genres: genresJson,
            userId: movieData.userId,
        })
            .returning();
        return result[0];
    }
    static async findById(id) {
        const result = await db_1.db.select().from(schema_1.movies).where((0, drizzle_orm_1.eq)(schema_1.movies.id, id));
        return result[0];
    }
    static async findByTmdbId(tmdbId, userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.movies)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.movies.tmdbId, tmdbId), (0, drizzle_orm_1.eq)(schema_1.movies.userId, userId)));
        return result[0];
    }
    static async findByUserId(userId, params) {
        const conditions = [];
        conditions.push((0, drizzle_orm_1.eq)(schema_1.movies.userId, userId));
        if (params?.search) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.movies.title, `%${params.search}%`));
        }
        let orderByColumn = schema_1.movies.createdAt;
        let orderByDirection = 'desc';
        if (params?.sortBy && params.sortBy in schema_1.movies) {
            const column = schema_1.movies[params.sortBy];
            if (column && typeof column !== 'function') {
                orderByColumn = column;
                orderByDirection = params?.sortOrder === 'desc' ? 'desc' : 'asc';
            }
        }
        const result = await db_1.db
            .select()
            .from(schema_1.movies)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(orderByDirection === 'desc' ? (0, drizzle_orm_1.desc)(orderByColumn) : (0, drizzle_orm_1.asc)(orderByColumn))
            .limit(params?.limit ?? 100)
            .offset(params?.offset ?? 0);
        return result;
    }
    static async update(id, movieData) {
        const existingMovie = await this.findById(id);
        if (!existingMovie) {
            throw new errors_1.BadRequestError(`Movie with ID ${id} not found`);
        }
        const title = movieData.title || existingMovie.title;
        const tmdbId = movieData.tmdbId || existingMovie.tmdbId;
        const posterPath = movieData.posterPath || existingMovie.posterPath;
        const releaseDate = movieData.releaseDate || existingMovie.releaseDate;
        const overview = movieData.overview || existingMovie.overview;
        const rating = movieData.rating ?? existingMovie.rating;
        const watchDate = movieData.watchDate || existingMovie.watchDate;
        const review = movieData.review || existingMovie.review;
        const genres = movieData.genres !== undefined
            ? movieData.genres
                ? JSON.stringify(movieData.genres)
                : null
            : existingMovie.genres;
        const dataToUpdate = {
            title,
            tmdbId,
            posterPath,
            releaseDate,
            overview,
            rating,
            watchDate,
            review,
            genres,
        };
        await db_1.db.update(schema_1.movies).set(dataToUpdate).where((0, drizzle_orm_1.eq)(schema_1.movies.id, id));
    }
    static async delete(id) {
        await db_1.db.delete(schema_1.movies).where((0, drizzle_orm_1.eq)(schema_1.movies.id, id));
    }
}
exports.Movie = Movie;
//# sourceMappingURL=Movie.js.map