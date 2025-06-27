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
const WatchlistMovieService_1 = require("../../services/WatchlistMovieService");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const setup_1 = require("../setup");
const utils_1 = require("../utils");
const drizzle_orm_1 = require("drizzle-orm");
describe('WatchlistMovieService', () => {
    let user;
    let watchlistId;
    let movieId;
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
        // Create test user, watchlist and movie
        const { user: testUser } = await (0, utils_1.createTestUser)();
        user = testUser;
        const watchlist = await (0, utils_1.createTestWatchlist)({ name: 'Test Watchlist' }, user.id);
        watchlistId = watchlist.id;
        const movie = await (0, utils_1.createTestMovie)({ title: 'Test Movie' }, user.id);
        movieId = movie.id;
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear watchlist movies before each test
        await test_db_1.db.delete(schema.watchlistMovies);
    });
    describe('addMovieToWatchlist', () => {
        it('should add a movie to watchlist and return it', async () => {
            const result = await WatchlistMovieService_1.WatchlistMovieService.addMovieToWatchlist(watchlistId, movieId, user);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('watchlistId', watchlistId);
            expect(result).toHaveProperty('movieId', movieId);
            // Check database
            const watchlistMovies = await test_db_1.db.select().from(schema.watchlistMovies);
            expect(watchlistMovies.length).toBe(1);
            expect(watchlistMovies[0].watchlistId).toBe(watchlistId);
            expect(watchlistMovies[0].movieId).toBe(movieId);
        });
        it('should throw error if movie is already in watchlist', async () => {
            // First add the movie to watchlist
            await test_db_1.db.insert(schema.watchlistMovies).values({
                watchlistId,
                movieId,
            });
            // Try to add it again
            await expect(WatchlistMovieService_1.WatchlistMovieService.addMovieToWatchlist(watchlistId, movieId, user)).rejects.toThrow('Movie is already in the watchlist');
        });
        it('should throw error if watchlist does not exist', async () => {
            const nonExistentWatchlistId = 9999;
            await expect(WatchlistMovieService_1.WatchlistMovieService.addMovieToWatchlist(nonExistentWatchlistId, movieId, user)).rejects.toThrow('Watchlist not found');
        });
        it('should throw error if user does not have permission', async () => {
            // Create a watchlist owned by a different user
            const otherUserWatchlist = await (0, utils_1.createTestWatchlist)({ name: 'Other User Watchlist' }, 999);
            await expect(WatchlistMovieService_1.WatchlistMovieService.addMovieToWatchlist(otherUserWatchlist.id, movieId, user)).rejects.toThrow('You do not have permission to modify this watchlist');
        });
    });
    describe('getWatchlistMovies', () => {
        beforeEach(async () => {
            // Create test movies
            const movie1 = await (0, utils_1.createTestMovie)({ title: 'Watchlist Movie 1' }, user.id);
            const movie2 = await (0, utils_1.createTestMovie)({ title: 'Watchlist Movie 2' }, user.id);
            // Create another watchlist
            const otherWatchlist = await (0, utils_1.createTestWatchlist)({ name: 'Other Watchlist' }, user.id);
            // Add movies to watchlists
            await test_db_1.db.insert(schema.watchlistMovies).values([
                { watchlistId, movieId: movie1.id },
                { watchlistId, movieId: movie2.id },
                { watchlistId: otherWatchlist.id, movieId }, // Different watchlist
            ]);
        });
        it('should return movies for the specified watchlist', async () => {
            const movies = await WatchlistMovieService_1.WatchlistMovieService.getWatchlistMovies(watchlistId, user);
            expect(movies).toBeInstanceOf(Array);
            expect(movies.length).toBe(2);
            expect(movies[0]).toHaveProperty('title');
            expect(movies.map((m) => m.title)).toContain('Watchlist Movie 1');
            expect(movies.map((m) => m.title)).toContain('Watchlist Movie 2');
            expect(movies.map((m) => m.title)).not.toContain('Test Movie');
        });
        it('should throw error if watchlist does not exist', async () => {
            const nonExistentWatchlistId = 9999;
            await expect(WatchlistMovieService_1.WatchlistMovieService.getWatchlistMovies(nonExistentWatchlistId, user)).rejects.toThrow('Watchlist not found');
        });
        it('should throw error if user does not have permission', async () => {
            // Create a private watchlist owned by a different user
            const otherUserWatchlist = await (0, utils_1.createTestWatchlist)({ name: 'Private Watchlist', isPublic: false }, 999);
            await expect(WatchlistMovieService_1.WatchlistMovieService.getWatchlistMovies(otherUserWatchlist.id, user)).rejects.toThrow('You do not have permission to view this watchlist');
        });
    });
    describe('removeMovieFromWatchlist', () => {
        beforeEach(async () => {
            // Add movie to watchlist
            await test_db_1.db.insert(schema.watchlistMovies).values({
                watchlistId,
                movieId,
            });
        });
        it('should remove movie from watchlist', async () => {
            await WatchlistMovieService_1.WatchlistMovieService.removeMovieFromWatchlist(watchlistId, movieId, user);
            // Check database
            const watchlistMovies = await test_db_1.db
                .select()
                .from(schema.watchlistMovies)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.watchlistMovies.watchlistId, watchlistId), (0, drizzle_orm_1.eq)(schema.watchlistMovies.movieId, movieId)));
            expect(watchlistMovies.length).toBe(0);
        });
        it('should throw error when movie is not in watchlist', async () => {
            const nonExistentMovieId = 9999;
            await expect(WatchlistMovieService_1.WatchlistMovieService.removeMovieFromWatchlist(watchlistId, nonExistentMovieId, user)).rejects.toThrow('Movie is not in the watchlist');
        });
        it('should throw error if watchlist does not exist', async () => {
            const nonExistentWatchlistId = 9999;
            await expect(WatchlistMovieService_1.WatchlistMovieService.removeMovieFromWatchlist(nonExistentWatchlistId, movieId, user)).rejects.toThrow('Watchlist not found');
        });
        it('should throw error if user does not have permission', async () => {
            // Create a watchlist owned by a different user
            const otherUserWatchlist = await (0, utils_1.createTestWatchlist)({ name: 'Other User Watchlist' }, 999);
            await expect(WatchlistMovieService_1.WatchlistMovieService.removeMovieFromWatchlist(otherUserWatchlist.id, movieId, user)).rejects.toThrow('You do not have permission to modify this watchlist');
        });
    });
});
//# sourceMappingURL=WatchlistMovieService.test.js.map