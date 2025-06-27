"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const auth_1 = __importDefault(require("./routes/auth"));
const movies_1 = __importDefault(require("./routes/movies"));
const watchlists_1 = __importDefault(require("./routes/watchlists"));
const favorites_1 = __importDefault(require("./routes/favorites"));
const movieReviews_1 = __importDefault(require("./routes/movieReviews"));
const posts_1 = __importDefault(require("./routes/posts"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const analytics_2 = require("./middleware/analytics");
const csrf_1 = require("./middleware/csrf");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const notFound_1 = __importDefault(require("./middleware/notFound"));
const app = (0, express_1.default)();
const PORT = config_1.config.server.port;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequestsPerWindow,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: config_1.config.server.isProduction ? undefined : false,
}));
// Apply security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});
app.use((0, cors_1.default)({
    origin: config_1.config.security.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: config_1.config.security.cors.credentials,
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'X-API-Client',
    ],
}));
// Middleware
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)(config_1.config.security.cookieSecret));
app.use(analytics_2.analyticsMiddleware);
// CSRF token endpoint
app.get('/api/v1/csrf-token', csrf_1.generateCsrfToken);
// Routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/movies', movies_1.default);
app.use('/api/v1/watchlists', watchlists_1.default);
app.use('/api/v1/favorites', favorites_1.default);
app.use('/api/v1/reviews', movieReviews_1.default);
app.use('/api/v1/posts', posts_1.default);
app.use('/api/v1/analytics', analytics_1.default);
app.get('/', (_req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
app.use(errorHandler_1.default);
app.use(notFound_1.default);
app.listen(PORT, () => {
    console.log(`Server is running  http://localhost:${PORT} in ${config_1.config.server.nodeEnv} mode`);
});
exports.default = app;
//# sourceMappingURL=index.js.map