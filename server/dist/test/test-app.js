"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestApp = createTestApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const auth_1 = __importDefault(require("../routes/auth"));
const movies_1 = __importDefault(require("../routes/movies"));
const watchlists_1 = __importDefault(require("../routes/watchlists"));
const favorites_1 = __importDefault(require("../routes/favorites"));
const movieReviews_1 = __importDefault(require("../routes/movieReviews"));
const posts_1 = __importDefault(require("../routes/posts"));
const analytics_1 = __importDefault(require("../routes/analytics"));
const admin_1 = __importDefault(require("../routes/admin"));
const csrf_1 = require("../middleware/csrf");
const errorHandler_1 = __importDefault(require("../middleware/errorHandler"));
const notFound_1 = __importDefault(require("../middleware/notFound"));
jest.mock('../db', () => {
    return {
        db: require('../db/test-db').db,
    };
});
function createTestApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: '1mb' }));
    // Serve static files for uploads in test environment
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
    app.use((0, cors_1.default)({
        origin: true,
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-CSRF-Token',
            'X-API-Client',
        ],
    }));
    app.use((0, cookie_parser_1.default)(config_1.config.security.cookieSecret));
    app.get('/api/v1/csrf-token', csrf_1.generateCsrfToken);
    app.use('/api/v1/auth', auth_1.default);
    app.use('/api/v1/movies', movies_1.default);
    app.use('/api/v1/watchlists', watchlists_1.default);
    app.use('/api/v1/favorites', favorites_1.default);
    app.use('/api/v1/reviews', movieReviews_1.default);
    app.use('/api/v1/posts', posts_1.default);
    app.use('/api/v1/analytics', analytics_1.default);
    app.use('/api/v1/admin', admin_1.default);
    app.get('/', (_req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });
    app.use(errorHandler_1.default);
    app.use(notFound_1.default);
    return app;
}
//# sourceMappingURL=test-app.js.map