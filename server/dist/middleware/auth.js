"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCheck = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const AuthService_1 = require("../services/AuthService");
const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        if (!accessToken) {
            res.status(401).json({ error: 'No authentication token provided' });
            return;
        }
        try {
            const user = await AuthService_1.AuthService.verifyToken(accessToken);
            const isVerificationRoute = req.originalUrl.includes('/verify-email') ||
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
        }
        catch (error) {
            if (error.message === 'Token expired') {
                res.status(401).json({
                    error: 'Token expired',
                    code: 'TOKEN_EXPIRED',
                });
                return;
            }
            throw error;
        }
    }
    catch (error) {
        res
            .status(401)
            .json({ error: 'Authentication failed: ' + error.message });
    }
};
exports.authMiddleware = authMiddleware;
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        let accessToken = req.cookies?.accessToken;
        if (!accessToken && req.headers.authorization?.startsWith('Bearer ')) {
            accessToken = req.headers.authorization.split(' ')[1];
        }
        if (accessToken) {
            try {
                const user = await AuthService_1.AuthService.verifyToken(accessToken);
                req.user = user;
            }
            catch (error) { }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const adminCheck = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res
            .status(403)
            .json({ error: 'Access denied. Admin privileges required.' });
        return;
    }
    next();
};
exports.adminCheck = adminCheck;
//# sourceMappingURL=auth.js.map