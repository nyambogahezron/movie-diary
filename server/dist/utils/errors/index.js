"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = void 0;
const http_status_codes_1 = require("http-status-codes");
class CustomError extends Error {
    constructor({ message, statusCode, }) {
        super(message);
        this.statusCode = statusCode;
    }
}
exports.default = CustomError;
class NotFoundError extends CustomError {
    constructor(message) {
        super({ message, statusCode: http_status_codes_1.StatusCodes.NOT_FOUND });
        this.statusCode = http_status_codes_1.StatusCodes.NOT_FOUND;
    }
}
exports.NotFoundError = NotFoundError;
class BadRequestError extends CustomError {
    constructor(message) {
        super({ message, statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST });
        this.statusCode = http_status_codes_1.StatusCodes.BAD_REQUEST;
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends CustomError {
    constructor(message) {
        super({ message, statusCode: http_status_codes_1.StatusCodes.UNAUTHORIZED });
        this.statusCode = http_status_codes_1.StatusCodes.UNAUTHORIZED;
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends CustomError {
    constructor(message) {
        super({ message, statusCode: http_status_codes_1.StatusCodes.FORBIDDEN });
        this.statusCode = http_status_codes_1.StatusCodes.FORBIDDEN;
    }
}
exports.ForbiddenError = ForbiddenError;
class InternalServerError extends CustomError {
    constructor(message) {
        super({ message, statusCode: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR });
        this.statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    }
}
exports.InternalServerError = InternalServerError;
//# sourceMappingURL=index.js.map