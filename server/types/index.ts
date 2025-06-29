export interface User {
	id: number;
	username: string;
	name: string;
	email: string;
	password: string;
	avatar?: string | null;
	role?: string;
	isEmailVerified: boolean;
	emailVerificationToken?: string | null;
	emailVerificationExpires?: string | null;
	passwordResetToken?: string | null;
	passwordResetExpires?: string | null;
	lastLoginAt?: string | null;
	lastLoginIp?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

// Type for email operations that expects string dates
export interface UserForEmail {
	id: number;
	username: string;
	name: string;
	email: string;
	password?: string;
	avatar?: string | null;
	role?: string;
	isEmailVerified?: boolean;
	emailVerificationToken?: string | null;
	emailVerificationExpires?: string | null;
	passwordResetToken?: string | null;
	passwordResetExpires?: string | null;
	lastLoginAt?: string | null;
	lastLoginIp?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface IUser {
	id: number;
	username: string;
	email: string;
	password: string;
	avatar?: string | null;
	role?: string;
	isEmailVerified: boolean;
	emailVerificationToken?: string | null;
	emailVerificationExpires?: string | null;
	passwordResetToken?: string | null;
	passwordResetExpires?: string | null;
	lastLoginAt?: string | null;
	lastLoginIp?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Movie {
	id: number;
	title: string;
	tmdbId: string;
	posterPath?: string | null;
	releaseDate?: string | null;
	overview?: string | null;
	rating?: number | null;
	watchDate?: string | null;
	review?: string | null;
	genres?: string | null;
	userId: number;
	createdAt: string;
	updatedAt: string;
}

export interface MovieInput {
	title: string;
	tmdbId: string;
	posterPath?: string | null;
	releaseDate?: string | null;
	overview?: string | null;
	rating?: number | null;
	watchDate?: string | null;
	review?: string | null;
	genres?: string[];
	userId?: number;
}

export interface IMovie {
	id: number;
	title: string;
	tmdbId: string;
	posterPath?: string | null;
	releaseDate?: string | null;
	overview?: string | null;
	rating?: number | null;
	watchDate?: string | null;
	review?: string | null;
	genres?: string | null;
	userId: number;
	createdAt: string;
	updatedAt: string;
}

export interface Watchlist {
	id: number;
	userId: number;
	name: string;
	description?: string | null;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface WatchlistInput {
	name: string;
	description?: string | null;
	isPublic?: boolean;
	userId?: number;
}

export interface IWatchlist {
	id: number;
	userId: number;
	name: string;
	description?: string | null;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface WatchlistMovie {
	id: number;
	watchlistId: number;
	movieId: number;
	createdAt: string;
}

export interface Favorite {
	id: number;
	userId: number;
	movieId: number;
	createdAt: string;
}

export interface IFavorite {
	id: number;
	userId: number;
	movieId: number;
	createdAt: string;
}

export interface AuthPayload {
	token: string;
	refreshToken?: string;
	user: User;
}

export interface JwtPayload {
	userId: number;
	deviceInfo?: string;
	iat?: number;
	exp?: number;
}

export interface PaginationInput {
	limit?: number;
	offset?: number;
}

export interface SortInput {
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
}

export interface SearchInput extends PaginationInput, SortInput {
	search?: string;
}

export interface MovieReview {
	id: number;
	userId: number;
	movieId: number;
	content: string;
	rating?: number | null;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface MovieReviewWithDetails extends MovieReview {
	user: {
		id: number;
		username: string;
		avatar: string | null;
	};
}

export interface MovieReviewInput {
	content: string;
	rating?: number | null;
	isPublic?: boolean;
	userId?: number;
	movieId?: number;
}

export interface IMovieReview {
	id: number;
	userId: number;
	movieId: number;
	content: string;
	rating?: number | null;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface Post {
	id: number;
	userId: number;
	tmdbId: string;
	posterPath?: string | null;
	title: string;
	content: string;
	likesCount: number;
	commentsCount: number;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface PostInput {
	tmdbId: string;
	posterPath?: string | null;
	title: string;
	content: string;
	isPublic?: boolean;
	userId?: number;
}

export interface PostLike {
	id: number;
	userId: number;
	postId: number;
	createdAt: string;
}

export interface PostComment {
	id: number;
	userId: number;
	postId: number;
	content: string;
	createdAt: string;
	updatedAt: string;
	username?: string;
	avatar?: string | null;
}

export interface PostCommentInput {
	content: string;
	userId?: number;
	postId?: number;
}

export interface PostSearchInput extends SearchInput {
	userId?: number;
	isPublic?: boolean;
}
