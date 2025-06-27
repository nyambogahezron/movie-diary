import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
if (fs.existsSync(path.join(process.cwd(), envFile))) {
	dotenv.config({ path: envFile });
} else {
	dotenv.config();
}

export const config = {
	server: {
		port: process.env.PORT || 5000,
		nodeEnv: process.env.NODE_ENV || 'development',
		isProduction: process.env.NODE_ENV === 'production',
		CLIENT_URL: process.env.CLIENT_URL,
	},

	security: {
		jwtSecret: process.env.JWT_SECRET || getSecretKey('jwt'),
		jwtRefreshSecret:
			process.env.JWT_REFRESH_SECRET || getSecretKey('jwtRefresh'),
		cookieSecret: process.env.COOKIE_SECRET || getSecretKey('cookie'),
		accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
		refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
		cors: {
			origin: process.env.CLIENT_URL || [
				'http://localhost:3000',
				'http://127.0.0.1:3000',
				/^http:\/\/192\.168\.213\.\d+:3000$/,
				/^http:\/\/192\.168\.213\.\d+:5173$/,
				/^http:\/\/192\.168\.213\.\d+:4173$/,
			],
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

function getSecretKey(name: string): string {
	const crypto = require('crypto');
	console.warn(
		`WARNING: ${name.toUpperCase()}_SECRET not provided in environment variables. Using auto-generated key.`
	);
	return crypto.randomBytes(64).toString('hex');
}

function validateConfig() {
	const requiredConfigs: Record<string, string | undefined> = {
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
