import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { config } from './config';

import authRoutes from './routes/auth';
import movieRoutes from './routes/movies';
import watchlistRoutes from './routes/watchlists';
import favoriteRoutes from './routes/favorites';
import movieReviewRoutes from './routes/movieReviews';
import postRoutes from './routes/posts';
import analyticsRoutes from './routes/analytics';

import { analyticsMiddleware } from './middleware/analytics';

import { generateCsrfToken } from './middleware/csrf';
import errorHandler from './middleware/errorHandler';
import NotFoundHandler from './middleware/notFound';

const app = express();
const PORT = config.server.port;

const limiter = rateLimit({
	windowMs: config.rateLimit.windowMs,
	max: config.rateLimit.maxRequestsPerWindow,
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many requests from this IP, please try again later',
});

app.use(limiter);

app.use(
	helmet({
		contentSecurityPolicy: config.server.isProduction ? undefined : false,
	})
);

app.use((req, res, next) => {
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('X-XSS-Protection', '1; mode=block');
	res.setHeader(
		'Strict-Transport-Security',
		'max-age=31536000; includeSubDomains'
	);
	next();
});

app.use(
	cors({
		origin: config.security.cors.origin,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: config.security.cors.credentials,
		allowedHeaders: [
			'Content-Type',
			'Authorization',
			'X-CSRF-Token',
			'X-API-Client',
		],
	})
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(config.security.cookieSecret));
app.use(analyticsMiddleware);
app.get('/api/v1/csrf-token', generateCsrfToken);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/movies', movieRoutes);
app.use('/api/v1/watchlists', watchlistRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/reviews', movieReviewRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/', (_req, res) => {
	res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use(errorHandler as ErrorRequestHandler);
app.use(NotFoundHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
	console.log(
		`Server is running on http://0.0.0.0:${PORT} in ${config.server.nodeEnv} mode`
	);
	console.log(`Access from local network: ${config.server.CLIENT_URL}`);
});

export default app;
