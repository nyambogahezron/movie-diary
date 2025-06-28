import { Router } from 'express';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { adminCheck, authMiddleware } from '../middleware/auth';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authMiddleware, adminCheck);

router.get('/endpoints', analyticsController.getEndpointAnalytics);
router.get(
	'/endpoints/:endpoint/:method',
	analyticsController.getEndpointDetail
);
router.get('/users', analyticsController.getUserAnalytics);
router.get('/users/:userId', analyticsController.getUserDetail);
router.get('/system', analyticsController.getSystemAnalytics);
router.get('/real-time', analyticsController.getRealTimeAnalytics);

export default router;
