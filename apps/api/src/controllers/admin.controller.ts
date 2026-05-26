import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export async function getSystemAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalOrders,
      activeOrders,
      completedToday,
      totalRevenue,
      totalUsers,
      onlineDrivers,
      openVendors,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'DISPUTED'] } },
      }),
      prisma.order.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { total: true, commissionAmount: true } }),
      prisma.user.count(),
      prisma.driverProfile.count({ where: { isOnline: true } }),
      prisma.vendorProfile.count({ where: { isOpen: true } }),
    ]);

    res.json({
      orders: { total: totalOrders, active: activeOrders, completedToday },
      revenue: {
        total: totalRevenue._sum.total ?? 0,
        commissions: totalRevenue._sum.commissionAmount ?? 0,
      },
      users: { total: totalUsers },
      drivers: { online: onlineDrivers },
      vendors: { open: openVendors },
    });
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const roleFilter = req.query.role as string | undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { ...(roleFilter ? { role: roleFilter as any } : {}) },
        select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, isVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where: roleFilter ? { role: roleFilter as any } : {} }),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function suspendUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.sub,
        action: 'USER_SUSPENDED',
        targetTable: 'users',
        targetId: user.id,
      },
    });

    res.json({ message: 'User suspended', userId: user.id });
  } catch (err) {
    next(err);
  }
}

export async function listAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const statusFilter = req.query.status as string | undefined;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { ...(statusFilter ? { status: statusFilter as any } : {}) },
        include: {
          vendorProfile: { select: { shopName: true } },
          customerProfile: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: statusFilter ? { status: statusFilter as any } : {} }),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function setCommissionOverride(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { rate, note, effectiveTo } = req.body as { rate: number; note?: string; effectiveTo?: string };

    const override = await prisma.commissionOverride.upsert({
      where: { vendorProfileId: req.params.id },
      create: { vendorProfileId: req.params.id, rate, setByUserId: req.user!.sub, note, effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined },
      update: { rate, setByUserId: req.user!.sub, note, effectiveFrom: new Date(), effectiveTo: effectiveTo ? new Date(effectiveTo) : undefined },
    });

    await prisma.vendorProfile.update({ where: { id: req.params.id }, data: { commissionRate: rate } });

    await prisma.auditLog.create({
      data: {
        actorId: req.user!.sub,
        action: 'COMMISSION_UPDATED',
        targetTable: 'vendor_profiles',
        targetId: req.params.id,
        after: { rate },
      },
    });

    res.json({ override });
  } catch (err) {
    next(err);
  }
}

export async function getPlatformConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const configs = await prisma.platformConfig.findMany();
    res.json({ configs });
  } catch (err) {
    next(err);
  }
}

export async function setPlatformConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const config = await prisma.platformConfig.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: req.body.value, description: req.body.description },
      update: { value: req.body.value },
    });
    res.json({ config });
  } catch (err) {
    next(err);
  }
}
