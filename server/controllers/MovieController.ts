import { Request, Response } from 'express';
import { MovieService } from '../services/MovieService';
import { SearchInput } from '../types';
import AsyncHandler from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';

export class MovieController {
	static addMovie = AsyncHandler(async (req: Request, res: Response) => {
		const { title, tmdbId } = req.body;

		if (!title || !tmdbId) {
			throw new BadRequestError('Title and TMDB ID are required');
		}

		const movie = await MovieService.addMovie({ ...req.body }, req.user!);

		res.status(201).json({
			message: 'Movie added successfully',
			data: movie,
		});
	});

	static getSingleMovie = AsyncHandler(async (req: Request, res: Response) => {
		const movieId = Number(req.params.id);

		if (isNaN(movieId)) {
			throw new BadRequestError('Invalid movie ID');
		}

		const movie = await MovieService.getMovie(movieId, req.user!);

		res.status(200).json({
			message: 'Movie retrieved successfully',
			data: movie,
		});
	});

	static getUserMovies = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new BadRequestError('Authentication required');
		}

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
			searchParams.limit = Number(req.query.limit);
		}

		if (req.query.offset) {
			searchParams.offset = Number(req.query.offset);
		}

		const movies = await MovieService.getUserMovies(req.user, searchParams);

		res.status(200).json({
			message: 'Movies retrieved successfully',
			data: movies,
		});
	});

	static updateMovie = AsyncHandler(async (req: Request, res: Response) => {
		const movieId = Number(req.params.id);

		if (isNaN(movieId)) {
			throw new Error('Invalid movie ID');
		}

		const movie = await MovieService.updateMovie(movieId, req.body, req.user!);

		res.status(200).json({
			message: 'Movie updated successfully',
			data: movie,
		});
	});

	static deleteMovie = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			throw new BadRequestError('Authentication required');
		}

		const movieId = Number(req.params.id);

		if (isNaN(movieId)) {
			throw new Error('Invalid movie ID');
		}

		await MovieService.deleteMovie(movieId, req.user);

		res.status(200).json({
			message: 'Movie deleted successfully',
		});
	});
}
