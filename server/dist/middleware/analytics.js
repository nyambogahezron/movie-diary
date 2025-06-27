"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsMiddleware = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const schema_2 = require("../db/schema");
const normalizeEndpoint = (path) => {
    return path.replace(/\/[0-9]+(?=\/|$)/g, '/:id');
};
const sanitizeRequestBody = (body) => {
    if (!body)
        return null;
    const sanitized = { ...body };
    const sensitiveFields = [
        'password',
        'token',
        'authToken',
        'refreshToken',
        'jwt',
        'secret',
    ];
    sensitiveFields.forEach((field) => {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    });
    return sanitized;
};
const analyticsMiddleware = (req, res, next) => {
    if (req.path === '/health' || req.path.startsWith('/api/analytics')) {
        return next();
    }
    const startTime = Date.now();
    const requestMethod = req.method;
    const requestPath = req.path;
    const endpoint = normalizeEndpoint(requestPath);
    const userAgent = req.get('user-agent') || 'unknown';
    const ipAddress = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        'unknown';
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    res.send = function (body) {
        const responseTime = Date.now() - startTime;
        const statusCode = res.statusCode;
        const userId = req.user?.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        (async () => {
            try {
                await db_1.db.insert(schema_1.requestLogs).values({
                    userId: userId,
                    method: requestMethod,
                    path: requestPath,
                    endpoint: endpoint,
                    statusCode: statusCode,
                    responseTime: responseTime,
                    userAgent: userAgent,
                    ipAddress: ipAddress,
                    contentLength: body ? Buffer.from(String(body)).length : 0,
                    query: JSON.stringify(req.query),
                    body: JSON.stringify(sanitizeRequestBody(req.body)),
                });
                if (userId) {
                    const existingUserAnalytics = await db_1.db
                        .select()
                        .from(schema_2.userAnalytics)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.userAnalytics.userId, userId), (0, drizzle_orm_1.eq)(schema_2.userAnalytics.date, today)));
                    if (existingUserAnalytics.length > 0) {
                        const current = existingUserAnalytics[0];
                        await db_1.db
                            .update(schema_2.userAnalytics)
                            .set({
                            totalRequests: current.totalRequests + 1,
                            lastActivity: (0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`,
                            avgResponseTime: Math.round((current.avgResponseTime * current.totalRequests +
                                responseTime) /
                                (current.totalRequests + 1)),
                        })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.userAnalytics.userId, userId), (0, drizzle_orm_1.eq)(schema_2.userAnalytics.date, today)));
                    }
                    else {
                        await db_1.db.insert(schema_2.userAnalytics).values({
                            userId: userId,
                            totalRequests: 1,
                            avgResponseTime: responseTime,
                            date: today,
                        });
                    }
                }
                const existingEndpointAnalytics = await db_1.db
                    .select()
                    .from(schema_2.endpointAnalytics)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.endpointAnalytics.endpoint, endpoint), (0, drizzle_orm_1.eq)(schema_2.endpointAnalytics.method, requestMethod), (0, drizzle_orm_1.eq)(schema_2.endpointAnalytics.date, today)));
                const isSuccess = statusCode >= 200 && statusCode < 400;
                if (existingEndpointAnalytics.length > 0) {
                    const current = existingEndpointAnalytics[0];
                    await db_1.db
                        .update(schema_2.endpointAnalytics)
                        .set({
                        totalRequests: current.totalRequests + 1,
                        avgResponseTime: Math.round((current.avgResponseTime * current.totalRequests +
                            responseTime) /
                            (current.totalRequests + 1)),
                        minResponseTime: Math.min(current.minResponseTime || responseTime, responseTime),
                        maxResponseTime: Math.max(current.maxResponseTime || responseTime, responseTime),
                        successCount: current.successCount + (isSuccess ? 1 : 0),
                        errorCount: current.errorCount + (isSuccess ? 0 : 1),
                    })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_2.endpointAnalytics.endpoint, endpoint), (0, drizzle_orm_1.eq)(schema_2.endpointAnalytics.method, requestMethod), (0, drizzle_orm_1.eq)(schema_2.endpointAnalytics.date, today)));
                }
                else {
                    await db_1.db.insert(schema_2.endpointAnalytics).values({
                        endpoint: endpoint,
                        method: requestMethod,
                        totalRequests: 1,
                        avgResponseTime: responseTime,
                        minResponseTime: responseTime,
                        maxResponseTime: responseTime,
                        successCount: isSuccess ? 1 : 0,
                        errorCount: isSuccess ? 0 : 1,
                        date: today,
                    });
                }
            }
            catch (error) {
                console.error('Error logging analytics:', error);
            }
        })();
        return originalSend.call(this, body);
    };
    res.json = function (body) {
        return originalJson.call(this, body);
    };
    res.end = function (chunk, encodingOrCallback, callback) {
        if (typeof encodingOrCallback === 'function') {
            return originalEnd.call(this, chunk, 'utf8', encodingOrCallback);
        }
        return originalEnd.call(this, chunk, encodingOrCallback || 'utf8', callback);
    };
    next();
};
exports.analyticsMiddleware = analyticsMiddleware;
//# sourceMappingURL=analytics.js.map