"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../helpers/User");
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
const EmailService_1 = require("./EmailService");
const signedTokens_1 = __importDefault(require("../utils/signedTokens"));
class AuthService {
    static async register(name, username, email, password, ipAddress) {
        const isEmailTaken = await User_1.User.findByEmail(email);
        const isUserNameTaken = await User_1.User.findByUsername(username);
        if (isEmailTaken || isUserNameTaken) {
            throw new errors_1.BadRequestError(`Email or username already exists`);
        }
        const emailVerificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        const user = await User_1.User.create({
            name,
            username,
            email,
            password,
            emailVerificationToken,
            emailVerificationExpires,
            lastLoginIp: ipAddress,
            lastLoginAt: new Date().toISOString(),
        });
        await EmailService_1.EmailService.sendVerificationEmail(user, emailVerificationToken);
        await EmailService_1.EmailService.sendWelcomeEmail(user);
        return { user };
    }
    static async login(identifier, password, ipAddress, deviceInfo) {
        const user = await User_1.User.findUser(identifier);
        if (!user) {
            throw new errors_1.BadRequestError('Invalid credentials');
        }
        const isPasswordValid = await User_1.User.comparePassword(user.password, password);
        if (!isPasswordValid) {
            throw new errors_1.BadRequestError('Invalid credentials');
        }
        if (!user.isEmailVerified) {
            throw new errors_1.UnauthorizedError('Please verify your email address first');
        }
        // Check if this is a new login from different IP
        const previousIp = user.lastLoginIp;
        if (ipAddress && previousIp && ipAddress !== previousIp) {
            // New device detected - send notification email
            await EmailService_1.EmailService.sendNewLoginAlert(user, ipAddress, deviceInfo || 'Unknown device');
        }
        await User_1.User.updateLoginInfo(user.id, ipAddress || null, new Date().toISOString());
        const { accessToken, refreshToken } = this.generateTokens(user, deviceInfo);
        return { token: accessToken, refreshToken, user };
    }
    static async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            // Find user by ID from token
            const user = await User_1.User.findById(decoded.userId);
            if (!user) {
                throw new errors_1.BadRequestError('User not found');
            }
            return user;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.BadRequestError('Token expired');
            }
            throw new errors_1.BadRequestError('Invalid token');
        }
    }
    static async refreshAccessToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.JWT_REFRESH_SECRET);
            const user = await User_1.User.findById(decoded.userId);
            if (!user) {
                throw new errors_1.BadRequestError('User not found');
            }
            if (!user.isEmailVerified) {
                throw new errors_1.UnauthorizedError('Please verify your email address first');
            }
            const accessToken = this.generateAccessToken(user, decoded.deviceInfo);
            return { accessToken };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new errors_1.BadRequestError('Refresh token expired, please login again');
            }
            throw new errors_1.BadRequestError('Invalid refresh token');
        }
    }
    static async verifyEmail(token) {
        const user = await User_1.User.verifyEmail(token);
        if (!user) {
            throw new errors_1.BadRequestError('Invalid or expired verification token');
        }
        return user;
    }
    static async requestPasswordReset(email) {
        const user = await User_1.User.findByEmail(email);
        if (!user) {
            throw new errors_1.BadRequestError('User not found');
        }
        // Generate a 6-digit reset code
        const resetCode = signedTokens_1.default.generateResetCode();
        // Hash the reset code for storage
        const hashedResetToken = signedTokens_1.default.hashResetCode(resetCode, user.id);
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        await db_1.db
            .update(schema_1.users)
            .set({
            passwordResetToken: hashedResetToken,
            passwordResetExpires: resetExpires,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Send the plain text code to the user's email
        await EmailService_1.EmailService.sendPasswordResetEmail(user, resetCode);
        return;
    }
    static async resetPassword(code, email, newPassword) {
        // First find user by email
        const user = await User_1.User.findByEmail(email);
        if (!user) {
            throw new errors_1.BadRequestError('User not found');
        }
        // Check if user has a reset token
        if (!user.passwordResetToken) {
            throw new errors_1.BadRequestError('No reset code requested');
        }
        // Check if reset code has expired based on passwordResetExpires field
        if (user.passwordResetExpires &&
            new Date(user.passwordResetExpires) < new Date()) {
            throw new errors_1.BadRequestError('Reset code has expired');
        }
        // Verify the reset code against stored hash
        const isValidCode = signedTokens_1.default.verifyResetCode(code, user.passwordResetToken);
        if (!isValidCode) {
            throw new errors_1.BadRequestError('Invalid reset code');
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
        await db_1.db
            .update(schema_1.users)
            .set({
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        await EmailService_1.EmailService.sendPasswordChangeNotification(user);
    }
    static async updateEmail(userId, newEmail) {
        const existingUser = await User_1.User.findByEmail(newEmail);
        if (existingUser) {
            throw new errors_1.BadRequestError('Email is already registered');
        }
        const user = await User_1.User.findById(userId);
        if (!user) {
            throw new errors_1.BadRequestError('User not found');
        }
        const oldEmail = user.email;
        await User_1.User.updateEmail(userId, newEmail);
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await db_1.db
            .update(schema_1.users)
            .set({
            emailVerificationToken: verificationToken,
            emailVerificationExpires: verificationExpires,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        await EmailService_1.EmailService.sendEmailChangeNotification(user, oldEmail, newEmail);
        user.email = newEmail;
        await EmailService_1.EmailService.sendVerificationEmail(user, verificationToken);
    }
    static generateTokens(user, deviceInfo) {
        const accessToken = this.generateAccessToken(user, deviceInfo);
        const refreshToken = this.generateRefreshToken(user, deviceInfo);
        return { accessToken, refreshToken };
    }
    static generateAccessToken(user, deviceInfo) {
        return jsonwebtoken_1.default.sign({ userId: user.id, deviceInfo }, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
            algorithm: 'HS256',
        });
    }
    static generateRefreshToken(user, deviceInfo) {
        return jsonwebtoken_1.default.sign({ userId: user.id, deviceInfo }, this.JWT_REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
            algorithm: 'HS256',
        });
    }
}
exports.AuthService = AuthService;
AuthService.JWT_SECRET = process.env.JWT_SECRET;
AuthService.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
AuthService.ACCESS_TOKEN_EXPIRY = '15m';
AuthService.REFRESH_TOKEN_EXPIRY = '7d';
AuthService.RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET;
//# sourceMappingURL=AuthService.js.map