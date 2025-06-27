"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../middleware/auth");
const utils_1 = require("../utils");
const test_utils_1 = require("../test-utils");
describe('Authentication Middleware', () => {
    let userId;
    let validToken;
    let mockReq;
    let mockRes;
    let mockNext;
    beforeAll(async () => {
        // Create a test user
        const { user, token } = await (0, utils_1.createTestUser)();
        userId = user.id;
        validToken = token;
    });
    beforeEach(() => {
        mockReq = {};
        mockRes = (0, test_utils_1.mockResponse)();
        mockNext = jest.fn();
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it('should call next() when valid token is provided', async () => {
        mockReq = {
            cookies: {
                accessToken: validToken,
            },
        };
        await (0, auth_1.authMiddleware)(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user?.id).toBe(userId);
    });
    it('should return 401 when no token is provided', async () => {
        mockReq = {
            cookies: {},
        };
        await (0, auth_1.authMiddleware)(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'No authentication token provided',
        });
        expect(mockNext).not.toHaveBeenCalled();
    });
    it('should return 401 when token is invalid', async () => {
        mockReq = {
            cookies: {
                accessToken: 'invalidtoken',
            },
        };
        await (0, auth_1.authMiddleware)(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveProperty('error');
        expect(mockNext).not.toHaveBeenCalled();
    });
    describe('Optional Auth Middleware', () => {
        it('should set user when valid token is provided', async () => {
            mockReq = {
                cookies: {
                    accessToken: validToken,
                },
            };
            await (0, auth_1.optionalAuthMiddleware)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user?.id).toBe(userId);
        });
        it('should not set user when no token is provided', async () => {
            mockReq = {
                cookies: {},
            };
            await (0, auth_1.optionalAuthMiddleware)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeUndefined();
        });
        it('should not set user when token is invalid', async () => {
            mockReq = {
                cookies: {
                    accessToken: 'invalidtoken',
                },
            };
            await (0, auth_1.optionalAuthMiddleware)(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeUndefined();
        });
    });
});
//# sourceMappingURL=auth.test.js.map