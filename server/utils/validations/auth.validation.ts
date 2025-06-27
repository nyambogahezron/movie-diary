import { body } from 'express-validator';

export const authValidation = {
	register: [
		body('name')
			.notEmpty()
			.withMessage('Name is required')
			.isLength({ min: 2, max: 50 })
			.withMessage('Name must be between 2 and 50 characters')
			.matches(/^[a-zA-Z\s]+$/)
			.withMessage('Name can only contain letters and spaces')
			.trim(),
		body('username')
			.notEmpty()
			.withMessage('Username is required')
			.isLength({ min: 3, max: 30 })
			.withMessage('Username must be between 3 and 30 characters')
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Username can only contain letters, numbers and underscores')
			.trim(),

		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Must provide a valid email address')
			.normalizeEmail(),

		body('password')
			.notEmpty()
			.withMessage('Password is required')
			.isLength({ min: 8 })
			.withMessage('Password must be at least 8 characters long')
			.matches(/[a-z]/)
			.withMessage('Password must contain at least one lowercase letter')
			.matches(/[A-Z]/)
			.withMessage('Password must contain at least one uppercase letter')
			.matches(/[0-9]/)
			.withMessage('Password must contain at least one number'),
	],

	login: [
		body('email')
			.optional({ nullable: true })
			.isEmail()
			.withMessage('Must provide a valid email address')
			.normalizeEmail(),

		body('username')
			.optional({ nullable: true })
			.isLength({ min: 3, max: 30 })
			.withMessage('Username must be between 3 and 30 characters')
			.matches(/^[a-zA-Z0-9_]+$/)
			.withMessage('Username can only contain letters, numbers and underscores')
			.trim(),

		body('identifier')
			.optional({ nullable: true })
			.isLength({ min: 3, max: 50 })
			.withMessage('Identifier must be between 3 and 50 characters')
			.trim(),

		body().custom((body) => {
			if (!body.email && !body.username && !body.identifier) {
				throw new Error(
					'Either email, username, or identifier must be provided'
				);
			}
			return true;
		}),

		body('password').notEmpty().withMessage('Password is required'),
	],

	refreshToken: [
		// No body validation needed as we use HTTP-only cookie
	],

	requestPasswordReset: [
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Must provide a valid email address')
			.normalizeEmail(),
	],

	resetPassword: [
		body('code')
			.notEmpty()
			.withMessage('Reset code is required')
			.isLength({ min: 6, max: 6 })
			.withMessage('Reset code must be exactly 6 digits')
			.isNumeric()
			.withMessage('Reset code must contain only numbers'),

		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Must provide a valid email address')
			.normalizeEmail(),

		body('newPassword')
			.notEmpty()
			.withMessage('New password is required')
			.isLength({ min: 8 })
			.withMessage('New password must be at least 8 characters long')
			.matches(/[a-z]/)
			.withMessage('New password must contain at least one lowercase letter')
			.matches(/[A-Z]/)
			.withMessage('New password must contain at least one uppercase letter')
			.matches(/[0-9]/)
			.withMessage('New password must contain at least one number'),
	],

	updateEmail: [
		body('newEmail')
			.notEmpty()
			.withMessage('New email is required')
			.isEmail()
			.withMessage('Must provide a valid email address')
			.normalizeEmail(),
	],

	resendVerification: [
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Must provide a valid email address')
			.normalizeEmail(),
	],
};
