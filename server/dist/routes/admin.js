"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const adminController = new AdminController_1.AdminController();
router.get('/dashboard', adminController.getDashboard);
router.use(auth_1.authMiddleware, auth_1.adminCheck);
router.get('/request-logs', adminController.getRequestLogs);
router.get('/overview', adminController.getSystemOverview);
exports.default = router;
//# sourceMappingURL=admin.js.map