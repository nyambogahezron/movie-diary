import { StatusCodes } from 'http-status-codes';
import CustomError from '../utils/errors';
import { NextFunction, Request, Response } from 'express';

export default function ErrorHandlerMiddleware(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction
): void {
	// default error
	let customError = new CustomError({
		message: 'Something went wrong, please try again later',
		statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
	});

	// check if error is an instance of CustomError
	if (err instanceof CustomError) {
		res.status(err.statusCode).json({ message: err.message });
		return;
	}

	if (err.name === 'AuthenticationError') {
		customError = new CustomError({
			message: err.message,
			statusCode: StatusCodes.BAD_REQUEST,
		});
		res.status(customError.statusCode).json({ message: customError.message });
		return;
	}

	if (err.name === 'Validation error' || Array.isArray((err as any).errors)) {
		const validationError = err as any;
		res.status(StatusCodes.BAD_REQUEST).json({
			error: 'Validation error',
			details: validationError.errors || [],
		});
		return;
	}

	if (err.name === 'CastError') {
		customError = new CustomError({
			message: 'Invalid ID',
			statusCode: StatusCodes.BAD_REQUEST,
		});
		res.status(customError.statusCode).json({ message: customError.message });
		return;
	}

	if ((err as any).code === 11000) {
		customError = new CustomError({
			message: 'Duplicate field value entered',
			statusCode: StatusCodes.BAD_REQUEST,
		});
		res.status(customError.statusCode).json({ message: customError.message });
		return;
	}

	// check if error is a JWT error
	if (err.name === 'JsonWebTokenError') {
		customError = new CustomError({
			message: 'Invalid token',
			statusCode: StatusCodes.UNAUTHORIZED,
		});
		res.status(customError.statusCode).json({ message: customError.message });
		return;
	}

	if (err.name === 'TokenExpiredError') {
		customError = new CustomError({
			message: 'Token expired',
			statusCode: StatusCodes.UNAUTHORIZED,
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
				const match = err.message.match(
					/NOT NULL constraint failed: (\w+\.\w+)/
				);
				const columnInfo = match ? match[1] : 'required field';

				customError = new CustomError({
					message: `Missing required field: ${columnInfo.split('.').pop()}`,
					statusCode: StatusCodes.BAD_REQUEST,
				});
			} else if (err.message.includes('UNIQUE constraint failed')) {
				const match = err.message.match(/UNIQUE constraint failed: (\w+\.\w+)/);
				const columnInfo = match ? match[1] : 'field';

				customError = new CustomError({
					message: `Duplicate value for ${columnInfo.split('.').pop()}`,
					statusCode: StatusCodes.CONFLICT,
				});
			} else if (err.message.includes('FOREIGN KEY constraint failed')) {
				customError = new CustomError({
					message: 'Invalid reference to related record',
					statusCode: StatusCodes.BAD_REQUEST,
				});
			} else if (err.message.includes('CHECK constraint failed')) {
				customError = new CustomError({
					message: 'Invalid data format or value',
					statusCode: StatusCodes.BAD_REQUEST,
				});
			} else {
				customError = new CustomError({
					message: 'Database constraint violation',
					statusCode: StatusCodes.BAD_REQUEST,
				});
			}
		}
		// Database locked errors
		else if (
			err.message.includes('SQLITE_BUSY') ||
			err.message.includes('database is locked')
		) {
			customError = new CustomError({
				message: 'Database is temporarily unavailable, please try again',
				statusCode: StatusCodes.SERVICE_UNAVAILABLE,
			});
		}
		// Database corruption errors
		else if (
			err.message.includes('SQLITE_CORRUPT') ||
			err.message.includes('database disk image is malformed')
		) {
			customError = new CustomError({
				message: 'Database error, please contact support',
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		// No such table/column errors
		else if (
			err.message.includes('SQLITE_ERROR') &&
			(err.message.includes('no such table') ||
				err.message.includes('no such column'))
		) {
			customError = new CustomError({
				message: 'Database schema error, please contact support',
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		// Syntax errors
		else if (
			err.message.includes('SQLITE_ERROR') &&
			err.message.includes('syntax error')
		) {
			customError = new CustomError({
				message: 'Database query error, please contact support',
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		// Disk I/O errors
		else if (
			err.message.includes('SQLITE_IOERR') ||
			err.message.includes('disk I/O error')
		) {
			customError = new CustomError({
				message: 'Database storage error, please try again later',
				statusCode: StatusCodes.SERVICE_UNAVAILABLE,
			});
		}
		// Permission errors
		else if (
			err.message.includes('SQLITE_PERM') ||
			err.message.includes('access permission denied')
		) {
			customError = new CustomError({
				message: 'Database access error, please contact support',
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
			});
		}
		// Database full errors
		else if (
			err.message.includes('SQLITE_FULL') ||
			err.message.includes('database or disk is full')
		) {
			customError = new CustomError({
				message: 'Storage capacity exceeded, please contact support',
				statusCode: StatusCodes.INSUFFICIENT_STORAGE,
			});
		}
		// Connection errors
		else if (
			err.message.includes('SQLITE_CANTOPEN') ||
			err.message.includes('unable to open database')
		) {
			customError = new CustomError({
				message: 'Database connection error, please try again later',
				statusCode: StatusCodes.SERVICE_UNAVAILABLE,
			});
		}
		// Generic LibSQL errors
		else {
			customError = new CustomError({
				message: 'Database operation failed',
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
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
