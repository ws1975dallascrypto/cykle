import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refreshToken, logout, verifyPhone } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { UserRole } from '@cykle/shared';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone('any'),
    body('password').isLength({ min: 8 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('role').isIn([UserRole.CUSTOMER, UserRole.VENDOR, UserRole.DRIVER]),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validateRequest,
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.post('/verify-phone', authenticate, verifyPhone);

export default router;
