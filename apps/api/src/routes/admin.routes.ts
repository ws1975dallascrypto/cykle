import { Router } from 'express';
import { param, body, query } from 'express-validator';
import {
  getSystemAnalytics,
  listUsers,
  suspendUser,
  listAllOrders,
  setCommissionOverride,
  getPlatformConfig,
  setPlatformConfig,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { UserRole } from '@cykle/shared';

const router = Router();

router.use(authenticate, authorize(UserRole.SUPER_ADMIN));

router.get('/analytics', getSystemAnalytics);

router.get('/users', [query('role').optional(), query('page').optional().isInt()], validateRequest, listUsers);
router.patch('/users/:id/suspend', [param('id').isUUID()], validateRequest, suspendUser);

router.get('/orders', [query('status').optional(), query('page').optional().isInt()], validateRequest, listAllOrders);

router.post(
  '/vendors/:id/commission',
  [param('id').isUUID(), body('rate').isFloat({ min: 0, max: 1 })],
  validateRequest,
  setCommissionOverride
);

router.get('/config', getPlatformConfig);
router.put('/config/:key', [param('key').notEmpty(), body('value').notEmpty()], validateRequest, setPlatformConfig);

export default router;
