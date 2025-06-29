"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpointAnalytics = exports.userAnalytics = exports.requestLogs = exports.postComments = exports.postLikes = exports.posts = exports.movieReviews = exports.favorites = exports.watchlistMovies = exports.watchlists = exports.movies = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    username: (0, pg_core_1.text)('username').notNull(),
    email: (0, pg_core_1.text)('email').notNull(),
    password: (0, pg_core_1.text)('password').notNull(),
    avatar: (0, pg_core_1.text)('avatar'),
    role: (0, pg_core_1.text)('role').default('user').notNull(),
    isEmailVerified: (0, pg_core_1.boolean)('is_email_verified').default(false).notNull(),
    emailVerificationToken: (0, pg_core_1.text)('email_verification_token'),
    emailVerificationExpires: (0, pg_core_1.text)('email_verification_expires'),
    passwordResetToken: (0, pg_core_1.text)('password_reset_token'),
    passwordResetExpires: (0, pg_core_1.text)('password_reset_expires'),
    lastLoginAt: (0, pg_core_1.text)('last_login_at'),
    lastLoginIp: (0, pg_core_1.text)('last_login_ip'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => {
    return [
        (0, pg_core_1.uniqueIndex)('users_username_unique').on(table.username),
        (0, pg_core_1.uniqueIndex)('users_email_unique').on(table.email),
    ];
});
exports.movies = (0, pg_core_1.pgTable)('movies', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    tmdbId: (0, pg_core_1.text)('tmdb_id').notNull(),
    posterPath: (0, pg_core_1.text)('poster_path'),
    releaseDate: (0, pg_core_1.text)('release_date'),
    overview: (0, pg_core_1.text)('overview'),
    rating: (0, pg_core_1.integer)('rating'),
    watchDate: (0, pg_core_1.text)('watch_date'),
    review: (0, pg_core_1.text)('review'),
    genres: (0, pg_core_1.text)('genres'),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.watchlists = (0, pg_core_1.pgTable)('watchlists', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.watchlistMovies = (0, pg_core_1.pgTable)('watchlist_movies', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    watchlistId: (0, pg_core_1.integer)('watchlist_id')
        .notNull()
        .references(() => exports.watchlists.id, { onDelete: 'cascade' }),
    movieId: (0, pg_core_1.integer)('movie_id')
        .notNull()
        .references(() => exports.movies.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.favorites = (0, pg_core_1.pgTable)('favorites', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    movieId: (0, pg_core_1.integer)('movie_id')
        .notNull()
        .references(() => exports.movies.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.movieReviews = (0, pg_core_1.pgTable)('movie_reviews', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    movieId: (0, pg_core_1.integer)('movie_id')
        .notNull()
        .references(() => exports.movies.id, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    rating: (0, pg_core_1.integer)('rating'),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.posts = (0, pg_core_1.pgTable)('posts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    tmdbId: (0, pg_core_1.text)('tmdb_id').notNull(),
    posterPath: (0, pg_core_1.text)('poster_path'),
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    likesCount: (0, pg_core_1.integer)('likes_count').notNull().default(0),
    commentsCount: (0, pg_core_1.integer)('comments_count').notNull().default(0),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.postLikes = (0, pg_core_1.pgTable)('post_likes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    postId: (0, pg_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.posts.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.postComments = (0, pg_core_1.pgTable)('post_comments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    postId: (0, pg_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.posts.id, { onDelete: 'cascade' }),
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.requestLogs = (0, pg_core_1.pgTable)('request_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    method: (0, pg_core_1.text)('method').notNull(),
    path: (0, pg_core_1.text)('path').notNull(),
    endpoint: (0, pg_core_1.text)('endpoint').notNull(),
    statusCode: (0, pg_core_1.integer)('status_code').notNull(),
    responseTime: (0, pg_core_1.integer)('response_time').notNull(),
    timestamp: (0, pg_core_1.timestamp)('timestamp').defaultNow().notNull(),
    userAgent: (0, pg_core_1.text)('user_agent'),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    contentLength: (0, pg_core_1.integer)('content_length'),
    query: (0, pg_core_1.text)('query'),
    body: (0, pg_core_1.text)('body'),
});
exports.userAnalytics = (0, pg_core_1.pgTable)('user_analytics', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    totalRequests: (0, pg_core_1.integer)('total_requests').notNull().default(0),
    lastActivity: (0, pg_core_1.timestamp)('last_activity').defaultNow().notNull(),
    avgResponseTime: (0, pg_core_1.integer)('avg_response_time').notNull().default(0),
    date: (0, pg_core_1.text)('date').notNull(),
});
exports.endpointAnalytics = (0, pg_core_1.pgTable)('endpoint_analytics', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    endpoint: (0, pg_core_1.text)('endpoint').notNull(),
    method: (0, pg_core_1.text)('method').notNull(),
    totalRequests: (0, pg_core_1.integer)('total_requests').notNull().default(0),
    avgResponseTime: (0, pg_core_1.integer)('avg_response_time').notNull().default(0),
    minResponseTime: (0, pg_core_1.integer)('min_response_time'),
    maxResponseTime: (0, pg_core_1.integer)('max_response_time'),
    successCount: (0, pg_core_1.integer)('success_count').notNull().default(0),
    errorCount: (0, pg_core_1.integer)('error_count').notNull().default(0),
    date: (0, pg_core_1.text)('date').notNull(),
});
//# sourceMappingURL=schema.js.map