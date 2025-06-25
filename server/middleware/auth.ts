import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../types';

declare global {
	namespace Express {
		interface Request {
			user?: User;
		}
	}
}

export const authMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const accessToken = req.cookies?.accessToken;

		if (!accessToken) {
			res.status(401).json({ error: 'No authentication token provided' });
			return;
		}

		try {
			const user = await AuthService.verifyToken(accessToken);

			const isVerificationRoute =
				req.originalUrl.includes('/verify-email') ||
				req.originalUrl.includes('/resend-verification');

			if (!user.isEmailVerified && !isVerificationRoute) {
				res.status(403).json({
					error: 'Email not verified',
					code: 'EMAIL_NOT_VERIFIED',
				});
				return;
			}

			req.user = user;
			next();
		} catch (error: any) {
			if (error.message === 'Token expired') {
				res.status(401).json({
					error: 'Token expired',
					code: 'TOKEN_EXPIRED',
				});
				return;
			}

			throw error;
		}
	} catch (error) {
		res
			.status(401)
			.json({ error: 'Authentication failed: ' + (error as Error).message });
	}
};

export const optionalAuthMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		let accessToken = req.cookies?.accessToken;

		if (!accessToken && req.headers.authorization?.startsWith('Bearer ')) {
			accessToken = req.headers.authorization.split(' ')[1];
		}

		if (accessToken) {
			try {
				const user = await AuthService.verifyToken(accessToken);
				req.user = user;
			} catch (error) {}
		}

		next();
	} catch (error) {
		next();
	}
};
