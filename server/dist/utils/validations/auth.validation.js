"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const express_validator_1 = require("express-validator");
exports.authValidation = {
    register: [
        (0, express_validator_1.body)('name')
            .notEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters')
            .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name can only contain letters and spaces')
            .trim(),
        (0, express_validator_1.body)('username')
            .notEmpty()
            .withMessage('Username is required')
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers and underscores')
            .trim(),
        (0, express_validator_1.body)('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Must provide a valid email address')
            .normalizeEmail(),
        (0, express_validator_1.body)('password')
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
        (0, express_validator_1.body)('email')
            .optional({ nullable: true })
            .isEmail()
            .withMessage('Must provide a valid email address')
            .normalizeEmail(),
        (0, express_validator_1.body)('username')
            .optional({ nullable: true })
            .isLength({ min: 3, max: 30 })
            .withMessage('Username must be between 3 and 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage('Username can only contain letters, numbers and underscores')
            .trim(),
        // Custom validation to ensure either email or username is provided
        (0, express_validator_1.body)().custom((body) => {
            if (!body.email && !body.username) {
                throw new Error('Either email or username must be provided');
            }
            return true;
        }),
        (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
    ],
    refreshToken: [
    // No body validation needed as we use HTTP-only cookie
    ],
    requestPasswordReset: [
        (0, express_validator_1.body)('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Must provide a valid email address')
            .normalizeEmail(),
    ],
    resetPassword: [
        (0, express_validator_1.body)('code')
            .notEmpty()
            .withMessage('Reset code is required')
            .isLength({ min: 6, max: 6 })
            .withMessage('Reset code must be exactly 6 digits')
            .isNumeric()
            .withMessage('Reset code must contain only numbers'),
        (0, express_validator_1.body)('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Must provide a valid email address')
            .normalizeEmail(),
        (0, express_validator_1.body)('newPassword')
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
        (0, express_validator_1.body)('newEmail')
            .notEmpty()
            .withMessage('New email is required')
            .isEmail()
            .withMessage('Must provide a valid email address')
            .normalizeEmail(),
    ],
    resendVerification: [
        (0, express_validator_1.body)('email')
            .notEmpty()
            .withMessage('Email is required')
            .isEmail()
            .withMessage('Must provide a valid email address')
            .normalizeEmail(),
    ],
};
//# sourceMappingURL=auth.validation.js.map