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
describe('WatchlistController', () => {
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
        // Clear watchlists before each test
        await test_db_1.db.delete(schema.watchlists);
    });
    describe('POST /api/watchlists', () => {
        it('should create a new watchlist', async () => {
            const watchlistData = {
                name: 'My Watchlist',
                description: 'Movies to watch later',
                isPublic: true,
            };
            const response = await (0, utils_1.attachAuthCookie)(request.post('/api/watchlists'), authToken).send(watchlistData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Watchlist created successfully');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.name).toBe(watchlistData.name);
            expect(response.body.data.description).toBe(watchlistData.description);
            expect(response.body.data.isPublic).toBe(watchlistData.isPublic);
            // Check database
            const watchlists = await test_db_1.db.select().from(schema.watchlists);
            expect(watchlists.length).toBe(1);
            expect(watchlists[0].name).toBe(watchlistData.name);
        });
        it('should return 400 if required fields are missing', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.post('/api/watchlists'), authToken).send({
                // Missing name
                description: 'Description only',
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.post('/api/watchlists').send({
                name: 'Unauthorized Watchlist',
            });
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/watchlists', () => {
        beforeEach(async () => {
            // Create test watchlists
            await (0, utils_1.createTestWatchlist)({ name: 'Watchlist 1' }, userId);
            await (0, utils_1.createTestWatchlist)({ name: 'Watchlist 2' }, userId);
            await (0, utils_1.createTestWatchlist)({ name: 'Watchlist 3' }, userId);
        });
        it('should get all watchlists for the user', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.get('/api/watchlists'), authToken);
            expect(response.status).toBe(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
            expect(response.body.data[0]).toHaveProperty('id');
            expect(response.body.data[0]).toHaveProperty('name');
        });
        it('should return 401 if not authenticated', async () => {
            const response = await request.get('/api/watchlists');
            expect(response.status).toBe(401);
        });
    });
    describe('GET /api/watchlists/:id', () => {
        let watchlistId;
        beforeEach(async () => {
            // Create a test watchlist
            const watchlist = await (0, utils_1.createTestWatchlist)({ name: 'Test Watchlist' }, userId);
            watchlistId = watchlist.id;
        });
        it('should get a watchlist by id', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.get(`/api/watchlists/${watchlistId}`), authToken);
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('id', watchlistId);
            expect(response.body.data).toHaveProperty('name', 'Test Watchlist');
        });
        it('should return 404 if watchlist not found', async () => {
            const response = await request
                .get('/api/watchlists/99999')
                .set('Authorization', `Bearer ${authToken}`);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('PUT /api/watchlists/:id', () => {
        let watchlistId;
        beforeEach(async () => {
            // Create a test watchlist
            const watchlist = await (0, utils_1.createTestWatchlist)({ name: 'Original Name' }, userId);
            watchlistId = watchlist.id;
        });
        it('should update a watchlist', async () => {
            const updateData = {
                name: 'Updated Name',
                description: 'Updated description',
                isPublic: true,
            };
            const response = await (0, utils_1.attachAuthCookie)(request.put(`/api/watchlists/${watchlistId}`), authToken).send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Watchlist updated successfully');
            expect(response.body.data).toHaveProperty('name', updateData.name);
            expect(response.body.data).toHaveProperty('description', updateData.description);
            expect(response.body.data).toHaveProperty('isPublic', updateData.isPublic);
            // Check database
            const watchlists = await test_db_1.db
                .select()
                .from(schema.watchlists)
                .where((0, drizzle_orm_1.sql) `${schema.watchlists.id} = ${watchlistId}`);
            expect(watchlists[0].name).toBe(updateData.name);
        });
        it('should return 404 if watchlist not found', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.put('/api/watchlists/99999'), authToken).send({ name: 'Updated Name' });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('DELETE /api/watchlists/:id', () => {
        let watchlistId;
        beforeEach(async () => {
            // Create a test watchlist
            const watchlist = await (0, utils_1.createTestWatchlist)({ name: 'Delete Me' }, userId);
            watchlistId = watchlist.id;
        });
        it('should delete a watchlist', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.delete(`/api/watchlists/${watchlistId}`), authToken);
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Watchlist deleted successfully');
            // Check database
            const watchlists = await test_db_1.db
                .select()
                .from(schema.watchlists)
                .where((0, drizzle_orm_1.sql) `${schema.watchlists.id} = ${watchlistId}`);
            expect(watchlists.length).toBe(0);
        });
        it('should return 404 if watchlist not found', async () => {
            const response = await (0, utils_1.attachAuthCookie)(request.delete('/api/watchlists/99999'), authToken);
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error');
        });
    });
});
//# sourceMappingURL=WatchlistController.test.js.map