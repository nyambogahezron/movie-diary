import { BadRequestError } from '../utils/errors';
import { db } from '../db';
import { requestLogs, userAnalytics, endpointAnalytics } from '../db/schema';
import { users } from '../db/schema';
import { eq, and, sql, between, desc, asc } from 'drizzle-orm';

export class AnalyticsService {
	async getEndpointAnalytics(startDate?: string, endDate?: string) {
		const currentDate = new Date().toISOString().split('T')[0];
		const start = startDate || currentDate;
		const end = endDate || currentDate;

		const analytics = await db
			.select({
				endpoint: endpointAnalytics.endpoint,
				method: endpointAnalytics.method,
				totalRequests: sql`SUM(${endpointAnalytics.totalRequests})`,
				avgResponseTime: sql`ROUND(AVG(${endpointAnalytics.avgResponseTime}))`,
				minResponseTime: sql`MIN(${endpointAnalytics.minResponseTime})`,
				maxResponseTime: sql`MAX(${endpointAnalytics.maxResponseTime})`,
				successCount: sql`SUM(${endpointAnalytics.successCount})`,
				errorCount: sql`SUM(${endpointAnalytics.errorCount})`,
			})
			.from(endpointAnalytics)
			.where(between(endpointAnalytics.date, start, end))
			.groupBy(endpointAnalytics.endpoint, endpointAnalytics.method)
			.orderBy(desc(sql`SUM(${endpointAnalytics.totalRequests})`));

		return {
			startDate: start,
			endDate: end,
			endpoints: analytics,
			totalEndpoints: analytics.length,
			totalRequests: analytics.reduce(
				(sum, item) => sum + Number(item.totalRequests),
				0
			),
			avgResponseTime: Math.round(
				analytics.reduce((sum, item) => sum + Number(item.avgResponseTime), 0) /
					(analytics.length || 1)
			),
		};
	}

	async getEndpointDetail(
		endpoint: string,
		method: string,
		startDate?: string,
		endDate?: string
	) {
		const currentDate = new Date().toISOString().split('T')[0];
		const start = startDate || currentDate;
		const end = endDate || currentDate;

		const aggregatedData = await db
			.select({
				endpoint: endpointAnalytics.endpoint,
				method: endpointAnalytics.method,
				totalRequests: sql`SUM(${endpointAnalytics.totalRequests})`,
				avgResponseTime: sql`ROUND(AVG(${endpointAnalytics.avgResponseTime}))`,
				minResponseTime: sql`MIN(${endpointAnalytics.minResponseTime})`,
				maxResponseTime: sql`MAX(${endpointAnalytics.maxResponseTime})`,
				successCount: sql`SUM(${endpointAnalytics.successCount})`,
				errorCount: sql`SUM(${endpointAnalytics.errorCount})`,
				successRate: sql`ROUND(SUM(${endpointAnalytics.successCount}) * 100.0 / SUM(${endpointAnalytics.totalRequests}), 2)`,
			})
			.from(endpointAnalytics)
			.where(
				and(
					eq(endpointAnalytics.endpoint, endpoint),
					eq(endpointAnalytics.method, method),
					between(endpointAnalytics.date, start, end)
				)
			)
			.groupBy(endpointAnalytics.endpoint, endpointAnalytics.method);

		const dailyBreakdown = await db
			.select({
				date: endpointAnalytics.date,
				totalRequests: endpointAnalytics.totalRequests,
				avgResponseTime: endpointAnalytics.avgResponseTime,
				successCount: endpointAnalytics.successCount,
				errorCount: endpointAnalytics.errorCount,
			})
			.from(endpointAnalytics)
			.where(
				and(
					eq(endpointAnalytics.endpoint, endpoint),
					eq(endpointAnalytics.method, method),
					between(endpointAnalytics.date, start, end)
				)
			)
			.orderBy(asc(endpointAnalytics.date));

		const recentRequests = await db
			.select({
				id: requestLogs.id,
				timestamp: requestLogs.timestamp,
				userId: requestLogs.userId,
				statusCode: requestLogs.statusCode,
				responseTime: requestLogs.responseTime,
				query: requestLogs.query,
				body: requestLogs.body,
			})
			.from(requestLogs)
			.where(
				and(
					eq(requestLogs.endpoint, endpoint),
					eq(requestLogs.method, method),
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`
				)
			)
			.orderBy(desc(requestLogs.timestamp))
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

	async getUserAnalytics(
		startDate?: string,
		endDate?: string,
		limit = 50,
		offset = 0
	) {
		const currentDate = new Date().toISOString().split('T')[0];
		const start = startDate || currentDate;
		const end = endDate || currentDate;

		const analytics = await db
			.select({
				userId: userAnalytics.userId,
				username: users.username,
				totalRequests: sql`SUM(${userAnalytics.totalRequests})`,
				avgResponseTime: sql`ROUND(AVG(${userAnalytics.avgResponseTime}))`,
				lastActivity: sql`MAX(${userAnalytics.lastActivity})`,
			})
			.from(userAnalytics)
			.leftJoin(users, eq(userAnalytics.userId, users.id))
			.where(between(userAnalytics.date, start, end))
			.groupBy(userAnalytics.userId)
			.orderBy(desc(sql`SUM(${userAnalytics.totalRequests})`))
			.limit(limit)
			.offset(offset);

		const countResult = await db
			.select({
				count: sql`COUNT(DISTINCT ${userAnalytics.userId})`,
			})
			.from(userAnalytics)
			.where(between(userAnalytics.date, start, end));

		return {
			startDate: start,
			endDate: end,
			users: analytics,
			totalUsers: Number(countResult[0]?.count || 0),
			limit,
			offset,
		};
	}

	async getUserDetail(userId: number, startDate?: string, endDate?: string) {
		const currentDate = new Date().toISOString().split('T')[0];
		const start = startDate || currentDate;
		const end = endDate || currentDate;

		const userInfo = await db
			.select({
				id: users.id,
				username: users.username,
				email: users.email,
				createdAt: users.createdAt,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!userInfo.length) {
			throw new BadRequestError('User not found');
		}

		const aggregatedData = await db
			.select({
				totalRequests: sql`SUM(${userAnalytics.totalRequests})`,
				avgResponseTime: sql`ROUND(AVG(${userAnalytics.avgResponseTime}))`,
				lastActivity: sql`MAX(${userAnalytics.lastActivity})`,
			})
			.from(userAnalytics)
			.where(
				and(
					eq(userAnalytics.userId, userId),
					between(userAnalytics.date, start, end)
				)
			);

		const dailyBreakdown = await db
			.select({
				date: userAnalytics.date,
				totalRequests: userAnalytics.totalRequests,
				avgResponseTime: userAnalytics.avgResponseTime,
			})
			.from(userAnalytics)
			.where(
				and(
					eq(userAnalytics.userId, userId),
					between(userAnalytics.date, start, end)
				)
			)
			.orderBy(asc(userAnalytics.date));

		const endpointUsage = await db
			.select({
				endpoint: requestLogs.endpoint,
				method: requestLogs.method,
				count: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
			})
			.from(requestLogs)
			.where(
				and(
					eq(requestLogs.userId, userId),
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`
				)
			)
			.groupBy(requestLogs.endpoint, requestLogs.method)
			.orderBy(desc(sql`COUNT(*)`));

		const recentActivity = await db
			.select({
				id: requestLogs.id,
				timestamp: requestLogs.timestamp,
				method: requestLogs.method,
				path: requestLogs.path,
				endpoint: requestLogs.endpoint,
				statusCode: requestLogs.statusCode,
				responseTime: requestLogs.responseTime,
			})
			.from(requestLogs)
			.where(
				and(
					eq(requestLogs.userId, userId),
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`
				)
			)
			.orderBy(desc(requestLogs.timestamp))
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

	async getSystemAnalytics(startDate?: string, endDate?: string) {
		const currentDate = new Date().toISOString().split('T')[0];
		const start = startDate || currentDate;
		const end = endDate || currentDate;

		const requestStats = await db
			.select({
				totalRequests: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
				successCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
				errorCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
			})
			.from(requestLogs)
			.where(
				and(
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`
				)
			);

		const dailyStats = await db
			.select({
				date: sql`date(${requestLogs.timestamp})`,
				totalRequests: sql`COUNT(*)`,
				successCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
				errorCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
			})
			.from(requestLogs)
			.where(
				and(
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`
				)
			)
			.groupBy(sql`date(${requestLogs.timestamp})`)
			.orderBy(asc(sql`date(${requestLogs.timestamp})`));

		const topEndpoints = await db
			.select({
				endpoint: requestLogs.endpoint,
				method: requestLogs.method,
				count: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
			})
			.from(requestLogs)
			.where(
				and(
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`
				)
			)
			.groupBy(requestLogs.endpoint, requestLogs.method)
			.orderBy(desc(sql`COUNT(*)`))
			.limit(10);

		const activeUserCount = await db
			.select({
				count: sql`COUNT(DISTINCT ${requestLogs.userId})`,
			})
			.from(requestLogs)
			.where(
				and(
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`,
					sql`${requestLogs.userId} IS NOT NULL`
				)
			);

		const errorBreakdown = await db
			.select({
				statusCode: requestLogs.statusCode,
				count: sql`COUNT(*)`,
			})
			.from(requestLogs)
			.where(
				and(
					sql`datetime(${requestLogs.timestamp}) >= datetime('${start}')`,
					sql`datetime(${requestLogs.timestamp}) <= datetime('${end}')`,
					sql`${requestLogs.statusCode} >= 400`
				)
			)
			.groupBy(requestLogs.statusCode)
			.orderBy(desc(sql`COUNT(*)`));

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
		const recentRequests = await db
			.select({
				id: requestLogs.id,
				timestamp: requestLogs.timestamp,
				userId: requestLogs.userId,
				method: requestLogs.method,
				path: requestLogs.path,
				endpoint: requestLogs.endpoint,
				statusCode: requestLogs.statusCode,
				responseTime: requestLogs.responseTime,
			})
			.from(requestLogs)
			.where(
				sql`datetime(${requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`
			)
			.orderBy(desc(requestLogs.timestamp))
			.limit(100);

		// Get requests per minute for the past hour
		const requestsPerMinute = await db
			.select({
				minute: sql`strftime('%Y-%m-%d %H:%M', ${requestLogs.timestamp})`,
				count: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
				successCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
				errorCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
			})
			.from(requestLogs)
			.where(
				sql`datetime(${requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`
			)
			.groupBy(sql`strftime('%Y-%m-%d %H:%M', ${requestLogs.timestamp})`)
			.orderBy(asc(sql`strftime('%Y-%m-%d %H:%M', ${requestLogs.timestamp})`));

		// Get top endpoints in the past hour
		const topEndpoints = await db
			.select({
				endpoint: requestLogs.endpoint,
				method: requestLogs.method,
				count: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
			})
			.from(requestLogs)
			.where(
				sql`datetime(${requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`
			)
			.groupBy(requestLogs.endpoint, requestLogs.method)
			.orderBy(desc(sql`COUNT(*)`))
			.limit(5);

		// Get active users in the past hour
		const activeUsers = await db
			.select({
				userId: requestLogs.userId,
				username: users.username,
				requestCount: sql`COUNT(*)`,
			})
			.from(requestLogs)
			.leftJoin(users, eq(requestLogs.userId, users.id))
			.where(
				and(
					sql`datetime(${requestLogs.timestamp}) >= datetime('${oneHourAgoStr}')`,
					sql`${requestLogs.userId} IS NOT NULL`
				)
			)
			.groupBy(requestLogs.userId)
			.orderBy(desc(sql`COUNT(*)`))
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
				avgResponseTime: Math.round(
					recentRequests.reduce((sum, r) => sum + r.responseTime, 0) /
						(recentRequests.length || 1)
				),
				activeUserCount: activeUsers.length,
			},
		};
	}
}
