import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import vendorRoutes from './vendor.routes';
import driverRoutes from './driver.routes';
import adminRoutes from './admin.routes';
import orderRoutes from './order.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/vendors', vendorRoutes);
router.use('/drivers', driverRoutes);
router.use('/admin', adminRoutes);
router.use('/orders', orderRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'cykle-api' });
});

export default router;
