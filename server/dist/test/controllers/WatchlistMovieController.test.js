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
describe('WatchlistMovieController', () => {
    const app = (0, test_app_1.createTestApp)();
    const request = (0, supertest_1.default)(app);
    let authToken;
    let userId;
    let watchlistId;
    let movieId;
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
        // Create test user
        const { user, token } = await (0, utils_1.createTestUser)();
        authToken = token;
        userId = user.id;
        // Create a test watchlist
        const watchlist = await (0, utils_1.createTestWatchlist)({ name: 'Test Watchlist' }, userId);
        watchlistId = watchlist.id;
        // Create a test movie
        const movie = await (0, utils_1.createTestMovie)({ title: 'Test Movie' }, userId);
        movieId = movie.id;
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear watchlistMovies before each test
        await test_db_1.db.delete(schema.watchlistMovies);
    });
    describe('POST /api/watchlists/:watchlistId/movies', () => {
        it('should add a movie to a watchlist', async () => {
            const response = await request
                .post(`/api/watchlists/${watchlistId}/movies`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ movieId });
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Movie added to watchlist');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data).toHaveProperty('watchlistId', watchlistId);
            expect(response.body.data).toHaveProperty('movieId', movieId);
            // Check database
            const watchlistMovies = await test_db_1.db.select().from(schema.watchlistMovies);
            expect(watchlistMovies.length).toBe(1);
            expect(watchlistMovies[0].watchlistId).toBe(watchlistId);
            expect(watchlistMovies[0].movieId).toBe(movieId);
        });
        it('should return 400 if movie is already in the watchlist', async () => {
            // Add movie to watchlist first
            await test_db_1.db.insert(schema.watchlistMovies).values({
                watchlistId,
                movieId,
            });
            // Try to add it again
            const response = await request
                .post(`/api/watchlists/${watchlistId}/movies`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ movieId });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 404 if watchlist does not exist', async () => {
            const response = await request
                .post('/api/watchlists/99999/movies')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ movieId });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 if movieId is not provided', async () => {
            const response = await request
                .post(`/api/watchlists/${watchlistId}/movies`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request
                .post(`/api/watchlists/${watchlistId}/movies`)
                .send({ movieId });
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/watchlists/:watchlistId/movies', () => {
        beforeEach(async () => {
            // Create test movies and add to watchlist
            const movie1 = await (0, utils_1.createTestMovie)({ title: 'Watchlist Movie 1' }, userId);
            const movie2 = await (0, utils_1.createTestMovie)({ title: 'Watchlist Movie 2' }, userId);
            await test_db_1.db.insert(schema.watchlistMovies).values([
                { watchlistId, movieId: movie1.id },
                { watchlistId, movieId: movie2.id },
                { watchlistId, movieId },
            ]);
        });
        it('should get all movies in a watchlist', async () => {
            const response = await request
                .get(`/api/watchlists/${watchlistId}/movies`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
            // Verify that we get movie details
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('title');
            expect(response.body.data[0]).toHaveProperty('tmdbId');
        });
        it('should return 404 if watchlist does not exist', async () => {
            const response = await request
                .get('/api/watchlists/99999/movies')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.get(`/api/watchlists/${watchlistId}/movies`);
            expect(response.status).toBe(401);
        });
    });
    describe('DELETE /api/watchlists/:watchlistId/movies/:movieId', () => {
        beforeEach(async () => {
            // Add movie to watchlist
            await test_db_1.db.insert(schema.watchlistMovies).values({
                watchlistId,
                movieId,
            });
        });
        it('should remove a movie from a watchlist', async () => {
            const response = await request
                .delete(`/api/watchlists/${watchlistId}/movies/${movieId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Movie removed from watchlist');
            // Check database
            const watchlistMovies = await test_db_1.db
                .select()
                .from(schema.watchlistMovies)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.watchlistMovies.watchlistId, watchlistId), (0, drizzle_orm_1.eq)(schema.watchlistMovies.movieId, movieId)));
            expect(watchlistMovies.length).toBe(0);
        });
        it('should return 404 if movie is not in watchlist', async () => {
            // Use a non-existent movie ID
            const nonExistentMovieId = 99999;
            const response = await request
                .delete(`/api/watchlists/${watchlistId}/movies/${nonExistentMovieId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 404 if watchlist does not exist', async () => {
            const response = await request
                .delete(`/api/watchlists/99999/movies/${movieId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.delete(`/api/watchlists/${watchlistId}/movies/${movieId}`);
            expect(response.status).toBe(401);
        });
    });
});
//# sourceMappingURL=WatchlistMovieController.test.js.map