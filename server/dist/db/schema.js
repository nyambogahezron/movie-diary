"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpointAnalytics = exports.userAnalytics = exports.requestLogs = exports.postComments = exports.postLikes = exports.posts = exports.movieReviews = exports.favorites = exports.watchlistMovies = exports.watchlists = exports.movies = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    username: (0, sqlite_core_1.text)('username'),
    email: (0, sqlite_core_1.text)('email'),
    password: (0, sqlite_core_1.text)('password').notNull(),
    avatar: (0, sqlite_core_1.text)('avatar'),
    role: (0, sqlite_core_1.text)('role').default('user').notNull(),
    isEmailVerified: (0, sqlite_core_1.integer)('is_email_verified', { mode: 'boolean' })
        .default(false)
        .notNull(),
    emailVerificationToken: (0, sqlite_core_1.text)('email_verification_token'),
    emailVerificationExpires: (0, sqlite_core_1.text)('email_verification_expires'),
    passwordResetToken: (0, sqlite_core_1.text)('password_reset_token'),
    passwordResetExpires: (0, sqlite_core_1.text)('password_reset_expires'),
    lastLoginAt: (0, sqlite_core_1.text)('last_login_at'),
    lastLoginIp: (0, sqlite_core_1.text)('last_login_ip'),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
}, (table) => {
    return [
        (0, sqlite_core_1.uniqueIndex)('users_username_unique').on(table.username),
        (0, sqlite_core_1.uniqueIndex)('users_email_unique').on(table.email),
    ];
});
exports.movies = (0, sqlite_core_1.sqliteTable)('movies', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    title: (0, sqlite_core_1.text)('title').notNull(),
    tmdbId: (0, sqlite_core_1.text)('tmdb_id').notNull(),
    posterPath: (0, sqlite_core_1.text)('poster_path'),
    releaseDate: (0, sqlite_core_1.text)('release_date'),
    overview: (0, sqlite_core_1.text)('overview'),
    rating: (0, sqlite_core_1.integer)('rating'),
    watchDate: (0, sqlite_core_1.text)('watch_date'),
    review: (0, sqlite_core_1.text)('review'),
    genres: (0, sqlite_core_1.text)('genres'),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.watchlists = (0, sqlite_core_1.sqliteTable)('watchlists', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    name: (0, sqlite_core_1.text)('name').notNull(),
    description: (0, sqlite_core_1.text)('description'),
    isPublic: (0, sqlite_core_1.integer)('is_public', { mode: 'boolean' }).notNull().default(false),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.watchlistMovies = (0, sqlite_core_1.sqliteTable)('watchlist_movies', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    watchlistId: (0, sqlite_core_1.integer)('watchlist_id')
        .notNull()
        .references(() => exports.watchlists.id, { onDelete: 'cascade' }),
    movieId: (0, sqlite_core_1.integer)('movie_id')
        .notNull()
        .references(() => exports.movies.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.favorites = (0, sqlite_core_1.sqliteTable)('favorites', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    movieId: (0, sqlite_core_1.integer)('movie_id')
        .notNull()
        .references(() => exports.movies.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.movieReviews = (0, sqlite_core_1.sqliteTable)('movie_reviews', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    movieId: (0, sqlite_core_1.integer)('movie_id')
        .notNull()
        .references(() => exports.movies.id, { onDelete: 'cascade' }),
    content: (0, sqlite_core_1.text)('content').notNull(),
    rating: (0, sqlite_core_1.integer)('rating'),
    isPublic: (0, sqlite_core_1.integer)('is_public', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.posts = (0, sqlite_core_1.sqliteTable)('posts', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    tmdbId: (0, sqlite_core_1.text)('tmdb_id').notNull(),
    posterPath: (0, sqlite_core_1.text)('poster_path'),
    title: (0, sqlite_core_1.text)('title').notNull(),
    content: (0, sqlite_core_1.text)('content').notNull(),
    likesCount: (0, sqlite_core_1.integer)('likes_count').notNull().default(0),
    commentsCount: (0, sqlite_core_1.integer)('comments_count').notNull().default(0),
    isPublic: (0, sqlite_core_1.integer)('is_public', { mode: 'boolean' }).notNull().default(true),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.postLikes = (0, sqlite_core_1.sqliteTable)('post_likes', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    postId: (0, sqlite_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.posts.id, { onDelete: 'cascade' }),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.postComments = (0, sqlite_core_1.sqliteTable)('post_comments', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id')
        .notNull()
        .references(() => exports.users.id, { onDelete: 'cascade' }),
    postId: (0, sqlite_core_1.integer)('post_id')
        .notNull()
        .references(() => exports.posts.id, { onDelete: 'cascade' }),
    content: (0, sqlite_core_1.text)('content').notNull(),
    createdAt: (0, sqlite_core_1.text)('created_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: (0, sqlite_core_1.text)('updated_at')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
});
exports.requestLogs = (0, sqlite_core_1.sqliteTable)('request_logs', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').references(() => exports.users.id),
    method: (0, sqlite_core_1.text)('method').notNull(),
    path: (0, sqlite_core_1.text)('path').notNull(),
    endpoint: (0, sqlite_core_1.text)('endpoint').notNull(),
    statusCode: (0, sqlite_core_1.integer)('status_code').notNull(),
    responseTime: (0, sqlite_core_1.integer)('response_time').notNull(),
    timestamp: (0, sqlite_core_1.text)('timestamp')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    userAgent: (0, sqlite_core_1.text)('user_agent'),
    ipAddress: (0, sqlite_core_1.text)('ip_address'),
    contentLength: (0, sqlite_core_1.integer)('content_length'),
    query: (0, sqlite_core_1.text)('query'),
    body: (0, sqlite_core_1.text)('body'),
});
exports.userAnalytics = (0, sqlite_core_1.sqliteTable)('user_analytics', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    userId: (0, sqlite_core_1.integer)('user_id').references(() => exports.users.id),
    totalRequests: (0, sqlite_core_1.integer)('total_requests').notNull().default(0),
    lastActivity: (0, sqlite_core_1.text)('last_activity')
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`)
        .notNull(),
    avgResponseTime: (0, sqlite_core_1.integer)('avg_response_time').notNull().default(0),
    date: (0, sqlite_core_1.text)('date').notNull(),
});
exports.endpointAnalytics = (0, sqlite_core_1.sqliteTable)('endpoint_analytics', {
    id: (0, sqlite_core_1.integer)('id').primaryKey({ autoIncrement: true }),
    endpoint: (0, sqlite_core_1.text)('endpoint').notNull(),
    method: (0, sqlite_core_1.text)('method').notNull(),
    totalRequests: (0, sqlite_core_1.integer)('total_requests').notNull().default(0),
    avgResponseTime: (0, sqlite_core_1.integer)('avg_response_time').notNull().default(0),
    minResponseTime: (0, sqlite_core_1.integer)('min_response_time'),
    maxResponseTime: (0, sqlite_core_1.integer)('max_response_time'),
    successCount: (0, sqlite_core_1.integer)('success_count').notNull().default(0),
    errorCount: (0, sqlite_core_1.integer)('error_count').notNull().default(0),
    date: (0, sqlite_core_1.text)('date').notNull(),
});
//# sourceMappingURL=schema.js.map