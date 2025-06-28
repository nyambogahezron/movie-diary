"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("../routes/auth"));
const movies_1 = __importDefault(require("../routes/movies"));
const watchlists_1 = __importDefault(require("../routes/watchlists"));
const favorites_1 = __importDefault(require("../routes/favorites"));
// Mock the database connection
jest.mock('../db', () => {
    return {
        db: require('../db/test-db').db,
    };
});
// Create Express app for testing
function createTestApp() {
    // Create Express app
    const app = (0, express_1.default)();
    // Middleware
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    app.use((0, cookie_parser_1.default)());
    // Routes
    app.use('/api/auth', auth_1.default);
    app.use('/api/movies', movies_1.default);
    app.use('/api/watchlists', watchlists_1.default);
    app.use('/api/favorites', favorites_1.default);
    // Health check route
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });
    return app;
}
//# sourceMappingURL=test-app.js.map