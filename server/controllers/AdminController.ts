import { Request, Response } from 'express';
import { db } from '../db';
import { requestLogs, users } from '../db/schema';
import { eq, and, sql, between, desc } from 'drizzle-orm';
import AsyncHandler from '../middleware/asyncHandler';

export class AdminController {
	getRequestLogs = AsyncHandler(async (req: Request, res: Response) => {
		const { startDate, endDate, userId, limit = 100, offset = 0 } = req.query;

		const conditions = [];

		if (startDate && endDate) {
			conditions.push(
				between(
					sql`DATE(${requestLogs.timestamp})`,
					startDate as string,
					endDate as string
				)
			);
		}

		if (userId) {
			conditions.push(eq(requestLogs.userId, parseInt(userId as string)));
		}

		const logs = await db
			.select({
				id: requestLogs.id,
				userId: requestLogs.userId,
				method: requestLogs.method,
				path: requestLogs.path,
				endpoint: requestLogs.endpoint,
				statusCode: requestLogs.statusCode,
				responseTime: requestLogs.responseTime,
				timestamp: requestLogs.timestamp,
				userAgent: requestLogs.userAgent,
				ipAddress: requestLogs.ipAddress,
				contentLength: requestLogs.contentLength,
			})
			.from(requestLogs)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(requestLogs.timestamp))
			.limit(parseInt(limit as string))
			.offset(parseInt(offset as string));

		// Get aggregate statistics
		const stats = await db
			.select({
				totalLogs: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
				successCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} >= 200 AND ${requestLogs.statusCode} < 400 THEN 1 ELSE 0 END)`,
				errorCount: sql`SUM(CASE WHEN ${requestLogs.statusCode} >= 400 THEN 1 ELSE 0 END)`,
				uniqueUsers: sql`COUNT(DISTINCT ${requestLogs.userId})`,
			})
			.from(requestLogs)
			.where(conditions.length > 0 ? and(...conditions) : undefined);

		const totalLogs = Number(stats[0]?.totalLogs || 0);
		const successCount = Number(stats[0]?.successCount || 0);
		const successRate =
			totalLogs > 0 ? Math.round((successCount / totalLogs) * 100) : 0;

		res.json({
			logs,
			totalLogs,
			avgResponseTime: Number(stats[0]?.avgResponseTime || 0),
			successRate,
			uniqueUsers: Number(stats[0]?.uniqueUsers || 0),
			pagination: {
				limit: parseInt(limit as string),
				offset: parseInt(offset as string),
				hasMore: logs.length === parseInt(limit as string),
			},
		});
	});

	getDashboard = AsyncHandler(async (req: Request, res: Response) => {
		res.sendFile('admin.html', { root: './public' });
	});

	getSystemOverview = AsyncHandler(async (req: Request, res: Response) => {
		const { days = 7 } = req.query;
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));
		const startDate = daysAgo.toISOString().split('T')[0];
		const endDate = new Date().toISOString().split('T')[0];

		const requestStats = await db
			.select({
				totalRequests: sql`COUNT(*)`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
				uniqueUsers: sql`COUNT(DISTINCT ${requestLogs.userId})`,
				successRate: sql`ROUND(AVG(CASE WHEN ${requestLogs.statusCode} >= 200 AND ${requestLogs.statusCode} < 400 THEN 100.0 ELSE 0.0 END), 2)`,
			})
			.from(requestLogs)
			.where(between(sql`DATE(${requestLogs.timestamp})`, startDate, endDate));

		const totalUsers = await db.select({ count: sql`COUNT(*)` }).from(users);

		const topEndpoints = await db
			.select({
				endpoint: requestLogs.endpoint,
				method: requestLogs.method,
				count: sql`COUNT(*) as count`,
				avgResponseTime: sql`ROUND(AVG(${requestLogs.responseTime}))`,
			})
			.from(requestLogs)
			.where(between(sql`DATE(${requestLogs.timestamp})`, startDate, endDate))
			.groupBy(requestLogs.endpoint, requestLogs.method)
			.orderBy(sql`count DESC`)
			.limit(10);

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const recentActivity = await db
			.select({
				hour: sql`strftime('%H', ${requestLogs.timestamp}) as hour`,
				count: sql`COUNT(*) as count`,
			})
			.from(requestLogs)
			.where(sql`${requestLogs.timestamp} >= ${yesterday.toISOString()}`)
			.groupBy(sql`strftime('%H', ${requestLogs.timestamp})`)
			.orderBy(sql`hour`);

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
				days: parseInt(days as string),
			},
		});
	});
}
