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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_app_1 = require("../test-app");
const setup_1 = require("../setup");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const utils_1 = require("../utils");
const drizzle_orm_1 = require("drizzle-orm");
describe('FavoriteController', () => {
    const app = (0, test_app_1.createTestApp)();
    const request = (0, supertest_1.default)(app);
    let authToken;
    let userId;
    let movieId;
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
        // Create test user
        const { user, token } = await (0, utils_1.createTestUser)();
        authToken = token;
        userId = user.id;
        // Create a test movie
        const movie = await (0, utils_1.createTestMovie)({ title: 'Favorite Test Movie' }, userId);
        movieId = movie.id;
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear favorites before each test
        await test_db_1.db.delete(schema.favorites);
    });
    describe('POST /api/favorites', () => {
        it('should add a movie to favorites', async () => {
            const favoriteData = {
                movieId,
            };
            const response = await request
                .post('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .send(favoriteData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Movie added to favorites');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('userId', userId);
            expect(response.body.data).toHaveProperty('movieId', movieId);
            // Check database
            const favorites = await test_db_1.db.select().from(schema.favorites);
            expect(favorites.length).toBe(1);
            expect(favorites[0].movieId).toBe(movieId);
            expect(favorites[0].userId).toBe(userId);
        });
        it('should return 400 if movie is already in favorites', async () => {
            // Add movie to favorites first
            await test_db_1.db.insert(schema.favorites).values({
                userId,
                movieId,
            });
            // Try to add it again
            const response = await request
                .post('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ movieId });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if required fields are missing', async () => {
            const response = await request
                .post('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
            // Missing movieId
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.post('/api/favorites').send({
                movieId,
            });
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/favorites', () => {
        beforeEach(async () => {
            // Create test movies and add to favorites
            const movie1 = await (0, utils_1.createTestMovie)({ title: 'Favorite Movie 1' }, userId);
            const movie2 = await (0, utils_1.createTestMovie)({ title: 'Favorite Movie 2' }, userId);
            await test_db_1.db.insert(schema.favorites).values([
                { userId, movieId: movie1.id },
                { userId, movieId: movie2.id },
                { userId, movieId },
            ]);
        });
        it('should get all favorite movies for the user', async () => {
            const response = await request
                .get('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
            // Verify that we get movie details
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('title');
            expect(response.body.data[0]).toHaveProperty('tmdbId');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.get('/api/favorites');
            expect(response.status).toBe(401);
        });
    });
    describe('DELETE /api/favorites/:movieId', () => {
        beforeEach(async () => {
            // Add movie to favorites
            await test_db_1.db.insert(schema.favorites).values({
                userId,
                movieId,
            });
        });
        it('should remove a movie from favorites', async () => {
            const response = await request
                .delete(`/api/favorites/${movieId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Movie removed from favorites');
            // Check database
            const favorites = await test_db_1.db
                .select()
                .from(schema.favorites)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.favorites.userId, userId), (0, drizzle_orm_1.eq)(schema.favorites.movieId, movieId)));
            expect(favorites.length).toBe(0);
        });
        it('should return 404 if movie is not in favorites', async () => {
            // Use a non-existent movie ID
            const nonExistentMovieId = 99999;
            const response = await request
                .delete(`/api/favorites/${nonExistentMovieId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.delete(`/api/favorites/${movieId}`);
            expect(response.status).toBe(401);
        });
    });
});
//# sourceMappingURL=FavoriteController.test.js.map