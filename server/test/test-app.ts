import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from '../config';

import authRoutes from '../routes/auth';
import movieRoutes from '../routes/movies';
import watchlistRoutes from '../routes/watchlists';
import favoriteRoutes from '../routes/favorites';
import movieReviewRoutes from '../routes/movieReviews';
import postRoutes from '../routes/posts';
import analyticsRoutes from '../routes/analytics';
import adminRoutes from '../routes/admin';

import { analyticsMiddleware } from '../middleware/analytics';
import { generateCsrfToken } from '../middleware/csrf';
import errorHandler from '../middleware/errorHandler';
import NotFoundHandler from '../middleware/notFound';

jest.mock('../db', () => {
	return {
		db: require('../db/test-db').db,
	};
});

export function createTestApp() {
	const app = express();

	app.use(express.json({ limit: '1mb' }));

	// Serve static files for uploads in test environment
	app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

	app.use(
		cors({
			origin: true,
			credentials: true,
			allowedHeaders: [
				'Content-Type',
				'Authorization',
				'X-CSRF-Token',
				'X-API-Client',
			],
		})
	);
	app.use(cookieParser(config.security.cookieSecret));

	app.get('/api/v1/csrf-token', generateCsrfToken);

	app.use('/api/v1/auth', authRoutes);
	app.use('/api/v1/movies', movieRoutes);
	app.use('/api/v1/watchlists', watchlistRoutes);
	app.use('/api/v1/favorites', favoriteRoutes);
	app.use('/api/v1/reviews', movieReviewRoutes);
	app.use('/api/v1/posts', postRoutes);
	app.use('/api/v1/analytics', analyticsRoutes);
	app.use('/api/v1/admin', adminRoutes);

	app.get('/', (_req, res) => {
		res.status(200).json({ status: 'ok', message: 'Server is running' });
	});

	app.use(errorHandler);
	app.use(NotFoundHandler);

	return app;
}
