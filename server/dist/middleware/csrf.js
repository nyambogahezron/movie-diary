"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCsrfToken = exports.csrfMiddleware = void 0;
const csurf_1 = __importDefault(require("csurf"));
// Create CSRF protection middleware
const csrfProtection = (0, csurf_1.default)({
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: true,
    },
});
/**
 * CSRF protection middleware
 * This middleware adds CSRF protection to routes that modify data
 */
const csrfMiddleware = (req, res, next) => {
    // Skip CSRF for API routes that are called from mobile apps or other non-browser clients
    // We might want to implement a different security mechanism for these routes
    if (req.path.startsWith('/api/') && req.get('X-API-Client') === 'mobile') {
        return next();
    }
    // Apply CSRF protection
    return csrfProtection(req, res, next);
};
exports.csrfMiddleware = csrfMiddleware;
/**
 * Generate CSRF token middleware
 * This middleware generates and sends a CSRF token to the client
 */
exports.generateCsrfToken = [
    csrfProtection,
    (req, res) => {
        // Send the CSRF token to the client
        res.status(200).json({
            csrfToken: req.csrfToken(),
        });
    },
];
//# sourceMappingURL=csrf.js.map