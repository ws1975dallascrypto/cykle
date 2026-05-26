import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        avatar: true, isVerified: true, createdAt: true,
        customerProfile: { include: { addresses: { orderBy: { isDefault: 'desc' } } } },
      },
    });
    if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.customerProfile.update({
      where: { userId: req.user!.sub },
      data: { garmentPreferences: req.body.garmentPreferences },
    });
    res.json({ garmentPreferences: profile.garmentPreferences });
  } catch (err) {
    next(err);
  }
}

export async function addAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!profile) throw new AppError(404, 'Profile not found', 'NOT_FOUND');

    const { label, street, building, floor, city, state, country, postalCode, latitude, longitude, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { customerProfileId: profile.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { customerProfileId: profile.id, label, street, building, floor, city, country, postalCode: postalCode ?? '', latitude, longitude, isDefault: Boolean(isDefault) },
    });
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.sub } });
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, customerProfileId: profile?.id } });
    if (!existing) throw new AppError(404, 'Address not found', 'NOT_FOUND');

    const address = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
    res.json({ address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.sub } });
    const existing = await prisma.address.findFirst({ where: { id: req.params.id, customerProfileId: profile?.id } });
    if (!existing) throw new AppError(404, 'Address not found', 'NOT_FOUND');
    await prisma.address.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function setDefaultAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!profile) throw new AppError(404, 'Profile not found', 'NOT_FOUND');
    await prisma.$transaction([
      prisma.address.updateMany({ where: { customerProfileId: profile.id }, data: { isDefault: false } }),
      prisma.address.update({ where: { id: req.params.id }, data: { isDefault: true } }),
    ]);
    res.json({ message: 'Default address updated' });
  } catch (err) {
    next(err);
  }
}
