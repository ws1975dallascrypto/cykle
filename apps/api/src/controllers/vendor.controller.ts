import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { haversineDistance } from '@cykle/shared';

export async function discoverVendors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseFloat((req.query.radius as string) ?? '5');
    const sortBy = (req.query.sortBy as string) ?? 'distance';

    const vendors = await prisma.vendorProfile.findMany({
      where: { isOpen: true, isVerified: true },
      select: {
        id: true, shopName: true, logo: true, description: true,
        latitude: true, longitude: true, rating: true, totalReviews: true,
        services: { where: { isExpress: true, isActive: true }, select: { id: true, name: true, turnaroundHours: true }, take: 1 },
      },
    });

    const enriched = vendors
      .map((v) => ({
        ...v,
        distance: haversineDistance(lat, lng, Number(v.latitude), Number(v.longitude)),
      }))
      .filter((v) => v.distance <= radius)
      .sort((a, b) => {
        if (sortBy === 'rating') return Number(b.rating) - Number(a.rating);
        return a.distance - b.distance;
      });

    res.json({ vendors: enriched });
  } catch (err) {
    next(err);
  }
}

export async function getVendorPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: req.params.id },
      include: {
        services: { where: { isActive: true }, include: { serviceItems: { where: { isActive: true } } }, orderBy: { displayOrder: 'asc' } },
      },
    });
    if (!vendor) throw new AppError(404, 'Vendor not found', 'NOT_FOUND');
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
}

export async function getVendorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!vendor) throw new AppError(404, 'Vendor profile not found', 'NOT_FOUND');

    const [pending, processing, readyCount, todayRevenue] = await Promise.all([
      prisma.order.count({ where: { vendorProfileId: vendor.id, status: { in: ['PENDING', 'AT_LAUNDRY'] } } }),
      prisma.order.count({ where: { vendorProfileId: vendor.id, status: 'PROCESSING' } }),
      prisma.order.count({ where: { vendorProfileId: vendor.id, status: 'READY_FOR_DELIVERY' } }),
      prisma.order.aggregate({
        where: {
          vendorProfileId: vendor.id,
          status: 'COMPLETED',
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        } as Parameters<typeof prisma.order.aggregate>[0]['where'],
        _sum: { subtotal: true },
      }),
    ]);

    res.json({
      vendor,
      stats: {
        pending,
        processing,
        readyForDelivery: readyCount,
        todayRevenue: todayRevenue._sum.subtotal ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const allowedFields = ['shopName', 'description', 'operatingHours', 'logo', 'coverImage'];
    const data = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowedFields.includes(k)));
    const vendor = await prisma.vendorProfile.update({ where: { userId: req.user!.sub }, data });
    res.json({ vendor });
  } catch (err) {
    next(err);
  }
}

export async function toggleOpen(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const current = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub }, select: { isOpen: true } });
    if (!current) throw new AppError(404, 'Profile not found', 'NOT_FOUND');
    const vendor = await prisma.vendorProfile.update({
      where: { userId: req.user!.sub },
      data: { isOpen: !current.isOpen },
    });
    res.json({ isOpen: vendor.isOpen });
  } catch (err) {
    next(err);
  }
}

export async function getVendorOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!vendor) throw new AppError(404, 'Vendor profile not found', 'NOT_FOUND');

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const statusFilter = req.query.status as string | undefined;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { vendorProfileId: vendor.id, ...(statusFilter ? { status: statusFilter as any } : {}) },
        include: {
          orderItems: true,
          customerProfile: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { vendorProfileId: vendor.id } }),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}
