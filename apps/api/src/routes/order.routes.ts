import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createOrder,
  getOrder,
  listCustomerOrders,
  cancelOrder,
  confirmWeight,
  updateOrderStatus,
} from '../controllers/order.controller';
import { authenticate, authorize, requireVerified } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { UserRole } from '@cykle/shared';

const router = Router();

router.use(authenticate);

// Customer routes
router.post(
  '/',
  requireVerified,
  authorize(UserRole.CUSTOMER),
  [
    body('vendorProfileId').isUUID(),
    body('pickupAddressId').isUUID(),
    body('deliveryAddressId').isUUID(),
    body('items').isArray({ min: 1 }),
    body('items.*.serviceId').isUUID(),
    body('items.*.quantity').isNumeric(),
    body('pickupScheduledAt').isISO8601(),
    body('deliveryScheduledAt').isISO8601(),
    body('estimatedWeightKg').isNumeric(),
    body('paymentMethod').notEmpty(),
  ],
  validateRequest,
  createOrder
);

router.get('/me', authorize(UserRole.CUSTOMER), listCustomerOrders);

router.get('/:id', [param('id').isUUID()], validateRequest, getOrder);

router.patch(
  '/:id/cancel',
  authorize(UserRole.CUSTOMER),
  [param('id').isUUID(), body('reason').notEmpty()],
  validateRequest,
  cancelOrder
);

// Vendor routes
router.patch(
  '/:id/weight',
  authorize(UserRole.VENDOR),
  [param('id').isUUID(), body('actualWeightKg').isNumeric()],
  validateRequest,
  confirmWeight
);

// Vendor + Driver + Admin status updates
router.patch(
  '/:id/status',
  authorize(UserRole.VENDOR, UserRole.DRIVER, UserRole.SUPER_ADMIN),
  [param('id').isUUID(), body('status').notEmpty()],
  validateRequest,
  updateOrderStatus
);

export default router;
