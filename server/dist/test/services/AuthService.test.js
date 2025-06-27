"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuthService_1 = require("../../services/AuthService");
const User_1 = require("../../helpers/User");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const setup_1 = require("../setup");
const bcrypt_1 = __importDefault(require("bcrypt"));
const drizzle_orm_1 = require("drizzle-orm");
describe('AuthService', () => {
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        // Clear users before each test
        await test_db_1.db.delete(schema.users);
    });
    describe('register', () => {
        it('should register a new user and return authentication payload', async () => {
            const userData = {
                name: 'Test User',
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };
            const result = await AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password);
            // Check that we get proper auth payload
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user.username).toBe(userData.username);
            expect(result.user.email).toBe(userData.email);
            // Check database
            const users = await test_db_1.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.email, userData.email));
            expect(users.length).toBe(1);
            expect(users[0].username).toBe(userData.username);
            // Check that password was hashed
            const passwordMatch = await bcrypt_1.default.compare(userData.password, users[0].password);
            expect(passwordMatch).toBe(true);
        });
        it('should throw error if username already exists', async () => {
            // Create a user first
            const existingUser = {
                name: 'Existing User',
                username: 'existinguser',
                email: 'unique@example.com',
                password: await bcrypt_1.default.hash('password', 10),
            };
            await test_db_1.db.insert(schema.users).values(existingUser);
            // Try to register with same username
            const userData = {
                name: 'Test User',
                username: 'existinguser',
                email: 'different@example.com',
                password: 'Password123!',
            };
            await expect(AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password)).rejects.toThrow('Username already exists');
        });
        it('should throw error if email already exists', async () => {
            // Create a user first
            const existingUser = {
                name: 'Unique User',
                username: 'uniqueuser',
                email: 'existing@example.com',
                password: await bcrypt_1.default.hash('password', 10),
            };
            await test_db_1.db.insert(schema.users).values(existingUser);
            // Try to register with same email
            const userData = {
                name: 'Test User',
                username: 'differentuser',
                email: 'existing@example.com',
                password: 'Password123!',
            };
            await expect(AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password)).rejects.toThrow('Email already exists');
        });
    });
    describe('login', () => {
        beforeEach(async () => {
            // Create a test user for login tests
            await test_db_1.db.insert(schema.users).values({
                name: 'Login User',
                username: 'loginuser',
                email: 'login@example.com',
                password: await bcrypt_1.default.hash('correctpassword', 10),
            });
        });
        it('should return auth payload when credentials are valid', async () => {
            const result = await AuthService_1.AuthService.login('login@example.com', 'correctpassword');
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('login@example.com');
            expect(result.user.username).toBe('loginuser');
        });
        it('should throw error when user does not exist', async () => {
            await expect(AuthService_1.AuthService.login('nonexistent@example.com', 'anypassword')).rejects.toThrow('Invalid email or password');
        });
        it('should throw error when password is incorrect', async () => {
            await expect(AuthService_1.AuthService.login('login@example.com', 'wrongpassword')).rejects.toThrow('Invalid email or password');
        });
    });
    describe('getUserById', () => {
        let userId;
        beforeEach(async () => {
            // Create a test user
            const result = await test_db_1.db
                .insert(schema.users)
                .values({
                name: 'Get By ID User',
                username: 'getbyiduser',
                email: 'getbyid@example.com',
                password: await bcrypt_1.default.hash('password', 10),
            })
                .returning();
            userId = result[0].id;
        });
        it('should return user when valid ID is provided', async () => {
            const user = await User_1.User.findById(userId);
            expect(user).toHaveProperty('id', userId);
            expect(user).toHaveProperty('username', 'getbyiduser');
            expect(user).toHaveProperty('email', 'getbyid@example.com');
        });
        it('should return null when user does not exist', async () => {
            const user = await User_1.User.findById(9999);
            expect(user).toBeNull();
        });
    });
    describe('requestPasswordReset', () => {
        it('should generate a 6-digit reset code and store its hash in the database', async () => {
            // Create a test user
            const userData = {
                name: 'Reset User',
                username: 'resetuser',
                email: 'reset@example.com',
                password: 'Password123!',
            };
            await AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password);
            // Mock the code generation to return a predictable value
            jest
                .spyOn(require('../../utils/signedTokens').default, 'generateResetCode')
                .mockImplementation(() => '123456');
            // Spy on EmailService
            const emailServiceSpy = jest
                .spyOn(require('../../services/EmailService').EmailService, 'sendPasswordResetEmail')
                .mockImplementation(() => Promise.resolve());
            // Request password reset
            await AuthService_1.AuthService.requestPasswordReset(userData.email);
            // Check if user has reset token
            const users = await test_db_1.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.email, userData.email));
            const user = users[0];
            // Verify that reset token was set
            expect(user.passwordResetToken).toBeTruthy();
            expect(user.passwordResetExpires).toBeTruthy();
            // Verify token format - should be a hash containing userId and timestamp
            expect(user.passwordResetToken).not.toBeNull();
            const tokenParts = user.passwordResetToken.split('.');
            expect(tokenParts.length).toBe(3); // userId.timestamp.hash
            // Verify email was sent with the 6-digit code
            expect(emailServiceSpy).toHaveBeenCalledWith(expect.objectContaining({ email: userData.email }), '123456');
            // Clean up mocks
            jest.restoreAllMocks();
        });
        it('should throw an error when user is not found', async () => {
            await expect(AuthService_1.AuthService.requestPasswordReset('nonexistent@example.com')).rejects.toThrow('User not found');
        });
    });
    describe('resetPassword', () => {
        it('should verify code and reset password', async () => {
            // Create a test user
            const userData = {
                name: 'Reset User',
                username: 'resetuser',
                email: 'reset@example.com',
                password: 'Password123!',
            };
            await AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password);
            // Mock code generation
            jest
                .spyOn(require('../../utils/signedTokens').default, 'generateResetCode')
                .mockImplementation(() => '123456');
            // Mock email service
            jest
                .spyOn(require('../../services/EmailService').EmailService, 'sendPasswordResetEmail')
                .mockImplementation(() => Promise.resolve());
            jest
                .spyOn(require('../../services/EmailService').EmailService, 'sendPasswordChangeNotification')
                .mockImplementation(() => Promise.resolve());
            // Request password reset
            await AuthService_1.AuthService.requestPasswordReset(userData.email);
            // Reset password with the 6-digit code
            const newPassword = 'NewPassword123!';
            await AuthService_1.AuthService.resetPassword('123456', userData.email, newPassword);
            // Verify password was changed
            const updatedUsers = await test_db_1.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.email, userData.email));
            const updatedUser = updatedUsers[0];
            // Reset token should be cleared
            expect(updatedUser.passwordResetToken).toBeNull();
            expect(updatedUser.passwordResetExpires).toBeNull();
            // Password should be changed
            const passwordMatch = await bcrypt_1.default.compare(newPassword, updatedUser.password);
            expect(passwordMatch).toBe(true);
            // Clean up mocks
            jest.restoreAllMocks();
        });
        it('should reject invalid reset codes', async () => {
            // Create a test user
            const userData = {
                name: 'Reset User',
                username: 'resetuser',
                email: 'reset@example.com',
                password: 'Password123!',
            };
            await AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password);
            // Mock code generation
            jest
                .spyOn(require('../../utils/signedTokens').default, 'generateResetCode')
                .mockImplementation(() => '123456');
            // Mock email service
            jest
                .spyOn(require('../../services/EmailService').EmailService, 'sendPasswordResetEmail')
                .mockImplementation(() => Promise.resolve());
            // Request password reset
            await AuthService_1.AuthService.requestPasswordReset(userData.email);
            // Try to reset with invalid code
            await expect(AuthService_1.AuthService.resetPassword('654321', userData.email, 'NewPassword123!')).rejects.toThrow('Invalid reset code');
            // Clean up mocks
            jest.restoreAllMocks();
        });
        it('should be able to verify reset code without requiring a token in URL', async () => {
            // Create a test user
            const userData = {
                name: 'Reset User',
                username: 'resetuser',
                email: 'reset@example.com',
                password: 'Password123!',
            };
            await AuthService_1.AuthService.register(userData.name, userData.username, userData.email, userData.password);
            // Mock code generation
            jest
                .spyOn(require('../../utils/signedTokens').default, 'generateResetCode')
                .mockImplementation(() => '123456');
            // Mock email service
            jest
                .spyOn(require('../../services/EmailService').EmailService, 'sendPasswordResetEmail')
                .mockImplementation(() => Promise.resolve());
            // Request password reset
            await AuthService_1.AuthService.requestPasswordReset(userData.email);
            // Get the stored hash from the database
            const users = await test_db_1.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.eq)(schema.users.email, userData.email));
            const user = users[0];
            const storedHash = user.passwordResetToken;
            expect(storedHash).not.toBeNull();
            // Import Token directly for testing
            const Token = require('../../utils/signedTokens').default;
            // Verify the reset code against the stored hash
            const isValid = Token.verifyResetCode('123456', storedHash);
            // Check verification results
            expect(isValid).toBe(true);
            // Clean up mocks
            jest.restoreAllMocks();
        });
    });
});
//# sourceMappingURL=AuthService.test.js.map