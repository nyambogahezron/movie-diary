"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const AnalyticsService_1 = require("../services/AnalyticsService");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
class AnalyticsController {
    constructor() {
        this.getEndpointAnalytics = (0, asyncHandler_1.default)(async (req, res) => {
            const { startDate, endDate } = req.query;
            const endpoints = await this.analyticsService.getEndpointAnalytics(startDate, endDate);
            res.json(endpoints);
        });
        this.getEndpointDetail = (0, asyncHandler_1.default)(async (req, res) => {
            const { endpoint, method } = req.params;
            const { startDate, endDate } = req.query;
            const details = await this.analyticsService.getEndpointDetail(endpoint, method, startDate, endDate);
            res.json(details);
        });
        this.getUserAnalytics = (0, asyncHandler_1.default)(async (req, res) => {
            const { startDate, endDate, limit, offset } = req.query;
            const users = await this.analyticsService.getUserAnalytics(startDate, endDate, parseInt(limit) || 50, parseInt(offset) || 0);
            res.json(users);
        });
        this.getUserDetail = (0, asyncHandler_1.default)(async (req, res) => {
            const { userId } = req.params;
            const { startDate, endDate } = req.query;
            const details = await this.analyticsService.getUserDetail(parseInt(userId), startDate, endDate);
            res.json(details);
        });
        this.getSystemAnalytics = (0, asyncHandler_1.default)(async (req, res) => {
            const { startDate, endDate } = req.query;
            const systemStats = await this.analyticsService.getSystemAnalytics(startDate, endDate);
            res.json(systemStats);
        });
        this.getRealTimeAnalytics = (0, asyncHandler_1.default)(async (req, res) => {
            const realTimeData = await this.analyticsService.getRealTimeAnalytics();
            res.json(realTimeData);
        });
        this.analyticsService = new AnalyticsService_1.AnalyticsService();
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=AnalyticsController.js.map