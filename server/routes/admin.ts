import { Router, Request, Response, NextFunction } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

const adminCheck = (req: Request, res: Response, next: NextFunction): void => {
	if (!req.user || req.user.role !== 'admin') {
		res
			.status(403)
			.json({ error: 'Access denied. Admin privileges required.' });
		return;
	}
	next();
};

router.get('/dashboard', adminController.getDashboard);

router.use(authMiddleware, adminCheck);

router.get('/request-logs', adminController.getRequestLogs);
router.get('/overview', adminController.getSystemOverview);

export default router;
