import { sql } from 'drizzle-orm';
import {
	text,
	integer,
	pgTable,
	uniqueIndex,
	boolean,
	timestamp,
	serial,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
	'users',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		username: text('username').notNull(),
		email: text('email').notNull(),
		password: text('password').notNull(),
		avatar: text('avatar'),
		role: text('role').default('user').notNull(),
		isEmailVerified: boolean('is_email_verified').default(false).notNull(),
		emailVerificationToken: text('email_verification_token'),
		emailVerificationExpires: text('email_verification_expires'),
		passwordResetToken: text('password_reset_token'),
		passwordResetExpires: text('password_reset_expires'),
		lastLoginAt: text('last_login_at'),
		lastLoginIp: text('last_login_ip'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => {
		return [
			uniqueIndex('users_username_unique').on(table.username),
			uniqueIndex('users_email_unique').on(table.email),
		];
	}
);

export const movies = pgTable('movies', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	tmdbId: text('tmdb_id').notNull(),
	posterPath: text('poster_path'),
	releaseDate: text('release_date'),
	overview: text('overview'),
	rating: integer('rating'),
	watchDate: text('watch_date'),
	review: text('review'),
	genres: text('genres'),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const watchlists = pgTable('watchlists', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	isPublic: boolean('is_public').notNull().default(false),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const watchlistMovies = pgTable('watchlist_movies', {
	id: serial('id').primaryKey(),
	watchlistId: integer('watchlist_id')
		.notNull()
		.references(() => watchlists.id, { onDelete: 'cascade' }),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const favorites = pgTable('favorites', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const movieReviews = pgTable('movie_reviews', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	movieId: integer('movie_id')
		.notNull()
		.references(() => movies.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	rating: integer('rating'),
	isPublic: boolean('is_public').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	tmdbId: text('tmdb_id').notNull(),
	posterPath: text('poster_path'),
	title: text('title').notNull(),
	content: text('content').notNull(),
	likesCount: integer('likes_count').notNull().default(0),
	commentsCount: integer('comments_count').notNull().default(0),
	isPublic: boolean('is_public').notNull().default(true),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const postLikes = pgTable('post_likes', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	postId: integer('post_id')
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const postComments = pgTable('post_comments', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	postId: integer('post_id')
		.notNull()
		.references(() => posts.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const requestLogs = pgTable('request_logs', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id),
	method: text('method').notNull(),
	path: text('path').notNull(),
	endpoint: text('endpoint').notNull(),
	statusCode: integer('status_code').notNull(),
	responseTime: integer('response_time').notNull(),
	timestamp: timestamp('timestamp').defaultNow().notNull(),
	userAgent: text('user_agent'),
	ipAddress: text('ip_address'),
	contentLength: integer('content_length'),
	query: text('query'),
	body: text('body'),
});

export const userAnalytics = pgTable('user_analytics', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id),
	totalRequests: integer('total_requests').notNull().default(0),
	lastActivity: timestamp('last_activity').defaultNow().notNull(),
	avgResponseTime: integer('avg_response_time').notNull().default(0),
	date: text('date').notNull(),
});

export const endpointAnalytics = pgTable('endpoint_analytics', {
	id: serial('id').primaryKey(),
	endpoint: text('endpoint').notNull(),
	method: text('method').notNull(),
	totalRequests: integer('total_requests').notNull().default(0),
	avgResponseTime: integer('avg_response_time').notNull().default(0),
	minResponseTime: integer('min_response_time'),
	maxResponseTime: integer('max_response_time'),
	successCount: integer('success_count').notNull().default(0),
	errorCount: integer('error_count').notNull().default(0),
	date: text('date').notNull(),
});
