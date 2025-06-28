import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/auth';
import movieRoutes from '../routes/movies';
import watchlistRoutes from '../routes/watchlists';
import favoriteRoutes from '../routes/favorites';
import { setupTestDatabase } from './setup';

// Mock the database connection
jest.mock('../db', () => {
	return {
		db: require('../db/test-db').db,
	};
});

// Create Express app for testing
export function createTestApp() {
	// Create Express app
	const app = express();

	// Middleware
	app.use(express.json());
	app.use(cors());
	app.use(cookieParser());

	// Routes
	app.use('/api/auth', authRoutes);
	app.use('/api/movies', movieRoutes);
	app.use('/api/watchlists', watchlistRoutes);
	app.use('/api/favorites', favoriteRoutes);

	// Health check route
	app.get('/health', (_req, res) => {
		res.status(200).json({ status: 'ok', message: 'Server is running' });
	});

	return app;
}
