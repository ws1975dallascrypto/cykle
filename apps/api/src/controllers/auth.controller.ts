import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import { UserRole } from '@cykle/shared';

function signAccessToken(sub: string, role: string, email: string): string {
  return jwt.sign({ sub, role, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);
}

function signRefreshToken(): string {
  return uuidv4();
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, phone, password, firstName, lastName, role } = req.body as {
      email: string;
      phone: string;
      password: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    };

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) {
      throw new AppError(409, 'Email or phone already registered', 'DUPLICATE_USER');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash,
        role,
        firstName,
        lastName,
        // Create role-specific profile
        ...(role === UserRole.CUSTOMER && { customerProfile: { create: {} } }),
        ...(role === UserRole.DRIVER && {
          driverProfile: {
            create: {
              vehicleType: req.body.vehicleType ?? 'MOTORCYCLE',
              vehiclePlate: req.body.vehiclePlate ?? '',
              licenseNumber: req.body.licenseNumber ?? '',
            },
          },
        }),
      },
    });

    const accessToken = signAccessToken(user.id, user.role, user.email);
    const rawRefresh = signRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { token: rawRefresh, userId: user.id, expiresAt } });

    res.status(201).json({
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      accessToken,
      refreshToken: rawRefresh,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');

    const accessToken = signAccessToken(user.id, user.role, user.email);
    const rawRefresh = signRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({ data: { token: rawRefresh, userId: user.id, expiresAt } });

    res.json({
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
      accessToken,
      refreshToken: rawRefresh,
    });
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };
    if (!token) throw new AppError(400, 'Refresh token required', 'MISSING_TOKEN');

    const stored = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.isRevoked || stored.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
    }

    // Rotate the refresh token
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { isRevoked: true } });

    const newRefresh = signRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: newRefresh, userId: stored.userId, expiresAt } });

    const accessToken = signAccessToken(stored.user.id, stored.user.role, stored.user.email);

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken?: string };
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token, userId: req.user!.sub },
        data: { isRevoked: true },
      });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function verifyPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { otp } = req.body as { otp: string };
    // OTP verification logic will be wired to Twilio verify service
    // Placeholder: mark verified on correct OTP
    if (otp === '000000' && env.NODE_ENV === 'development') {
      await prisma.user.update({ where: { id: req.user!.sub }, data: { isVerified: true } });
      res.json({ message: 'Phone verified successfully' });
      return;
    }
    throw new AppError(400, 'Invalid OTP', 'INVALID_OTP');
  } catch (err) {
    next(err);
  }
}
