"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockResponse = void 0;
const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
exports.mockResponse = mockResponse;
//# sourceMappingURL=test-utils.js.map