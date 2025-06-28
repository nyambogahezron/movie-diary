"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
class AdminController {
    constructor() {
        this.getRequestLogs = (0, asyncHandler_1.default)(async (req, res) => {
            const { startDate, endDate, userId, limit = 100, offset = 0 } = req.query;
            const conditions = [];
            if (startDate && endDate) {
                conditions.push((0, drizzle_orm_1.between)((0, drizzle_orm_1.sql) `DATE(${schema_1.requestLogs.timestamp})`, startDate, endDate));
            }
            if (userId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.requestLogs.userId, parseInt(userId)));
            }
            const logs = await db_1.db
                .select({
                id: schema_1.requestLogs.id,
                userId: schema_1.requestLogs.userId,
                method: schema_1.requestLogs.method,
                path: schema_1.requestLogs.path,
                endpoint: schema_1.requestLogs.endpoint,
                statusCode: schema_1.requestLogs.statusCode,
                responseTime: schema_1.requestLogs.responseTime,
                timestamp: schema_1.requestLogs.timestamp,
                userAgent: schema_1.requestLogs.userAgent,
                ipAddress: schema_1.requestLogs.ipAddress,
                contentLength: schema_1.requestLogs.contentLength,
            })
                .from(schema_1.requestLogs)
                .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.requestLogs.timestamp))
                .limit(parseInt(limit))
                .offset(parseInt(offset));
            // Get aggregate statistics
            const stats = await db_1.db
                .select({
                totalLogs: (0, drizzle_orm_1.sql) `COUNT(*)`,
                avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
                successCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} >= 200 AND ${schema_1.requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
                errorCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
                uniqueUsers: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.requestLogs.userId})`,
            })
                .from(schema_1.requestLogs)
                .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined);
            const totalLogs = Number(stats[0]?.totalLogs || 0);
            const successCount = Number(stats[0]?.successCount || 0);
            const successRate = totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 0;
            res.json({
                logs,
                totalLogs,
                avgResponseTime: Number(stats[0]?.avgResponseTime || 0),
                successRate,
                uniqueUsers: Number(stats[0]?.uniqueUsers || 0),
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: logs.length === parseInt(limit),
                },
            });
        });
        this.getDashboard = (0, asyncHandler_1.default)(async (req, res) => {
            res.sendFile('admin.html', { root: './public' });
        });
        this.getSystemOverview = (0, asyncHandler_1.default)(async (req, res) => {
            const { days = 7 } = req.query;
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - parseInt(days));
            const startDate = daysAgo.toISOString().split('T')[0];
            const endDate = new Date().toISOString().split('T')[0];
            const requestStats = await db_1.db
                .select({
                totalRequests: (0, drizzle_orm_1.sql) `COUNT(*)`,
                avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
                uniqueUsers: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.requestLogs.userId})`,
                successRate: (0, drizzle_orm_1.sql) `ROUND(AVG(CASE WHEN ${schema_1.requestLogs.statusCode} >= 200 AND ${schema_1.requestLogs.statusCode} < 400 THEN 100.0 ELSE 0.0 END), 2)`,
            })
                .from(schema_1.requestLogs)
                .where((0, drizzle_orm_1.between)((0, drizzle_orm_1.sql) `DATE(${schema_1.requestLogs.timestamp})`, startDate, endDate));
            const totalUsers = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` }).from(schema_1.users);
            const topEndpoints = await db_1.db
                .select({
                endpoint: schema_1.requestLogs.endpoint,
                method: schema_1.requestLogs.method,
                count: (0, drizzle_orm_1.sql) `COUNT(*) as count`,
                avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
            })
                .from(schema_1.requestLogs)
                .where((0, drizzle_orm_1.between)((0, drizzle_orm_1.sql) `DATE(${schema_1.requestLogs.timestamp})`, startDate, endDate))
                .groupBy(schema_1.requestLogs.endpoint, schema_1.requestLogs.method)
                .orderBy((0, drizzle_orm_1.sql) `count DESC`)
                .limit(10);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const recentActivity = await db_1.db
                .select({
                hour: (0, drizzle_orm_1.sql) `strftime('%H', ${schema_1.requestLogs.timestamp}) as hour`,
                count: (0, drizzle_orm_1.sql) `COUNT(*) as count`,
            })
                .from(schema_1.requestLogs)
                .where((0, drizzle_orm_1.sql) `${schema_1.requestLogs.timestamp} >= ${yesterday.toISOString()}`)
                .groupBy((0, drizzle_orm_1.sql) `strftime('%H', ${schema_1.requestLogs.timestamp})`)
                .orderBy((0, drizzle_orm_1.sql) `hour`);
            res.json({
                summary: {
                    totalRequests: Number(requestStats[0]?.totalRequests || 0),
                    avgResponseTime: Number(requestStats[0]?.avgResponseTime || 0),
                    uniqueUsers: Number(requestStats[0]?.uniqueUsers || 0),
                    successRate: Number(requestStats[0]?.successRate || 0),
                    totalUsers: Number(totalUsers[0]?.count || 0),
                },
                topEndpoints,
                recentActivity,
                period: {
                    startDate,
                    endDate,
                    days: parseInt(days),
                },
            });
        });
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map