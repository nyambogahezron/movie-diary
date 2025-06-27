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
describe('MovieController', () => {
    const app = (0, test_app_1.createTestApp)();
    const request = (0, supertest_1.default)(app);
    let authToken;
    let userId;
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
        // Create test user
        const { user, token } = await (0, utils_1.createTestUser)();
        authToken = token;
        userId = user.id;
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear movies before each test
        await test_db_1.db.delete(schema.movies);
    });
    describe('POST /api/movies', () => {
        it('should create a new movie', async () => {
            const movieData = {
                title: 'Test Movie',
                tmdbId: '12345',
                posterPath: '/test/path.jpg',
                releaseDate: '2023-01-01',
                overview: 'Test overview',
                genres: JSON.stringify(['Action', 'Drama']),
            };
            const response = await (0, utils_1.attachAuthCookie)(request.post('/api/movies'), authToken).send(movieData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Movie created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.title).toBe(movieData.title);
            expect(response.body.data.tmdbId).toBe(movieData.tmdbId);
            // Check database
            const movies = await test_db_1.db.select().from(schema.movies);
            expect(movies.length).toBe(1);
            expect(movies[0].title).toBe(movieData.title);
        });
        it('should return 400 if required fields are missing', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.post('/api/movies'), authToken).send({
                // Missing required fields
                posterPath: '/test/path.jpg',
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.post('/api/movies').send({
                title: 'Unauthorized Movie',
                tmdbId: '12345',
            });
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/movies', () => {
        beforeEach(async () => {
            // Create test movies
            await (0, utils_1.createTestMovie)({ title: 'Movie 1', tmdbId: '111' }, userId);
            await (0, utils_1.createTestMovie)({ title: 'Movie 2', tmdbId: '222' }, userId);
            await (0, utils_1.createTestMovie)({ title: 'Movie 3', tmdbId: '333' }, userId);
        });
        it('should get all movies for the user', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.get('/api/movies'), authToken);
            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('title');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.get('/api/movies');
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/movies/:id', () => {
        let movieId;
        beforeEach(async () => {
            // Create a test movie
            const movie = await (0, utils_1.createTestMovie)({ title: 'Test Movie', tmdbId: '12345' }, userId);
            movieId = movie.id;
        });
        it('should get a movie by id', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.get(`/api/movies/${movieId}`), authToken);
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('id', movieId);
            expect(response.body.data).toHaveProperty('title', 'Test Movie');
        });
        it('should return 404 if movie not found', async () => {
            const response = await request
                .get('/api/movies/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('PUT /api/movies/:id', () => {
        let movieId;
        beforeEach(async () => {
            // Create a test movie
            const movie = await (0, utils_1.createTestMovie)({ title: 'Original Title', tmdbId: '12345' }, userId);
            movieId = movie.id;
        });
        it('should update a movie', async () => {
            const updateData = {
                title: 'Updated Title',
                rating: 5,
                review: 'Great movie!',
            };
            const response = await request
                .put(`/api/movies/${movieId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Movie updated successfully');
            expect(response.body.data).toHaveProperty('title', updateData.title);
            expect(response.body.data).toHaveProperty('rating', updateData.rating);
            expect(response.body.data).toHaveProperty('review', updateData.review);
            // Check database
            const movies = await test_db_1.db
                .select()
                .from(schema.movies)
                .where((0, drizzle_orm_1.sql) `${schema.movies.id} = ${movieId}`);
            expect(movies[0].title).toBe(updateData.title);
        });
        it('should return 404 if movie not found', async () => {
            const response = await request
                .put('/api/movies/99999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Updated Title' });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('DELETE /api/movies/:id', () => {
        let movieId;
        beforeEach(async () => {
            // Create a test movie
            const movie = await (0, utils_1.createTestMovie)({ title: 'Delete Me', tmdbId: '12345' }, userId);
            movieId = movie.id;
        });
        it('should delete a movie', async () => {
            const response = await request
                .delete(`/api/movies/${movieId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Movie deleted successfully');
            // Check database
            const movies = await test_db_1.db
                .select()
                .from(schema.movies)
                .where((0, drizzle_orm_1.sql) `${schema.movies.id} = ${movieId}`);
            expect(movies.length).toBe(0);
        });
        it('should return 404 if movie not found', async () => {
            const response = await request
                .delete('/api/movies/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
});
//# sourceMappingURL=MovieController.test.js.map