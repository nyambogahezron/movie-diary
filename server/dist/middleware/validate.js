"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errors_1 = __importDefault(require("../utils/errors"));
const express_validator_1 = require("express-validator");
/**
 * Middleware to validate request using express-validator rules
 * @param validations - Array of validation chains
 */
const validate = (validations) => {
    return async (req, res, next) => {
        try {
            await Promise.all(validations.map((validation) => validation.run(req)));
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const error = new errors_1.default({
                    message: `Validation error: ${errors
                        .array()
                        .map((err) => `${err.type}: ${err.msg}`)
                        .join(', ')}`,
                    statusCode: 400,
                });
                error.errors = errors.array();
                throw error;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.js.map