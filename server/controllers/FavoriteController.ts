import { Request, Response } from 'express';
import { FavoriteService } from '../services/FavoriteService';
import { SearchInput } from '../types';
import AsyncHandler from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';

export class FavoriteController {
	static addFavorite = AsyncHandler(async (req: Request, res: Response) => {
		const { movieId } = req.body;

		if (!movieId || isNaN(parseInt(movieId, 10))) {
			throw new BadRequestError('Movie ID is required and must be a number');
		}

		const favorite = await FavoriteService.addFavorite(
			parseInt(movieId, 10),
			req.user!
		);

		res.status(201).json({
			message: 'Movie added to favorites successfully',
			data: favorite,
		});
	});

	static getFavorites = AsyncHandler(async (req: Request, res: Response) => {
		const searchParams: SearchInput = {};

		if (req.query.search) {
			searchParams.search = req.query.search as string;
		}

		if (req.query.sortBy) {
			searchParams.sortBy = req.query.sortBy as string;
		}

		if (req.query.sortOrder) {
			searchParams.sortOrder = req.query.sortOrder as 'asc' | 'desc';
		}

		if (req.query.limit) {
			searchParams.limit = parseInt(req.query.limit as string, 10);
		}

		if (req.query.offset) {
			searchParams.offset = parseInt(req.query.offset as string, 10);
		}

		const movies = await FavoriteService.getFavoriteMovies(
			req.user!,
			searchParams
		);

		res.status(200).json({
			message: 'Favorite movies retrieved successfully',
			data: movies,
		});
	});

	static removeFavorite = AsyncHandler(async (req: Request, res: Response) => {
		const movieId = parseInt(req.params.movieId, 10);

		if (!movieId || isNaN(movieId)) {
			throw new BadRequestError('Movie ID is required and must be a number');
		}

		await FavoriteService.removeFavorite(movieId, req.user!);

		res.status(200).json({
			message: 'Movie removed from favorites successfully',
		});
	});

	static checkFavorite = AsyncHandler(async (req: Request, res: Response) => {
		const movieId = parseInt(req.params.movieId, 10);

		if (isNaN(movieId)) {
			throw new BadRequestError('Invalid movie ID');
		}

		const isFavorite = await FavoriteService.isFavorite(movieId, req.user!);

		res.status(200).json({
			message: 'Favorite status checked successfully',
			data: { isFavorite },
		});
	});
}
