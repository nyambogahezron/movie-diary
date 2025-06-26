import { Post as PostHelper } from '../helpers/Post';
import { PostInput, PostSearchInput } from '../types';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export class PostService {
	static async createPost(userId: number, postData: PostInput) {
		return await PostHelper.create({
			...postData,
			userId,
		});
	}

	static async getPostById(postId: number, userId?: number) {
		const post = await PostHelper.findById(postId);

		if (!post) {
			throw new NotFoundError('Post not found');
		}

		if (!post.isPublic && post.userId !== userId) {
			throw new UnauthorizedError(
				'You do not have permission to view this post'
			);
		}

		return post;
	}

	static async getPostsByUserId(userId: number, params?: PostSearchInput) {
		return await PostHelper.findByUserId(userId, params);
	}

	static async getFeed(userId?: number, params?: PostSearchInput) {
		return await PostHelper.getFeed(userId, params);
	}

	static async updatePost(
		userId: number,
		postId: number,
		postData: Partial<PostInput>
	) {
		const post = await this.getPostById(postId);

		if (post.userId !== userId) {
			throw new UnauthorizedError(
				'You do not have permission to update this post'
			);
		}

		await PostHelper.update(postId, postData);
	}

	static async deletePost(userId: number, postId: number) {
		const post = await this.getPostById(postId);

		if (post.userId !== userId) {
			throw new UnauthorizedError(
				'You do not have permission to delete this post'
			);
		}

		await PostHelper.delete(postId);
	}

	static async getPostsWithLikeStatus(
		userId: number,
		params?: PostSearchInput
	) {
		return await PostHelper.getPostsWithLikeStatus(userId, params);
	}
}
