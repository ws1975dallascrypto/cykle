import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { LegStatus } from '@cykle/shared';

export async function getDriverDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await prisma.driverProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!driver) throw new AppError(404, 'Driver profile not found', 'NOT_FOUND');

    const activeLeg = await prisma.orderLeg.findFirst({
      where: { driverProfileId: driver.id, legStatus: { in: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] } },
      include: {
        order: {
          include: {
            customerProfile: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
            vendorProfile: { select: { shopName: true, latitude: true, longitude: true, street: true } },
          },
        },
      },
    });

    const todayDeliveries = await prisma.orderLeg.count({
      where: {
        driverProfileId: driver.id,
        legStatus: 'COMPLETED',
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    res.json({ driver, activeLeg, todayDeliveries });
  } catch (err) {
    next(err);
  }
}

export async function toggleOnline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const current = await prisma.driverProfile.findUnique({ where: { userId: req.user!.sub }, select: { isOnline: true } });
    if (!current) throw new AppError(404, 'Profile not found', 'NOT_FOUND');
    const driver = await prisma.driverProfile.update({
      where: { userId: req.user!.sub },
      data: { isOnline: !current.isOnline, lastSeenAt: new Date() },
    });
    res.json({ isOnline: driver.isOnline });
  } catch (err) {
    next(err);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { latitude, longitude } = req.body as { latitude: number; longitude: number };
    await prisma.driverProfile.update({
      where: { userId: req.user!.sub },
      data: { currentLat: latitude, currentLng: longitude, lastSeenAt: new Date() },
    });
    // Emit Socket.io event for real-time tracking (wired in app.ts via io instance)
    res.json({ message: 'Location updated' });
  } catch (err) {
    next(err);
  }
}

export async function getActiveLeg(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await prisma.driverProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!driver) throw new AppError(404, 'Profile not found', 'NOT_FOUND');

    const leg = await prisma.orderLeg.findFirst({
      where: { driverProfileId: driver.id, legStatus: { in: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'] } },
      include: { order: { include: { vendorProfile: true } } },
    });

    res.json({ leg });
  } catch (err) {
    next(err);
  }
}

export async function acceptLeg(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const driver = await prisma.driverProfile.findUnique({ where: { userId: req.user!.sub } });
    const leg = await prisma.orderLeg.findFirst({ where: { id: req.params.id, driverProfileId: driver?.id, legStatus: 'ASSIGNED' } });
    if (!leg) throw new AppError(404, 'Leg not found or already accepted', 'NOT_FOUND');

    const updated = await prisma.orderLeg.update({
      where: { id: leg.id },
      data: { legStatus: LegStatus.ACCEPTED, acceptedAt: new Date() },
    });
    res.json({ leg: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateLegStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body as { status: LegStatus };
    const driver = await prisma.driverProfile.findUnique({ where: { userId: req.user!.sub } });
    const leg = await prisma.orderLeg.findFirst({ where: { id: req.params.id, driverProfileId: driver?.id } });
    if (!leg) throw new AppError(404, 'Leg not found', 'NOT_FOUND');

    const data: Record<string, unknown> = { legStatus: status };
    if (status === LegStatus.ARRIVED) data.arrivedAt = new Date();
    if (status === LegStatus.COMPLETED) data.completedAt = new Date();

    const updated = await prisma.orderLeg.update({ where: { id: leg.id }, data });
    res.json({ leg: updated });
  } catch (err) {
    next(err);
  }
}

export async function uploadProof(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Multer middleware handles file upload; storage URL resolved by storage service
    const proofPhotoUrl = (req as any).file?.path ?? req.body.proofPhotoUrl;
    const leg = await prisma.orderLeg.update({
      where: { id: req.params.id },
      data: { proofPhotoUrl, driverNotes: req.body.notes },
    });
    res.json({ leg });
  } catch (err) {
    next(err);
  }
}
