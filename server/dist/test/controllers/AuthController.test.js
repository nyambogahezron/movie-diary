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
const supertest_1 = __importDefault(require("supertest"));
const test_app_1 = require("../test-app");
const setup_1 = require("../setup");
const test_db_1 = require("../../db/test-db");
const schema = __importStar(require("../../db/schema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const drizzle_orm_1 = require("drizzle-orm");
describe('AuthController', () => {
    const app = (0, test_app_1.createTestApp)();
    const request = (0, supertest_1.default)(app);
    beforeAll(async () => {
        await (0, setup_1.setupTestDatabase)();
    });
    afterAll(async () => {
        await (0, setup_1.teardownTestDatabase)();
    });
    beforeEach(async () => {
        await test_db_1.db.delete(schema.users);
    });
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                name: 'Test User',
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
            };
            const response = await request
                .post('/api/v1/auth/register')
                .send(userData);
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User registered successfully');
            expect(response.body.user).toHaveProperty('username');
            expect(response.body.user.username).toBe(userData.username);
            expect(response.body.user.email).toBe(userData.email);
            // Check if user was actually created in the database
            const users = await test_db_1.db
                .select()
                .from(schema.users)
                .where((0, drizzle_orm_1.sql) `${schema.users.email} = ${userData.email}`);
            expect(users.length).toBe(1);
            expect(users[0].username).toBe(userData.username);
        }, 10000);
        it('should return 400 if required fields are missing', async () => {
            const response = await request.post('/api/v1/auth/register').send({
                username: 'testuser',
                // Missing email and password
            });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('Validation error');
        });
    });
    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            // Create test user
            await test_db_1.db.insert(schema.users).values({
                name: 'Login User',
                username: 'loginuser',
                email: 'login@example.com',
                password: await bcrypt_1.default.hash('password123', 10),
            });
        });
        it('should login successfully with correct credentials', async () => {
            const response = await request.post('/api/v1/auth/login').send({
                identifier: 'login@example.com',
                password: 'password123',
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.user.email).toBe('login@example.com');
            // Check for cookies
            expect(response.headers['set-cookie']).toBeDefined();
            const cookies = response.headers['set-cookie'];
            expect(cookies.some((cookie) => cookie.startsWith('accessToken='))).toBe(true);
            expect(cookies.some((cookie) => cookie.startsWith('refreshToken='))).toBe(true);
        });
    });
});
//# sourceMappingURL=AuthController.test.js.map