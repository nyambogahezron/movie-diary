"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AsyncHandler;
function AsyncHandler(fn) {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=asyncHandler.js.map