import { Request, Response } from 'express';
import { PostService } from '../services/PostService';
import { PostLikeService } from '../services/PostLikeService';
import { PostCommentService } from '../services/PostCommentService';
import { PostInput, PostCommentInput, PostSearchInput } from '../types';
import AsyncHandler from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';
export class PostController {
	static createPost = AsyncHandler(async (req: Request, res: Response) => {
		const postData: PostInput = req.body;
		const post = await PostService.createPost(req.user!.id, postData);

		res.status(201).json({
			success: true,
			data: post,
			message: 'Post created successfully',
		});
	});

	static getSinglePost = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);
		if (isNaN(postId)) {
			throw new BadRequestError('Invalid post ID');
		}

		const userId = req.user?.id;
		const post = await PostService.getPostById(postId, userId);

		const hasLiked = userId
			? await PostLikeService.hasUserLikedPost(userId, postId)
			: false;

		res.status(200).json({
			success: true,
			data: { ...post, hasLiked },
			message: 'Post retrieved successfully',
		});
	});

	static getUserPosts = AsyncHandler(async (req: Request, res: Response) => {
		const params: PostSearchInput = {
			limit: req.query.limit ? Number(req.query.limit) : undefined,
			offset: req.query.offset ? Number(req.query.offset) : undefined,
			sortBy: req.query.sortBy as string | undefined,
			sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
			search: req.query.search as string | undefined,
			isPublic:
				req.query.isPublic === 'true'
					? true
					: req.query.isPublic === 'false'
					? false
					: undefined,
		};

		const posts = await PostService.getPostsWithLikeStatus(
			req.user!.id,
			params
		);

		res.status(200).json({
			success: true,
			data: posts,
			message: 'User posts retrieved successfully',
		});
	});

	static getFeed = AsyncHandler(async (req: Request, res: Response) => {
		const userId = req.user?.id;
		const params: PostSearchInput = {
			limit: req.query.limit ? Number(req.query.limit) : undefined,
			offset: req.query.offset ? Number(req.query.offset) : undefined,
			sortBy: req.query.sortBy as string | undefined,
			sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
			search: req.query.search as string | undefined,
		};

		const posts = await PostService.getFeed(userId, params);

		res.status(200).json({
			success: true,
			data: posts,
			message: 'Post feed retrieved successfully',
		});
	});

	static updatePost = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);
		if (isNaN(postId)) {
			throw new Error('Invalid post ID');
		}

		const postData: Partial<PostInput> = req.body;
		await PostService.updatePost(req.user!.id, postId, postData);

		res.status(200).json({
			success: true,
			message: 'Post updated successfully',
		});
	});

	static deletePost = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);
		if (isNaN(postId)) {
			throw new BadRequestError('Invalid post ID');
		}

		await PostService.deletePost(req.user!.id, postId);

		res.status(200).json({
			success: true,
			message: 'Post deleted successfully',
		});
	});

	static likePost = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);
		if (isNaN(postId)) {
			throw new BadRequestError('Invalid post ID');
		}

		await PostLikeService.likePost(req.user!.id, postId);

		res.status(200).json({
			success: true,
			message: 'Post liked successfully',
		});
	});

	static unlikePost = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);
		if (isNaN(postId)) {
			throw new BadRequestError('Invalid post ID');
		}

		await PostLikeService.unlikePost(req.user!.id, postId);

		res.status(200).json({
			success: true,
			message: 'Post unliked successfully',
		});
	});

	static addComment = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);

		if (isNaN(postId)) {
			throw new BadRequestError('Invalid post ID');
		}

		const commentData: PostCommentInput = req.body;

		const comment = await PostCommentService.createComment(
			req.user!.id,
			postId,
			commentData
		);

		res.status(201).json({
			success: true,
			data: comment,
			message: 'Comment added successfully',
		});
	});

	static getComments = AsyncHandler(async (req: Request, res: Response) => {
		const postId = Number(req.params.id);
		if (isNaN(postId)) {
			throw new BadRequestError('Invalid post ID');
		}

		const comments = await PostCommentService.getCommentsByPostId(postId);

		res.status(200).json({
			success: true,
			data: comments,
			message: 'Comments retrieved successfully',
		});
	});

	static updateComment = AsyncHandler(async (req: Request, res: Response) => {
		const commentId = Number(req.params.commentId);
		if (isNaN(commentId)) {
			throw new BadRequestError('Invalid comment ID');
		}

		const { content } = req.body;
		await PostCommentService.updateComment(req.user!.id, commentId, content);

		res.status(200).json({
			success: true,
			message: 'Comment updated successfully',
		});
	});

	static deleteComment = AsyncHandler(async (req: Request, res: Response) => {
		const commentId = Number(req.params.commentId);
		if (isNaN(commentId)) {
			throw new BadRequestError('Invalid comment ID');
		}

		await PostCommentService.deleteComment(req.user!.id, commentId);

		res.status(200).json({
			success: true,
			message: 'Comment deleted successfully',
		});
	});
}
