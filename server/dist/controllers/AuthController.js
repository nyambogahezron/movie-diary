"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errors_1 = require("../utils/errors");
const User_1 = require("../helpers/User");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, asyncHandler_1.default)(async (req, res) => {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
        res
            .status(400)
            .json({ error: 'Username, email, and password are required' });
        return;
    }
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const authPayload = await AuthService_1.AuthService.register(name, username, email, password, ipAddress);
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            name: authPayload.user.name,
            username: authPayload.user.username,
            email: authPayload.user.email,
        },
    });
});
AuthController.login = (0, asyncHandler_1.default)(async (req, res) => {
    const { username, email, password, identifier } = req.body;
    const loginIdentifier = identifier || username || email;
    if (!loginIdentifier || !password) {
        throw new errors_1.BadRequestError('Invalid Credentials');
    }
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';
    const authPayload = await AuthService_1.AuthService.login(loginIdentifier, password, ipAddress, userAgent);
    res.cookie('accessToken', authPayload.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    if (authPayload.refreshToken) {
        res.cookie('refreshToken', authPayload.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
    res.status(200).json({
        message: 'Login successful',
        user: {
            id: authPayload.user.id,
            username: authPayload.user.username,
            email: authPayload.user.email,
            avatar: authPayload.user.avatar,
            createdAt: authPayload.user.createdAt,
        },
    });
});
AuthController.getCurrentUser = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    res.status(200).json({
        message: 'User profile retrieved successfully',
        user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
            createdAt: req.user.createdAt,
        },
    });
});
AuthController.refreshToken = (0, asyncHandler_1.default)(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
    }
    const { accessToken } = await AuthService_1.AuthService.refreshAccessToken(refreshToken);
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.status(200).json({
        message: 'Token refreshed successfully',
    });
});
AuthController.verifyEmail = (0, asyncHandler_1.default)(async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
        res.status(400).json({ error: 'Verification token is required' });
        return;
    }
    await AuthService_1.AuthService.verifyEmail(token);
    res.status(200).json({
        message: 'Email verified successfully',
    });
});
AuthController.requestPasswordReset = (0, asyncHandler_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    await AuthService_1.AuthService.requestPasswordReset(email);
    res.status(200).json({
        message: 'check your email for password reset instructions',
    });
});
AuthController.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
    const { code, email, newPassword } = req.body;
    if (!code || !email || !newPassword) {
        res
            .status(400)
            .json({ error: 'Reset code, email and new password are required' });
        return;
    }
    await AuthService_1.AuthService.resetPassword(code, email, newPassword);
    res.status(200).json({
        message: 'Password reset successful',
    });
});
AuthController.updateEmail = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
    }
    const { newEmail } = req.body;
    if (!newEmail) {
        res.status(400).json({ error: 'New email is required' });
        return;
    }
    await AuthService_1.AuthService.updateEmail(req.user.id, newEmail);
    res.status(200).json({
        message: 'Email update initiated. Please verify your new email address.',
    });
});
AuthController.uploadAvatar = (0, asyncHandler_1.default)(async (req, res) => {
    if (!req.file) {
        throw new errors_1.BadRequestError('No file uploaded');
    }
    const userId = req.user.id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    // Delete old avatar if it exists
    const currentUser = await User_1.User.findById(userId);
    if (currentUser?.avatar) {
        const oldAvatarPath = path_1.default.join(process.cwd(), currentUser.avatar);
        if (fs_1.default.existsSync(oldAvatarPath)) {
            fs_1.default.unlinkSync(oldAvatarPath);
        }
    }
    // Update user's avatar in database
    await User_1.User.updateAvatar(userId, avatarPath);
    res.status(200).json({
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarPath,
    });
});
//# sourceMappingURL=AuthController.js.map