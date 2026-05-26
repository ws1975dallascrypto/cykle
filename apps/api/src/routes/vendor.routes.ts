import { Router } from 'express';
import { body, param, query } from 'express-validator';
import {
  discoverVendors,
  getVendorPublic,
  getVendorDashboard,
  updateProfile,
  toggleOpen,
  getVendorOrders,
} from '../controllers/vendor.controller';
import {
  listServices,
  createService,
  updateService,
  deleteService,
  createServiceItem,
  updateServiceItem,
} from '../controllers/service.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { UserRole } from '@cykle/shared';

const router = Router();

// Public discovery endpoint
router.get(
  '/discover',
  [
    query('lat').isFloat({ min: -90, max: 90 }),
    query('lng').isFloat({ min: -180, max: 180 }),
    query('radius').optional().isFloat({ min: 1, max: 50 }),
  ],
  validateRequest,
  discoverVendors
);

router.get('/:id/public', [param('id').isUUID()], validateRequest, getVendorPublic);
router.get('/:id/services', [param('id').isUUID()], validateRequest, listServices);

// Vendor-only routes
router.use(authenticate, authorize(UserRole.VENDOR));

router.get('/dashboard', getVendorDashboard);
router.get('/orders', getVendorOrders);
router.patch('/profile', [body('shopName').optional().trim().notEmpty()], validateRequest, updateProfile);
router.patch('/toggle-open', toggleOpen);

// Service catalog management
router.post(
  '/services',
  [
    body('name').trim().notEmpty(),
    body('serviceType').notEmpty(),
    body('pricingType').notEmpty(),
    body('basePrice').isNumeric(),
  ],
  validateRequest,
  createService
);
router.patch('/services/:id', [param('id').isUUID()], validateRequest, updateService);
router.delete('/services/:id', [param('id').isUUID()], validateRequest, deleteService);

router.post('/services/:serviceId/items', [param('serviceId').isUUID()], validateRequest, createServiceItem);
router.patch('/services/:serviceId/items/:itemId', validateRequest, updateServiceItem);

export default router;
