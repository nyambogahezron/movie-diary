"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("../utils/errors");
class User {
    static async create(userData) {
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        const result = await db_1.db
            .insert(schema_1.users)
            .values({
            name: userData.name,
            username: userData.username,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            avatar: userData.avatar || null,
            isEmailVerified: false,
            emailVerificationToken: userData.emailVerificationToken,
            emailVerificationExpires: userData.emailVerificationExpires,
            passwordResetToken: userData.passwordResetToken,
            passwordResetExpires: userData.passwordResetExpires,
            lastLoginAt: userData.lastLoginAt,
            lastLoginIp: userData.lastLoginIp,
        })
            .returning();
        return result[0];
    }
    static async findByEmail(email) {
        const result = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email.toLowerCase()));
        return result[0];
    }
    static async findById(id) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return result[0];
    }
    static async findByUsername(username) {
        const result = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        return result[0];
    }
    static async findUser(identifier) {
        const resultByUsername = this.findByUsername(identifier);
        if (resultByUsername) {
            return resultByUsername;
        }
        const resultByEmail = await this.findByEmail(identifier);
        if (resultByEmail) {
            return resultByEmail;
        }
        return undefined;
    }
    static async comparePassword(hashedPassword, candidatePassword) {
        return bcrypt_1.default.compare(candidatePassword, hashedPassword);
    }
    static async updateAvatar(userId, avatar) {
        await db_1.db
            .update(schema_1.users)
            .set({ avatar, updatedAt: new Date().toISOString() })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    static async updateLoginInfo(userId, ip, timestamp) {
        await db_1.db
            .update(schema_1.users)
            .set({
            lastLoginIp: ip,
            lastLoginAt: timestamp,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    static async verifyEmail(verificationToken) {
        const result = await db_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.emailVerificationToken, verificationToken));
        if (result.length === 0) {
            throw new errors_1.BadRequestError('Invalid email verification token');
        }
        const user = result[0];
        if (user.isEmailVerified) {
            throw new errors_1.BadRequestError('Email is already verified');
        }
        // TODO: Check if the token is a valid token
        if (user.emailVerificationExpires &&
            new Date(user.emailVerificationExpires) < new Date()) {
            throw new errors_1.BadRequestError('Email verification token has expired');
        }
        // Mark email as verified
        await db_1.db
            .update(schema_1.users)
            .set({
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpires: null,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        return user;
    }
    static async updatePassword(userId, password) {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        await db_1.db
            .update(schema_1.users)
            .set({
            password: hashedPassword,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
    static async updateEmail(userId, email) {
        await db_1.db
            .update(schema_1.users)
            .set({
            email: email.toLowerCase(),
            isEmailVerified: false,
            updatedAt: new Date().toISOString(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map