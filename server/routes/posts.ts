import express from 'express';
import { PostController } from '../controllers/PostController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
	validatePostUpdate,
	validatePostIdParam,
	validatePostComment,
	validateCommentUpdate,
	validateCommentIdParam,
	validatePostQuery,
	validatePostCreate,
} from '../utils/validations/post.validation';

const router = express.Router();

router.get('/feed', validate(validatePostQuery), PostController.getFeed);
router.get('/:id', validate(validatePostIdParam), PostController.getSinglePost);
router.get(
	'/:id/comments',
	validate(validatePostIdParam),
	PostController.getComments
);

router.use(authMiddleware);

router
	.route('/')
	.get(validate(validatePostQuery), PostController.getUserPosts)
	.post(validate(validatePostCreate), PostController.createPost);

router
	.route('/:id')
	.patch(validate(validatePostUpdate), PostController.updatePost)
	.delete(validate(validatePostIdParam), PostController.deletePost);

router
	.route('/:id/like')
	.post(validate(validatePostIdParam), PostController.likePost)
	.delete(validate(validatePostIdParam), PostController.unlikePost);

router.post(
	'/:id/comments',
	validate(validatePostComment),
	PostController.addComment
);

router
	.route('/comments/:commentId')
	.put(validate(validateCommentUpdate), PostController.updateComment)
	.delete(validate(validateCommentIdParam), PostController.deleteComment);

export default router;
