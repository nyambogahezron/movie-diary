import { db } from '../db';
import { postLikes } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { PostLike as PostLikeType } from '../types';

export class PostLike {
	static async create(userId: number, postId: number) {
		const result = await db
			.insert(postLikes)
			.values({
				userId,
				postId,
			})
			.returning();

		return result[0] as unknown as PostLikeType;
	}

	static async findByUserAndPost(userId: number, postId: number) {
		const result = await db
			.select()
			.from(postLikes)
			.where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));

		return result[0] as unknown as PostLikeType;
	}

	static async delete(id: number) {
		await db.delete(postLikes).where(eq(postLikes.id, id));
	}

	static async deleteByUserAndPost(userId: number, postId: number) {
		await db
			.delete(postLikes)
			.where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId)));
	}

	static async getLikeCount(postId: number) {
		const result = await db
			.select()
			.from(postLikes)
			.where(eq(postLikes.postId, postId));

		return result.length;
	}

	static async getLikedByUser(userId: number) {
		const result = await db
			.select()
			.from(postLikes)
			.where(eq(postLikes.userId, userId));

		return result as unknown as PostLikeType[];
	}
}
