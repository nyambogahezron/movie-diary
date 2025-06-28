"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const errors_1 = require("../utils/errors");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const schema_2 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AnalyticsService {
    async getEndpointAnalytics(startDate, endDate) {
        const currentDate = new Date().toISOString().split('T')[0];
        const start = startDate || currentDate;
        const end = endDate || currentDate;
        const analytics = await db_1.db
            .select({
            endpoint: schema_1.endpointAnalytics.endpoint,
            method: schema_1.endpointAnalytics.method,
            totalRequests: (0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.totalRequests})`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.endpointAnalytics.avgResponseTime}))`,
            minResponseTime: (0, drizzle_orm_1.sql) `MIN(${schema_1.endpointAnalytics.minResponseTime})`,
            maxResponseTime: (0, drizzle_orm_1.sql) `MAX(${schema_1.endpointAnalytics.maxResponseTime})`,
            successCount: (0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.successCount})`,
            errorCount: (0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.errorCount})`,
        })
            .from(schema_1.endpointAnalytics)
            .where((0, drizzle_orm_1.between)(schema_1.endpointAnalytics.date, start, end))
            .groupBy(schema_1.endpointAnalytics.endpoint, schema_1.endpointAnalytics.method)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.totalRequests})`));
        return {
            startDate: start,
            endDate: end,
            endpoints: analytics,
            totalEndpoints: analytics.length,
            totalRequests: analytics.reduce((sum, item) => sum + Number(item.totalRequests), 0),
            avgResponseTime: Math.round(analytics.reduce((sum, item) => sum + Number(item.avgResponseTime), 0) /
                (analytics.length || 1)),
        };
    }
    async getEndpointDetail(endpoint, method, startDate, endDate) {
        const currentDate = new Date().toISOString().split('T')[0];
        const start = startDate || currentDate;
        const end = endDate || currentDate;
        const aggregatedData = await db_1.db
            .select({
            endpoint: schema_1.endpointAnalytics.endpoint,
            method: schema_1.endpointAnalytics.method,
            totalRequests: (0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.totalRequests})`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.endpointAnalytics.avgResponseTime}))`,
            minResponseTime: (0, drizzle_orm_1.sql) `MIN(${schema_1.endpointAnalytics.minResponseTime})`,
            maxResponseTime: (0, drizzle_orm_1.sql) `MAX(${schema_1.endpointAnalytics.maxResponseTime})`,
            successCount: (0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.successCount})`,
            errorCount: (0, drizzle_orm_1.sql) `SUM(${schema_1.endpointAnalytics.errorCount})`,
            successRate: (0, drizzle_orm_1.sql) `ROUND(SUM(${schema_1.endpointAnalytics.successCount}) * 100.0 / SUM(${schema_1.endpointAnalytics.totalRequests}), 2)`,
        })
            .from(schema_1.endpointAnalytics)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.endpointAnalytics.endpoint, endpoint), (0, drizzle_orm_1.eq)(schema_1.endpointAnalytics.method, method), (0, drizzle_orm_1.between)(schema_1.endpointAnalytics.date, start, end)))
            .groupBy(schema_1.endpointAnalytics.endpoint, schema_1.endpointAnalytics.method);
        const dailyBreakdown = await db_1.db
            .select({
            date: schema_1.endpointAnalytics.date,
            totalRequests: schema_1.endpointAnalytics.totalRequests,
            avgResponseTime: schema_1.endpointAnalytics.avgResponseTime,
            successCount: schema_1.endpointAnalytics.successCount,
            errorCount: schema_1.endpointAnalytics.errorCount,
        })
            .from(schema_1.endpointAnalytics)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.endpointAnalytics.endpoint, endpoint), (0, drizzle_orm_1.eq)(schema_1.endpointAnalytics.method, method), (0, drizzle_orm_1.between)(schema_1.endpointAnalytics.date, start, end)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.endpointAnalytics.date));
        const recentRequests = await db_1.db
            .select({
            id: schema_1.requestLogs.id,
            timestamp: schema_1.requestLogs.timestamp,
            userId: schema_1.requestLogs.userId,
            statusCode: schema_1.requestLogs.statusCode,
            responseTime: schema_1.requestLogs.responseTime,
            query: schema_1.requestLogs.query,
            body: schema_1.requestLogs.body,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.requestLogs.endpoint, endpoint), (0, drizzle_orm_1.eq)(schema_1.requestLogs.method, method), (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.requestLogs.timestamp))
            .limit(50);
        return {
            endpoint,
            method,
            startDate: start,
            endDate: end,
            metrics: aggregatedData[0] || {
                totalRequests: 0,
                avgResponseTime: 0,
                minResponseTime: 0,
                maxResponseTime: 0,
                successCount: 0,
                errorCount: 0,
                successRate: 0,
            },
            dailyBreakdown,
            recentRequests,
        };
    }
    async getUserAnalytics(startDate, endDate, limit = 50, offset = 0) {
        const currentDate = new Date().toISOString().split('T')[0];
        const start = startDate || currentDate;
        const end = endDate || currentDate;
        const analytics = await db_1.db
            .select({
            userId: schema_1.userAnalytics.userId,
            username: schema_2.users.username,
            totalRequests: (0, drizzle_orm_1.sql) `SUM(${schema_1.userAnalytics.totalRequests})`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.userAnalytics.avgResponseTime}))`,
            lastActivity: (0, drizzle_orm_1.sql) `MAX(${schema_1.userAnalytics.lastActivity})`,
        })
            .from(schema_1.userAnalytics)
            .leftJoin(schema_2.users, (0, drizzle_orm_1.eq)(schema_1.userAnalytics.userId, schema_2.users.id))
            .where((0, drizzle_orm_1.between)(schema_1.userAnalytics.date, start, end))
            .groupBy(schema_1.userAnalytics.userId)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `SUM(${schema_1.userAnalytics.totalRequests})`))
            .limit(limit)
            .offset(offset);
        const countResult = await db_1.db
            .select({
            count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.userAnalytics.userId})`,
        })
            .from(schema_1.userAnalytics)
            .where((0, drizzle_orm_1.between)(schema_1.userAnalytics.date, start, end));
        return {
            startDate: start,
            endDate: end,
            users: analytics,
            totalUsers: Number(countResult[0]?.count || 0),
            limit,
            offset,
        };
    }
    async getUserDetail(userId, startDate, endDate) {
        const currentDate = new Date().toISOString().split('T')[0];
        const start = startDate || currentDate;
        const end = endDate || currentDate;
        const userInfo = await db_1.db
            .select({
            id: schema_2.users.id,
            username: schema_2.users.username,
            email: schema_2.users.email,
            createdAt: schema_2.users.createdAt,
        })
            .from(schema_2.users)
            .where((0, drizzle_orm_1.eq)(schema_2.users.id, userId))
            .limit(1);
        if (!userInfo.length) {
            throw new errors_1.BadRequestError('User not found');
        }
        const aggregatedData = await db_1.db
            .select({
            totalRequests: (0, drizzle_orm_1.sql) `SUM(${schema_1.userAnalytics.totalRequests})`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.userAnalytics.avgResponseTime}))`,
            lastActivity: (0, drizzle_orm_1.sql) `MAX(${schema_1.userAnalytics.lastActivity})`,
        })
            .from(schema_1.userAnalytics)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userAnalytics.userId, userId), (0, drizzle_orm_1.between)(schema_1.userAnalytics.date, start, end)));
        const dailyBreakdown = await db_1.db
            .select({
            date: schema_1.userAnalytics.date,
            totalRequests: schema_1.userAnalytics.totalRequests,
            avgResponseTime: schema_1.userAnalytics.avgResponseTime,
        })
            .from(schema_1.userAnalytics)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userAnalytics.userId, userId), (0, drizzle_orm_1.between)(schema_1.userAnalytics.date, start, end)))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.userAnalytics.date));
        const endpointUsage = await db_1.db
            .select({
            endpoint: schema_1.requestLogs.endpoint,
            method: schema_1.requestLogs.method,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.requestLogs.userId, userId), (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`))
            .groupBy(schema_1.requestLogs.endpoint, schema_1.requestLogs.method)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`));
        const recentActivity = await db_1.db
            .select({
            id: schema_1.requestLogs.id,
            timestamp: schema_1.requestLogs.timestamp,
            method: schema_1.requestLogs.method,
            path: schema_1.requestLogs.path,
            endpoint: schema_1.requestLogs.endpoint,
            statusCode: schema_1.requestLogs.statusCode,
            responseTime: schema_1.requestLogs.responseTime,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.requestLogs.userId, userId), (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.requestLogs.timestamp))
            .limit(50);
        return {
            user: userInfo[0],
            startDate: start,
            endDate: end,
            metrics: aggregatedData[0] || {
                totalRequests: 0,
                avgResponseTime: 0,
                lastActivity: null,
            },
            dailyBreakdown,
            endpointUsage,
            recentActivity,
        };
    }
    async getSystemAnalytics(startDate, endDate) {
        const currentDate = new Date().toISOString().split('T')[0];
        const start = startDate || currentDate;
        const end = endDate || currentDate;
        const requestStats = await db_1.db
            .select({
            totalRequests: (0, drizzle_orm_1.sql) `COUNT(*)`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
            successCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
            errorCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`));
        const dailyStats = await db_1.db
            .select({
            date: (0, drizzle_orm_1.sql) `date(${schema_1.requestLogs.timestamp})`,
            totalRequests: (0, drizzle_orm_1.sql) `COUNT(*)`,
            successCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
            errorCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`))
            .groupBy((0, drizzle_orm_1.sql) `date(${schema_1.requestLogs.timestamp})`)
            .orderBy((0, drizzle_orm_1.asc)((0, drizzle_orm_1.sql) `date(${schema_1.requestLogs.timestamp})`));
        const topEndpoints = await db_1.db
            .select({
            endpoint: schema_1.requestLogs.endpoint,
            method: schema_1.requestLogs.method,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`))
            .groupBy(schema_1.requestLogs.endpoint, schema_1.requestLogs.method)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`))
            .limit(10);
        const activeUserCount = await db_1.db
            .select({
            count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.requestLogs.userId})`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`, (0, drizzle_orm_1.sql) `${schema_1.requestLogs.userId} IS NOT NULL`));
        const errorBreakdown = await db_1.db
            .select({
            statusCode: schema_1.requestLogs.statusCode,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${start}')`, (0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) <= datetime('${end}')`, (0, drizzle_orm_1.sql) `${schema_1.requestLogs.statusCode} >= 400`))
            .groupBy(schema_1.requestLogs.statusCode)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`));
        return {
            startDate: start,
            endDate: end,
            metrics: requestStats[0] || {
                totalRequests: 0,
                avgResponseTime: 0,
                successCount: 0,
                errorCount: 0,
            },
            dailyStats,
            topEndpoints,
            activeUsers: Number(activeUserCount[0]?.count || 0),
            errorBreakdown,
        };
    }
    async getRealTimeAnalytics() {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        const oneHourAgoStr = oneHourAgo.toISOString();
        // Get requests in the last hour
        const recentRequests = await db_1.db
            .select({
            id: schema_1.requestLogs.id,
            timestamp: schema_1.requestLogs.timestamp,
            userId: schema_1.requestLogs.userId,
            method: schema_1.requestLogs.method,
            path: schema_1.requestLogs.path,
            endpoint: schema_1.requestLogs.endpoint,
            statusCode: schema_1.requestLogs.statusCode,
            responseTime: schema_1.requestLogs.responseTime,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.requestLogs.timestamp))
            .limit(100);
        // Get requests per minute for the past hour
        const requestsPerMinute = await db_1.db
            .select({
            minute: (0, drizzle_orm_1.sql) `strftime('%Y-%m-%d %H:%M', ${schema_1.requestLogs.timestamp})`,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
            successCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
            errorCount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN ${schema_1.requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`)
            .groupBy((0, drizzle_orm_1.sql) `strftime('%Y-%m-%d %H:%M', ${schema_1.requestLogs.timestamp})`)
            .orderBy((0, drizzle_orm_1.asc)((0, drizzle_orm_1.sql) `strftime('%Y-%m-%d %H:%M', ${schema_1.requestLogs.timestamp})`));
        // Get top endpoints in the past hour
        const topEndpoints = await db_1.db
            .select({
            endpoint: schema_1.requestLogs.endpoint,
            method: schema_1.requestLogs.method,
            count: (0, drizzle_orm_1.sql) `COUNT(*)`,
            avgResponseTime: (0, drizzle_orm_1.sql) `ROUND(AVG(${schema_1.requestLogs.responseTime}))`,
        })
            .from(schema_1.requestLogs)
            .where((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`)
            .groupBy(schema_1.requestLogs.endpoint, schema_1.requestLogs.method)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`))
            .limit(5);
        // Get active users in the past hour
        const activeUsers = await db_1.db
            .select({
            userId: schema_1.requestLogs.userId,
            username: schema_2.users.username,
            requestCount: (0, drizzle_orm_1.sql) `COUNT(*)`,
        })
            .from(schema_1.requestLogs)
            .leftJoin(schema_2.users, (0, drizzle_orm_1.eq)(schema_1.requestLogs.userId, schema_2.users.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `datetime(${schema_1.requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`, (0, drizzle_orm_1.sql) `${schema_1.requestLogs.userId} IS NOT NULL`))
            .groupBy(schema_1.requestLogs.userId)
            .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`))
            .limit(10);
        return {
            timestamp: new Date().toISOString(),
            periodStart: oneHourAgoStr,
            recentRequests,
            requestsPerMinute,
            topEndpoints,
            activeUsers,
            summary: {
                totalRequests: recentRequests.length,
                successRequests: recentRequests.filter((r) => r.statusCode < 400)
                    .length,
                errorRequests: recentRequests.filter((r) => r.statusCode >= 400).length,
                avgResponseTime: Math.round(recentRequests.reduce((sum, r) => sum + r.responseTime, 0) /
                    (recentRequests.length || 1)),
                activeUserCount: activeUsers.length,
            },
        };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=AnalyticsService.js.map