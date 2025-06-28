import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { adminCheck, authMiddleware } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

router.get('/dashboard', adminController.getDashboard);

router.use(authMiddleware, adminCheck);

router.get('/request-logs', adminController.getRequestLogs);
router.get('/overview', adminController.getSystemOverview);

export default router;
