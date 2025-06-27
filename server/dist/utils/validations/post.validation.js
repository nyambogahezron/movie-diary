"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePostQuery = exports.validateCommentIdParam = exports.validateCommentUpdate = exports.validatePostComment = exports.validatePostIdParam = exports.validatePostUpdate = exports.validatePostCreate = void 0;
const express_validator_1 = require("express-validator");
exports.validatePostCreate = [
    (0, express_validator_1.body)('title')
        .isString()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 255 })
        .withMessage('Title cannot exceed 255 characters'),
    (0, express_validator_1.body)('tmdbId').isString().notEmpty().withMessage('TMDB ID is required'),
    (0, express_validator_1.body)('posterPath')
        .optional()
        .isString()
        .withMessage('Poster path must be a string'),
    (0, express_validator_1.body)('content')
        .isString()
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ max: 2000 })
        .withMessage('Content cannot exceed 2000 characters'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
];
exports.validatePostUpdate = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid post ID format'),
    (0, express_validator_1.body)('title')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ max: 255 })
        .withMessage('Title cannot exceed 255 characters'),
    (0, express_validator_1.body)('content')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Content cannot be empty')
        .isLength({ max: 2000 })
        .withMessage('Content cannot exceed 2000 characters'),
    (0, express_validator_1.body)('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean'),
];
exports.validatePostIdParam = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid post ID format'),
];
exports.validatePostComment = [
    (0, express_validator_1.param)('id').isInt().withMessage('Invalid post ID format'),
    (0, express_validator_1.body)('content')
        .isString()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters'),
];
exports.validateCommentUpdate = [
    (0, express_validator_1.param)('commentId').isInt().withMessage('Invalid comment ID format'),
    (0, express_validator_1.body)('content')
        .isString()
        .notEmpty()
        .withMessage('Comment content is required')
        .isLength({ max: 1000 })
        .withMessage('Comment cannot exceed 1000 characters'),
];
exports.validateCommentIdParam = [
    (0, express_validator_1.param)('commentId').isInt().withMessage('Invalid comment ID format'),
];
exports.validatePostQuery = [
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer'),
    (0, express_validator_1.query)('sortBy').optional().isString().withMessage('Sort by must be a string'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be either "asc" or "desc"'),
    (0, express_validator_1.query)('isPublic')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('isPublic must be either "true" or "false"'),
];
//# sourceMappingURL=post.validation.js.map