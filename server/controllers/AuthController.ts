import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import AsyncHandler from '../middleware/asyncHandler';
import { BadRequestError } from '../utils/errors';
import crypto from 'crypto';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { EmailService } from '../services/EmailService';
import { User } from '../helpers/User';

export class AuthController {
	static register = AsyncHandler(async (req: Request, res: Response) => {
		const { name, username, email, password } = req.body;

		if (!name || !username || !email || !password) {
			res
				.status(400)
				.json({ error: 'Username, email, and password are required' });
			return;
		}

		const ipAddress =
			req.ip || (req.headers['x-forwarded-for'] as string) || '';

		const authPayload = await AuthService.register(
			name,
			username,
			email,
			password,
			ipAddress
		);

		res.status(201).json({
			message: 'User registered successfully',
			user: {
				name: authPayload.user.name,
				username: authPayload.user.username,
				email: authPayload.user.email,
			},
		});
	});

	static login = AsyncHandler(async (req: Request, res: Response) => {
		const { username, email, password } = req.body;

		const loginIdentifier = username || email;

		if (!loginIdentifier || !password) {
			throw new BadRequestError('Invalid Credentials');
		}

		const ipAddress =
			req.ip || (req.headers['x-forwarded-for'] as string) || '';
		const userAgent = req.headers['user-agent'] || '';

		const authPayload = await AuthService.login(
			loginIdentifier,
			password,
			ipAddress,
			userAgent
		);

		res.cookie('accessToken', authPayload.token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		if (authPayload.refreshToken) {
			res.cookie('refreshToken', authPayload.refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'strict',
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});
		}

		res.status(200).json({
			message: 'Login successful',
			user: {
				id: authPayload.user.id,
				username: authPayload.user.username,
				email: authPayload.user.email,
				avatar: authPayload.user.avatar,
				createdAt: authPayload.user.createdAt,
			},
		});
	});

	static getCurrentUser = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			res.status(401).json({ error: 'Not authenticated' });
			return;
		}

		res.status(200).json({
			message: 'User profile retrieved successfully',
			user: {
				id: req.user.id,
				username: req.user.username,
				email: req.user.email,
				avatar: req.user.avatar,
				createdAt: req.user.createdAt,
			},
		});
	});

	static refreshToken = AsyncHandler(async (req: Request, res: Response) => {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			res.status(400).json({ error: 'Refresh token is required' });
			return;
		}

		const { accessToken } = await AuthService.refreshAccessToken(refreshToken);

		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 15 * 60 * 1000, // 15 minutes
		});

		res.status(200).json({
			message: 'Token refreshed successfully',
		});
	});

	static verifyEmail = AsyncHandler(async (req: Request, res: Response) => {
		const { token } = req.query;

		if (!token || typeof token !== 'string') {
			res.status(400).json({ error: 'Verification token is required' });
			return;
		}

		await AuthService.verifyEmail(token);

		res.status(200).json({
			message: 'Email verified successfully',
		});
	});

	static requestPasswordReset = AsyncHandler(
		async (req: Request, res: Response) => {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({ error: 'Email is required' });
				return;
			}

			await AuthService.requestPasswordReset(email);

			res.status(200).json({
				message: 'check your email for password reset instructions',
			});
		}
	);

	static resetPassword = AsyncHandler(async (req: Request, res: Response) => {
		const { code, email, newPassword } = req.body;

		if (!code || !email || !newPassword) {
			res
				.status(400)
				.json({ error: 'Reset code, email and new password are required' });
			return;
		}

		await AuthService.resetPassword(code, email, newPassword);

		res.status(200).json({
			message: 'Password reset successful',
		});
	});

	static updateEmail = AsyncHandler(async (req: Request, res: Response) => {
		if (!req.user) {
			res.status(401).json({ error: 'Not authenticated' });
			return;
		}

		const { newEmail } = req.body;

		if (!newEmail) {
			res.status(400).json({ error: 'New email is required' });
			return;
		}

		await AuthService.updateEmail(req.user.id, newEmail);

		res.status(200).json({
			message: 'Email update initiated. Please verify your new email address.',
		});
	});

	static resendVerificationEmail = AsyncHandler(
		async (req: Request, res: Response) => {
			const { email } = req.body;

			if (!email) {
				res.status(400).json({ error: 'Email is required' });
				return;
			}

			const user = await User.findByEmail(email);

			if (!user) {
				throw new BadRequestError('User not found');
			}

			if (user.isEmailVerified) {
				throw new BadRequestError('Email already verified');
			}

			const emailVerificationToken = crypto.randomBytes(32).toString('hex');
			const emailVerificationExpires = new Date(
				Date.now() + 24 * 60 * 60 * 1000
			).toISOString();

			await db
				.update(users)
				.set({
					emailVerificationToken,
					emailVerificationExpires,
				})
				.where(eq(users.id, user.id));

			await EmailService.sendVerificationEmail(user, emailVerificationToken);

			res.status(200).json({
				message: 'Verification email sent successfully',
			});
		}
	);
}
