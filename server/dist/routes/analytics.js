"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AnalyticsController_1 = require("../controllers/AnalyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const analyticsController = new AnalyticsController_1.AnalyticsController();
const superUserCheck = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res
            .status(403)
            .json({ error: 'Access denied. Super user privileges required.' });
        return;
    }
    next();
};
router.use(auth_1.authMiddleware, superUserCheck);
router.get('/endpoints', analyticsController.getEndpointAnalytics);
router.get('/endpoints/:endpoint/:method', analyticsController.getEndpointDetail);
router.get('/users', analyticsController.getUserAnalytics);
router.get('/users/:userId', analyticsController.getUserDetail);
router.get('/system', analyticsController.getSystemAnalytics);
router.get('/real-time', analyticsController.getRealTimeAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map