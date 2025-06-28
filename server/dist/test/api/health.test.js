"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const test_app_1 = require("../test-app");
describe('Health Check', () => {
    const app = (0, test_app_1.createTestApp)();
    const request = (0, supertest_1.default)(app);
    it('should return status 200 and ok message', async () => {
        const response = await request.get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'ok',
            message: 'Server is running',
        });
    });
});
//# sourceMappingURL=health.test.js.map