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
const WatchlistService_1 = require("../../services/WatchlistService");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const setup_1 = require("../setup");
const utils_1 = require("../utils");
const drizzle_orm_1 = require("drizzle-orm");
describe('WatchlistService', () => {
    let user;
    beforeAll(async () => {
        // Setup fresh database for each test suite
        await (0, setup_1.setupTestDatabase)();
    });
    beforeEach(async () => {
        // Clear any existing data
        await test_db_1.db.delete(schema.watchlistMovies);
        await test_db_1.db.delete(schema.watchlists);
        await test_db_1.db.delete(schema.users);
        // Create a test user for each test
        const { user: testUser } = await (0, utils_1.createTestUser)();
        user = testUser;
    });
    describe('createWatchlist', () => {
        it('should create a new watchlist and return it', async () => {
            const watchlistData = {
                name: 'My Watchlist',
                description: 'Test description',
                isPublic: true,
            };
            const result = await WatchlistService_1.WatchlistService.createWatchlist(watchlistData, user);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('name', watchlistData.name);
            expect(result).toHaveProperty('description', watchlistData.description);
            expect(result).toHaveProperty('isPublic', watchlistData.isPublic);
            expect(result).toHaveProperty('userId', user.id);
            // Check database
            const watchlists = await test_db_1.db.select().from(schema.watchlists);
            expect(watchlists.length).toBe(1);
            expect(watchlists[0].name).toBe(watchlistData.name);
            expect(watchlists[0].userId).toBe(user.id);
        });
    });
    describe('getWatchlists', () => {
        beforeEach(async () => {
            // Create test watchlists
            await test_db_1.db.insert(schema.watchlists).values([
                {
                    name: 'Watchlist 1',
                    description: 'Test 1',
                    isPublic: false,
                    userId: user.id,
                },
                {
                    name: 'Watchlist 2',
                    description: 'Test 2',
                    isPublic: true,
                    userId: user.id,
                },
                {
                    name: 'Watchlist 3',
                    description: 'Test 3',
                    isPublic: false,
                    userId: 999, // Different user
                },
            ]);
        });
        it('should return only watchlists for the specified user', async () => {
            const watchlists = await WatchlistService_1.WatchlistService.getWatchlists(user);
            expect(watchlists).toBeInstanceOf(Array);
            expect(watchlists.length).toBe(2);
            expect(watchlists[0]).toHaveProperty('name');
            expect(watchlists.map((w) => w.name)).toContain('Watchlist 1');
            expect(watchlists.map((w) => w.name)).toContain('Watchlist 2');
            expect(watchlists.map((w) => w.name)).not.toContain('Watchlist 3');
        });
    });
    describe('getWatchlist', () => {
        let watchlistId;
        beforeEach(async () => {
            // Create a test watchlist
            const result = await test_db_1.db
                .insert(schema.watchlists)
                .values({
                name: 'Get By ID Watchlist',
                description: 'Test description',
                isPublic: false,
                userId: user.id,
            })
                .returning();
            watchlistId = result[0].id;
        });
        it('should return watchlist when valid ID is provided', async () => {
            const watchlist = await WatchlistService_1.WatchlistService.getWatchlist(watchlistId, user);
            expect(watchlist).toHaveProperty('id', watchlistId);
            expect(watchlist).toHaveProperty('name', 'Get By ID Watchlist');
            expect(watchlist).toHaveProperty('userId', user.id);
        });
        it('should throw error when watchlist does not exist', async () => {
            await expect(WatchlistService_1.WatchlistService.getWatchlist(9999, user)).rejects.toThrow('Watchlist not found');
        });
        it('should throw error when user does not have permission', async () => {
            // Create a watchlist owned by a different user
            const otherUserWatchlist = await test_db_1.db
                .insert(schema.watchlists)
                .values({
                name: 'Private Watchlist',
                description: 'Private description',
                isPublic: false,
                userId: 999,
            })
                .returning();
            await expect(WatchlistService_1.WatchlistService.getWatchlist(otherUserWatchlist[0].id, user)).rejects.toThrow('You do not have permission to view this watchlist');
        });
    });
    describe('updateWatchlist', () => {
        let watchlistId;
        beforeEach(async () => {
            // Create a test watchlist
            const result = await test_db_1.db
                .insert(schema.watchlists)
                .values({
                name: 'Original Name',
                description: 'Original description',
                isPublic: false,
                userId: user.id,
            })
                .returning();
            watchlistId = result[0].id;
        });
        it('should update watchlist and return updated data', async () => {
            const updateData = {
                name: 'Updated Name',
                description: 'Updated description',
                isPublic: true,
            };
            const result = await WatchlistService_1.WatchlistService.updateWatchlist(watchlistId, updateData, user);
            expect(result).toHaveProperty('id', watchlistId);
            expect(result).toHaveProperty('name', updateData.name);
            expect(result).toHaveProperty('description', updateData.description);
            expect(result).toHaveProperty('isPublic', updateData.isPublic);
            // Check database
            const watchlists = await test_db_1.db
                .select()
                .from(schema.watchlists)
                .where((0, drizzle_orm_1.eq)(schema.watchlists.id, watchlistId));
            expect(watchlists[0].name).toBe(updateData.name);
            expect(watchlists[0].isPublic).toBe(updateData.isPublic);
        });
        it('should throw error when watchlist does not exist', async () => {
            await expect(WatchlistService_1.WatchlistService.updateWatchlist(9999, { name: 'Updated Name' }, user)).rejects.toThrow('Watchlist not found');
        });
        it('should throw error when user does not have permission', async () => {
            // Create a watchlist owned by a different user
            const otherUserWatchlist = await test_db_1.db
                .insert(schema.watchlists)
                .values({
                name: 'Private Watchlist',
                description: 'Private description',
                isPublic: false,
                userId: 999,
            })
                .returning();
            await expect(WatchlistService_1.WatchlistService.updateWatchlist(otherUserWatchlist[0].id, { name: 'Updated Name' }, user)).rejects.toThrow('You do not have permission to update this watchlist');
        });
    });
    describe('deleteWatchlist', () => {
        let watchlistId;
        beforeEach(async () => {
            // Create a test watchlist
            const result = await test_db_1.db
                .insert(schema.watchlists)
                .values({
                name: 'Delete Me',
                description: 'To be deleted',
                isPublic: false,
                userId: user.id,
            })
                .returning();
            watchlistId = result[0].id;
        });
        it('should delete watchlist', async () => {
            await WatchlistService_1.WatchlistService.deleteWatchlist(watchlistId, user);
            // Check database
            const watchlists = await test_db_1.db
                .select()
                .from(schema.watchlists)
                .where((0, drizzle_orm_1.eq)(schema.watchlists.id, watchlistId));
            expect(watchlists.length).toBe(0);
        });
        it('should throw error when watchlist does not exist', async () => {
            await expect(WatchlistService_1.WatchlistService.deleteWatchlist(9999, user)).rejects.toThrow('Watchlist not found');
        });
        it('should throw error when user does not have permission', async () => {
            // Create a watchlist owned by a different user
            const otherUserWatchlist = await test_db_1.db
                .insert(schema.watchlists)
                .values({
                name: 'Private Watchlist',
                description: 'Private description',
                isPublic: false,
                userId: 999,
            })
                .returning();
            await expect(WatchlistService_1.WatchlistService.deleteWatchlist(otherUserWatchlist[0].id, user)).rejects.toThrow('You do not have permission to delete this watchlist');
        });
    });
});
//# sourceMappingURL=WatchlistService.test.js.map