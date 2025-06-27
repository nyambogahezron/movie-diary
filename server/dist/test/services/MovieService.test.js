"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const MovieService_1 = require("../../services/MovieService");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const setup_1 = require("../setup");
const utils_1 = require("../utils");
const drizzle_orm_1 = require("drizzle-orm");
describe('MovieService', () => {
    let user;
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
        // Create a test user
        const { user: testUser } = await (0, utils_1.createTestUser)();
        user = testUser;
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear movies before each test
        await test_db_1.db.delete(schema.movies);
    });
    describe('addMovie', () => {
        it('should create a new movie and return it', async () => {
            const movieData = {
                title: 'Test Movie',
                tmdbId: '12345',
                posterPath: '/test/poster.jpg',
                releaseDate: '2023-01-01',
                overview: 'Test overview',
                genres: ['Action', 'Drama'],
            };
            const result = await MovieService_1.MovieService.addMovie(movieData, user);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('title', movieData.title);
            expect(result).toHaveProperty('tmdbId', movieData.tmdbId);
            expect(result).toHaveProperty('posterPath', movieData.posterPath);
            // Check database
            const movies = await test_db_1.db.select().from(schema.movies);
            expect(movies.length).toBe(1);
            expect(movies[0].title).toBe(movieData.title);
            expect(movies[0].userId).toBe(user.id);
        });
    });
    describe('getUserMovies', () => {
        beforeEach(async () => {
            // Create test movies
            await test_db_1.db.insert(schema.movies).values([
                {
                    title: 'Movie 1',
                    tmdbId: '111',
                    userId: user.id,
                },
                {
                    title: 'Movie 2',
                    tmdbId: '222',
                    userId: user.id,
                },
                {
                    title: 'Movie 3',
                    tmdbId: '333',
                    userId: 999, // Different user
                },
            ]);
        });
        it('should return only movies for the specified user', async () => {
            const movies = await MovieService_1.MovieService.getUserMovies(user);
            expect(movies).toBeInstanceOf(Array);
            expect(movies.length).toBe(2);
            expect(movies[0]).toHaveProperty('title');
            expect(movies.map((m) => m.title)).toContain('Movie 1');
            expect(movies.map((m) => m.title)).toContain('Movie 2');
            expect(movies.map((m) => m.title)).not.toContain('Movie 3');
        });
    });
    describe('getMovie', () => {
        let movieId;
        beforeEach(async () => {
            // Create a test movie
            const result = await test_db_1.db
                .insert(schema.movies)
                .values({
                title: 'Get By ID Movie',
                tmdbId: '12345',
                userId: user.id,
            })
                .returning();
            movieId = result[0].id;
        });
        it('should return movie when valid ID is provided', async () => {
            const movie = await MovieService_1.MovieService.getMovie(movieId, user);
            expect(movie).toHaveProperty('id', movieId);
            expect(movie).toHaveProperty('title', 'Get By ID Movie');
            expect(movie).toHaveProperty('isFavorite', false);
        });
        it('should throw error when movie does not exist', async () => {
            await expect(MovieService_1.MovieService.getMovie(9999, user)).rejects.toThrow('Movie not found');
        });
    });
    describe('updateMovie', () => {
        let movieId;
        beforeEach(async () => {
            // Create a test movie
            const result = await test_db_1.db
                .insert(schema.movies)
                .values({
                title: 'Original Title',
                tmdbId: '12345',
                overview: 'Original overview',
                userId: user.id,
            })
                .returning();
            movieId = result[0].id;
        });
        it('should update movie and return updated data', async () => {
            const updateData = {
                title: 'Updated Title',
                rating: 5,
                review: 'Great movie!',
            };
            const result = await MovieService_1.MovieService.updateMovie(movieId, updateData, user);
            expect(result).toHaveProperty('id', movieId);
            expect(result).toHaveProperty('title', updateData.title);
            expect(result).toHaveProperty('rating', updateData.rating);
            expect(result).toHaveProperty('review', updateData.review);
            expect(result).toHaveProperty('tmdbId', '12345'); // Unchanged field
            // Check database
            const movies = await test_db_1.db
                .select()
                .from(schema.movies)
                .where((0, drizzle_orm_1.eq)(schema.movies.id, movieId));
            expect(movies[0].title).toBe(updateData.title);
            expect(movies[0].rating).toBe(updateData.rating);
        });
        it('should throw error when movie does not exist', async () => {
            await expect(MovieService_1.MovieService.updateMovie(9999, { title: 'Updated Title' }, user)).rejects.toThrow('Movie not found');
        });
    });
    describe('deleteMovie', () => {
        let movieId;
        beforeEach(async () => {
            // Create a test movie
            const result = await test_db_1.db
                .insert(schema.movies)
                .values({
                title: 'Delete Me',
                tmdbId: '12345',
                userId: user.id,
            })
                .returning();
            movieId = result[0].id;
        });
        it('should delete movie', async () => {
            await MovieService_1.MovieService.deleteMovie(movieId, user);
            // Check database
            const movies = await test_db_1.db
                .select()
                .from(schema.movies)
                .where((0, drizzle_orm_1.eq)(schema.movies.id, movieId));
            expect(movies.length).toBe(0);
        });
        it('should throw error when movie does not exist', async () => {
            await expect(MovieService_1.MovieService.deleteMovie(9999, user)).rejects.toThrow('Movie not found');
        });
    });
});
//# sourceMappingURL=MovieService.test.js.map