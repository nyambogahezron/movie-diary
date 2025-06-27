"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorHandlerMiddleware;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = __importDefault(require("../utils/errors"));
function ErrorHandlerMiddleware(err, req, res, next) {
    // default error
    let customError = new errors_1.default({
        message: 'Something went wrong, please try again later',
        statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
    });
    // check if error is an instance of CustomError
    if (err instanceof errors_1.default) {
        res.status(err.statusCode).json({ message: err.message });
        return;
    }
    if (err.name === 'AuthenticationError') {
        customError = new errors_1.default({
            message: err.message,
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
        res.status(customError.statusCode).json({ message: customError.message });
        return;
    }
    if (err.name === 'Validation error' || Array.isArray(err.errors)) {
        const validationError = err;
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            error: 'Validation error',
            details: validationError.errors || [],
        });
        return;
    }
    if (err.name === 'CastError') {
        customError = new errors_1.default({
            message: 'Invalid ID',
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
        res.status(customError.statusCode).json({ message: customError.message });
        return;
    }
    if (err.code === 11000) {
        customError = new errors_1.default({
            message: 'Duplicate field value entered',
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
        });
        res.status(customError.statusCode).json({ message: customError.message });
        return;
    }
    // check if error is a JWT error
    if (err.name === 'JsonWebTokenError') {
        customError = new errors_1.default({
            message: 'Invalid token',
            statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
        res.status(customError.statusCode).json({ message: customError.message });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        customError = new errors_1.default({
            message: 'Token expired',
            statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED,
        });
        res.status(customError.statusCode).json({ message: customError.message });
        return;
    }
    // check if error is a LibSQL/SQLite error
    if (err.name === 'LibsqlError') {
        // Constraint violations
        if (err.message.includes('SQLITE_CONSTRAINT')) {
            if (err.message.includes('NOT NULL constraint failed')) {
                // Extract the column name from the error message
                const match = err.message.match(/NOT NULL constraint failed: (\w+\.\w+)/);
                const columnInfo = match ? match[1] : 'required field';
                customError = new errors_1.default({
                    message: `Missing required field: ${columnInfo.split('.').pop()}`,
                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
            else if (err.message.includes('UNIQUE constraint failed')) {
                const match = err.message.match(/UNIQUE constraint failed: (\w+\.\w+)/);
                const columnInfo = match ? match[1] : 'field';
                customError = new errors_1.default({
                    message: `Duplicate value for ${columnInfo.split('.').pop()}`,
                    statusCode: http_status_codes_1.StatusCodes.CONFLICT,
                });
            }
            else if (err.message.includes('FOREIGN KEY constraint failed')) {
                customError = new errors_1.default({
                    message: 'Invalid reference to related record',
                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
            else if (err.message.includes('CHECK constraint failed')) {
                customError = new errors_1.default({
                    message: 'Invalid data format or value',
                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
            else {
                customError = new errors_1.default({
                    message: 'Database constraint violation',
                    statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
        }
        // Database locked errors
        else if (err.message.includes('SQLITE_BUSY') ||
            err.message.includes('database is locked')) {
            customError = new errors_1.default({
                message: 'Database is temporarily unavailable, please try again',
                statusCode: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE,
            });
        }
        // Database corruption errors
        else if (err.message.includes('SQLITE_CORRUPT') ||
            err.message.includes('database disk image is malformed')) {
            customError = new errors_1.default({
                message: 'Database error, please contact support',
                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
        // No such table/column errors
        else if (err.message.includes('SQLITE_ERROR') &&
            (err.message.includes('no such table') ||
                err.message.includes('no such column'))) {
            customError = new errors_1.default({
                message: 'Database schema error, please contact support',
                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
        // Syntax errors
        else if (err.message.includes('SQLITE_ERROR') &&
            err.message.includes('syntax error')) {
            customError = new errors_1.default({
                message: 'Database query error, please contact support',
                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
        // Disk I/O errors
        else if (err.message.includes('SQLITE_IOERR') ||
            err.message.includes('disk I/O error')) {
            customError = new errors_1.default({
                message: 'Database storage error, please try again later',
                statusCode: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE,
            });
        }
        // Permission errors
        else if (err.message.includes('SQLITE_PERM') ||
            err.message.includes('access permission denied')) {
            customError = new errors_1.default({
                message: 'Database access error, please contact support',
                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
        // Database full errors
        else if (err.message.includes('SQLITE_FULL') ||
            err.message.includes('database or disk is full')) {
            customError = new errors_1.default({
                message: 'Storage capacity exceeded, please contact support',
                statusCode: http_status_codes_1.StatusCodes.INSUFFICIENT_STORAGE,
            });
        }
        // Connection errors
        else if (err.message.includes('SQLITE_CANTOPEN') ||
            err.message.includes('unable to open database')) {
            customError = new errors_1.default({
                message: 'Database connection error, please try again later',
                statusCode: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE,
            });
        }
        // Generic LibSQL errors
        else {
            customError = new errors_1.default({
                message: 'Database operation failed',
                statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
        res.status(customError.statusCode).json({ message: customError.message });
        return;
    }
    res.status(customError.statusCode).json({
        message: customError.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
//# sourceMappingURL=errorHandler.js.map