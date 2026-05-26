import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProfile,
  updatePreferences,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { UserRole } from '@cykle/shared';

const router = Router();

router.use(authenticate, authorize(UserRole.CUSTOMER));

router.get('/profile', getProfile);
router.patch('/preferences', [body('garmentPreferences').isObject()], validateRequest, updatePreferences);

router.post(
  '/addresses',
  [
    body('label').trim().notEmpty(),
    body('street').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('country').trim().notEmpty(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
  ],
  validateRequest,
  addAddress
);

router.patch('/addresses/:id', [param('id').isUUID()], validateRequest, updateAddress);
router.delete('/addresses/:id', [param('id').isUUID()], validateRequest, deleteAddress);
router.patch('/addresses/:id/default', [param('id').isUUID()], validateRequest, setDefaultAddress);

export default router;
