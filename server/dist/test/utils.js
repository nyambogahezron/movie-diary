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
exports.createTestUser = createTestUser;
exports.createTestMovie = createTestMovie;
exports.createTestWatchlist = createTestWatchlist;
exports.attachAuthCookie = attachAuthCookie;
const test_db_1 = require("../db/test-db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schema = __importStar(require("../db/schema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function createTestUser(userData = {}) {
    const defaultUserData = {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt_1.default.hash('password123', 10),
    };
    const mergedData = { ...defaultUserData, ...userData };
    const insertedUser = await test_db_1.db
        .insert(schema.users)
        .values(mergedData)
        .returning();
    const user = insertedUser[0];
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    return { user, token };
}
async function createTestMovie(movieData = {}, userId) {
    const defaultMovieData = {
        title: 'Test Movie',
        tmdbId: '12345',
        posterPath: '/path/to/poster.jpg',
        releaseDate: '2023-01-01',
        overview: 'Test overview',
        userId,
    };
    const mergedData = { ...defaultMovieData, ...movieData };
    const insertedMovie = await test_db_1.db
        .insert(schema.movies)
        .values(mergedData)
        .returning();
    return insertedMovie[0];
}
async function createTestWatchlist(watchlistData = {}, userId) {
    const defaultWatchlistData = {
        name: 'Test Watchlist',
        description: 'Test description',
        isPublic: false,
        userId,
    };
    const mergedData = { ...defaultWatchlistData, ...watchlistData };
    const insertedWatchlist = await test_db_1.db
        .insert(schema.watchlists)
        .values(mergedData)
        .returning();
    return insertedWatchlist[0];
}
function attachAuthCookie(request, token) {
    return request.set('Cookie', [`accessToken=${token}`]);
}
//# sourceMappingURL=utils.js.map