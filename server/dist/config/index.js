"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
if (fs_1.default.existsSync(path_1.default.join(process.cwd(), envFile))) {
    dotenv_1.default.config({ path: envFile });
}
else {
    dotenv_1.default.config();
}
exports.config = {
    server: {
        port: process.env.PORT || 5000,
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production',
    },
    security: {
        jwtSecret: process.env.JWT_SECRET || getSecretKey('jwt'),
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || getSecretKey('jwtRefresh'),
        cookieSecret: process.env.COOKIE_SECRET || getSecretKey('cookie'),
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
    },
    database: {
        url: process.env.DATABASE_URL || '',
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
        maxRequestsPerWindow: Number(process.env.RATE_LIMIT_MAX) || 100,
    },
};
function getSecretKey(name) {
    const crypto = require('crypto');
    console.warn(`WARNING: ${name.toUpperCase()}_SECRET not provided in environment variables. Using auto-generated key.`);
    return crypto.randomBytes(64).toString('hex');
}
function validateConfig() {
    const requiredConfigs = {
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        COOKIE_SECRET: process.env.COOKIE_SECRET,
    };
    if (process.env.NODE_ENV === 'production') {
        for (const [key, value] of Object.entries(requiredConfigs)) {
            if (!value) {
                console.warn(`WARNING: ${key} is not set in production environment.`);
            }
        }
    }
}
validateConfig();
//# sourceMappingURL=index.js.map