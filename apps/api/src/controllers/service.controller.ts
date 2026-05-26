import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

export async function listServices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const services = await prisma.service.findMany({
      where: { vendorProfileId: req.params.id, isActive: true },
      include: { serviceItems: { where: { isActive: true }, orderBy: { displayOrder: 'asc' } } },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!vendor) throw new AppError(404, 'Vendor profile not found', 'NOT_FOUND');

    const service = await prisma.service.create({
      data: { ...req.body, vendorProfileId: vendor.id },
    });
    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub } });
    const existing = await prisma.service.findFirst({ where: { id: req.params.id, vendorProfileId: vendor?.id } });
    if (!existing) throw new AppError(404, 'Service not found', 'NOT_FOUND');

    const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body });
    res.json({ service });
  } catch (err) {
    next(err);
  }
}

export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub } });
    await prisma.service.updateMany({
      where: { id: req.params.id, vendorProfileId: vendor?.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createServiceItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: req.user!.sub } });
    const service = await prisma.service.findFirst({ where: { id: req.params.serviceId, vendorProfileId: vendor?.id } });
    if (!service) throw new AppError(404, 'Service not found', 'NOT_FOUND');

    const item = await prisma.serviceItem.create({ data: { ...req.body, serviceId: service.id } });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

export async function updateServiceItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await prisma.serviceItem.update({ where: { id: req.params.itemId }, data: req.body });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}
