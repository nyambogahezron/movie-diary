import { db } from '../db';
import { posts, postLikes } from '../db/schema';
import { eq, like, desc, asc, and, sql } from 'drizzle-orm';
import { Post as PostType, PostInput, PostSearchInput } from '../types';

export class Post {
	static async create(postData: PostInput & { userId: number }) {
		const result = await db
			.insert(posts)
			.values({
				title: postData.title,
				tmdbId: postData.tmdbId,
				posterPath: postData.posterPath || null,
				content: postData.content,
				userId: postData.userId,
				isPublic: postData.isPublic !== undefined ? postData.isPublic : true,
				likesCount: 0,
				commentsCount: 0,
			})
			.returning();

		return result[0] as unknown as PostType;
	}

	static async findById(id: number) {
		const result = await db.select().from(posts).where(eq(posts.id, id));
		return result[0] as unknown as PostType;
	}

	static async findByUserId(userId: number, params?: PostSearchInput) {
		const conditions = [eq(posts.userId, userId)];

		if (params?.search) {
			conditions.push(like(posts.title, `%${params.search}%`));
		}

		if (params?.isPublic !== undefined) {
			conditions.push(eq(posts.isPublic, params.isPublic));
		}

		const getSortColumn = (sortBy?: string) => {
			switch (sortBy) {
				case 'title':
					return posts.title;
				case 'createdAt':
					return posts.createdAt;
				case 'updatedAt':
					return posts.updatedAt;
				case 'likesCount':
					return posts.likesCount;
				case 'commentsCount':
					return posts.commentsCount;
				default:
					return posts.createdAt;
			}
		};

		const result = await db
			.select()
			.from(posts)
			.where(and(...conditions))
			.orderBy(
				params?.sortOrder === 'desc'
					? desc(getSortColumn(params?.sortBy))
					: asc(getSortColumn(params?.sortBy))
			)
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result as unknown as PostType[];
	}

	static async getFeed(
		currentUserId?: number | null,
		params?: PostSearchInput
	) {
		const result = await db
			.select()
			.from(posts)
			.where(eq(posts.isPublic, true))
			.orderBy(desc(posts.createdAt))
			.limit(params?.limit ?? 100)
			.offset(params?.offset ?? 0);

		return result as unknown as PostType[];
	}

	static async update(id: number, postData: Partial<PostInput>) {
		const updateData: Record<string, any> = {};

		if (postData.title !== undefined) updateData.title = postData.title;
		if (postData.content !== undefined) updateData.content = postData.content;
		if (postData.isPublic !== undefined)
			updateData.isPublic = postData.isPublic;
		updateData.updatedAt = new Date().toISOString();

		await db.update(posts).set(updateData).where(eq(posts.id, id));
	}

	static async delete(id: number) {
		await db.delete(posts).where(eq(posts.id, id));
	}

	static async incrementLikes(id: number) {
		await db
			.update(posts)
			.set({
				likesCount: sql`${posts.likesCount} + 1`,
			})
			.where(eq(posts.id, id));
	}

	static async decrementLikes(id: number) {
		await db
			.update(posts)
			.set({
				likesCount: sql`${posts.likesCount} - 1`,
			})
			.where(eq(posts.id, id));
	}

	static async incrementComments(id: number) {
		await db
			.update(posts)
			.set({
				commentsCount: sql`${posts.commentsCount} + 1`,
			})
			.where(eq(posts.id, id));
	}

	static async decrementComments(id: number) {
		await db
			.update(posts)
			.set({
				commentsCount: sql`${posts.commentsCount} - 1`,
			})
			.where(eq(posts.id, id));
	}

	static async getPostsWithLikeStatus(
		userId: number,
		params?: PostSearchInput
	) {
		const postsResult = await this.findByUserId(userId, params);

		if (postsResult.length === 0) {
			return [];
		}

		const postIds = postsResult.map((post) => post.id);

		const likes = await db
			.select()
			.from(postLikes)
			.where(
				and(
					eq(postLikes.userId, userId),
					sql`${postLikes.postId} IN (${sql.join(postIds)})`
				)
			);

		const likeMap = new Map<number, boolean>();
		likes.forEach((like) => {
			likeMap.set(like.postId, true);
		});

		return postsResult.map((post) => ({
			...post,
			hasLiked: likeMap.has(post.id),
		}));
	}
}
