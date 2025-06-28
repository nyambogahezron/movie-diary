import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { authValidation } from '../utils/validations/auth.validation';
import { uploadAvatarMiddleware } from '../middleware/upload';

const router = express.Router();

router.post(
	'/register',
	validate(authValidation.register),
	AuthController.register
);
router.post('/login', validate(authValidation.login), AuthController.login);

router.get('/me', authMiddleware, AuthController.getCurrentUser);

router.post(
	'/refresh-token',
	validate(authValidation.refreshToken),
	AuthController.refreshToken
);

router.get('/verify-email', AuthController.verifyEmail);

router.post(
	'/request-password-reset',
	validate(authValidation.requestPasswordReset),
	AuthController.requestPasswordReset
);

router.post(
	'/reset-password',
	validate(authValidation.resetPassword),
	AuthController.resetPassword
);

router.post(
	'/update-email',
	authMiddleware,
	validate(authValidation.updateEmail),
	AuthController.updateEmail
);

router.post(
	'/upload-avatar',
	authMiddleware,
	uploadAvatarMiddleware,
	AuthController.uploadAvatar
);

export default router;
