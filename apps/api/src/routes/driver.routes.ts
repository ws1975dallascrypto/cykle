import { Router } from 'express';
import { body } from 'express-validator';
import {
  getDriverDashboard,
  toggleOnline,
  updateLocation,
  getActiveLeg,
  acceptLeg,
  updateLegStatus,
  uploadProof,
} from '../controllers/driver.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { UserRole } from '@cykle/shared';

const router = Router();

router.use(authenticate, authorize(UserRole.DRIVER));

router.get('/dashboard', getDriverDashboard);
router.patch('/toggle-online', toggleOnline);

router.patch(
  '/location',
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
  ],
  validateRequest,
  updateLocation
);

router.get('/legs/active', getActiveLeg);
router.patch('/legs/:id/accept', acceptLeg);
router.patch('/legs/:id/status', [body('status').notEmpty()], validateRequest, updateLegStatus);
router.post('/legs/:id/proof', uploadProof);

export default router;
