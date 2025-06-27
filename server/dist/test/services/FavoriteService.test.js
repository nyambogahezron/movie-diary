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
const FavoriteService_1 = require("../../services/FavoriteService");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const setup_1 = require("../setup");
const utils_1 = require("../utils");
const drizzle_orm_1 = require("drizzle-orm");
describe('FavoriteService', () => {
    let user;
    let movieId;
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
        // Create test user and movie
        const { user: testUser } = await (0, utils_1.createTestUser)();
        user = testUser;
        const movie = await (0, utils_1.createTestMovie)({ title: 'Test Movie' }, user.id);
        movieId = movie.id;
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear favorites before each test
        await test_db_1.db.delete(schema.favorites);
    });
    describe('addFavorite', () => {
        it('should add a movie to favorites and return it', async () => {
            const result = await FavoriteService_1.FavoriteService.addFavorite(movieId, user);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('userId', user.id);
            expect(result).toHaveProperty('movieId', movieId);
            // Check database
            const favorites = await test_db_1.db.select().from(schema.favorites);
            expect(favorites.length).toBe(1);
            expect(favorites[0].userId).toBe(user.id);
            expect(favorites[0].movieId).toBe(movieId);
        });
        it('should throw error if movie is already in favorites', async () => {
            // First add the movie to favorites
            await test_db_1.db.insert(schema.favorites).values({
                userId: user.id,
                movieId,
            });
            // Try to add it again
            await expect(FavoriteService_1.FavoriteService.addFavorite(movieId, user)).rejects.toThrow('Movie already in favorites');
        });
        it('should throw error if movie does not exist', async () => {
            const nonExistentMovieId = 9999;
            await expect(FavoriteService_1.FavoriteService.addFavorite(nonExistentMovieId, user)).rejects.toThrow('Movie not found');
        });
    });
    describe('getFavoriteMovies', () => {
        beforeEach(async () => {
            // Create test movies
            const movie1 = await (0, utils_1.createTestMovie)({ title: 'Favorite Movie 1' }, user.id);
            const movie2 = await (0, utils_1.createTestMovie)({ title: 'Favorite Movie 2' }, user.id);
            const movie3 = await (0, utils_1.createTestMovie)({ title: 'Not Favorite' }, user.id);
            // Add movies to favorites
            await test_db_1.db.insert(schema.favorites).values([
                { userId: user.id, movieId: movie1.id },
                { userId: user.id, movieId: movie2.id },
            ]);
        });
        it('should return favorite movies for the user', async () => {
            const movies = await FavoriteService_1.FavoriteService.getFavoriteMovies(user);
            expect(movies).toBeInstanceOf(Array);
            expect(movies.length).toBe(2);
            expect(movies[0]).toHaveProperty('title');
            expect(movies.map((m) => m.title)).toContain('Favorite Movie 1');
            expect(movies.map((m) => m.title)).toContain('Favorite Movie 2');
            expect(movies.map((m) => m.title)).not.toContain('Not Favorite');
        });
    });
    describe('isFavorite', () => {
        beforeEach(async () => {
            // Add movie to favorites
            await test_db_1.db.insert(schema.favorites).values({
                userId: user.id,
                movieId,
            });
        });
        it('should return true if movie is in favorites', async () => {
            const result = await FavoriteService_1.FavoriteService.isFavorite(movieId, user);
            expect(result).toBe(true);
        });
        it('should return false if movie is not in favorites', async () => {
            const nonExistentMovieId = 9999;
            const result = await FavoriteService_1.FavoriteService.isFavorite(nonExistentMovieId, user);
            expect(result).toBe(false);
        });
    });
    describe('removeFavorite', () => {
        beforeEach(async () => {
            // Add movie to favorites
            await test_db_1.db.insert(schema.favorites).values({
                userId: user.id,
                movieId,
            });
        });
        it('should remove movie from favorites', async () => {
            await FavoriteService_1.FavoriteService.removeFavorite(movieId, user);
            // Check database
            const favorites = await test_db_1.db
                .select()
                .from(schema.favorites)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.userId, user.id), (0, drizzle_orm_1.eq)(schema.favorites.movieId, movieId)));
            expect(favorites.length).toBe(0);
        });
        it('should throw error when favorite relationship does not exist', async () => {
            const nonExistentMovieId = 9999;
            await expect(FavoriteService_1.FavoriteService.removeFavorite(nonExistentMovieId, user)).rejects.toThrow('Movie is not in favorites');
        });
    });
});
//# sourceMappingURL=FavoriteService.test.js.map