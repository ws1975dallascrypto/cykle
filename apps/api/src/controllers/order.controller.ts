import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import {
  OrderStatus,
  generateOrderNumber,
  calculateCommission,
  calculateDeliveryFee,
  PLATFORM_COMMISSION_RATE,
} from '@cykle/shared';

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      vendorProfileId,
      pickupAddressId,
      deliveryAddressId,
      items,
      pickupScheduledAt,
      deliveryScheduledAt,
      estimatedWeightKg,
      paymentMethod,
      specialInstructions,
      garmentPreferences,
      isExpress,
    } = req.body;

    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId: req.user!.sub },
    });
    if (!customerProfile) throw new AppError(404, 'Customer profile not found', 'PROFILE_NOT_FOUND');

    const vendor = await prisma.vendorProfile.findUnique({ where: { id: vendorProfileId } });
    if (!vendor || !vendor.isVerified) throw new AppError(404, 'Vendor not found', 'VENDOR_NOT_FOUND');

    // Fetch service prices and compute line totals
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const service = await prisma.service.findFirst({
        where: { id: item.serviceId, vendorProfileId, isActive: true },
        include: { serviceItems: { where: { id: item.serviceItemId } } },
      });
      if (!service) throw new AppError(400, `Service ${item.serviceId} not found`, 'SERVICE_NOT_FOUND');

      const unitPrice =
        item.serviceItemId && service.serviceItems[0]
          ? Number(service.serviceItems[0].pricePerItem)
          : Number(service.basePrice);

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        serviceId: service.id,
        serviceItemId: item.serviceItemId ?? null,
        serviceName: service.name,
        itemName: service.serviceItems[0]?.name ?? null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        pricingType: service.pricingType,
        notes: item.notes ?? null,
      });
    }

    // Naive distance calculation — in production, call Google Maps API
    const deliveryFee = calculateDeliveryFee(3, estimatedWeightKg);
    const commissionRate = Number(vendor.commissionRate) ?? PLATFORM_COMMISSION_RATE;
    const commissionAmount = calculateCommission(subtotal, commissionRate);
    const total = subtotal + deliveryFee;

    const [pickupAddr, deliveryAddr] = await Promise.all([
      prisma.address.findUnique({ where: { id: pickupAddressId } }),
      prisma.address.findUnique({ where: { id: deliveryAddressId } }),
    ]);

    if (!pickupAddr || pickupAddr.customerProfileId !== customerProfile.id) {
      throw new AppError(400, 'Invalid pickup address', 'INVALID_ADDRESS');
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerProfileId: customerProfile.id,
        vendorProfileId,
        pickupAddressId,
        deliveryAddressId,
        pickupAddressSnapshot: pickupAddr,
        deliveryAddressSnapshot: deliveryAddr!,
        pickupScheduledAt: new Date(pickupScheduledAt),
        deliveryScheduledAt: new Date(deliveryScheduledAt),
        estimatedWeightKg,
        subtotal,
        deliveryFee,
        commissionAmount,
        total,
        paymentMethod,
        specialInstructions,
        garmentPreferences: garmentPreferences ?? {},
        isExpress: Boolean(isExpress),
        orderItems: { create: orderItems },
        statusHistory: {
          create: {
            status: OrderStatus.PENDING,
            actorId: req.user!.sub,
            actorRole: req.user!.role,
            note: 'Order placed by customer',
          },
        },
      },
      include: { orderItems: true },
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        orderItems: true,
        orderLegs: { include: { driverProfile: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        vendorProfile: { select: { shopName: true, logo: true, latitude: true, longitude: true } },
      },
    });
    if (!order) throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');

    const userId = req.user!.sub;
    const customerProfile = await prisma.customerProfile.findUnique({ where: { userId } });
    const vendorProfile = await prisma.vendorProfile.findUnique({ where: { userId } });
    const driverProfile = await prisma.driverProfile.findUnique({ where: { userId } });

    const isOwner =
      (customerProfile && order.customerProfileId === customerProfile.id) ||
      (vendorProfile && order.vendorProfileId === vendorProfile.id) ||
      (driverProfile && order.orderLegs.some((l: { driverProfileId: string | null }) => l.driverProfileId === driverProfile.id)) ||
      req.user!.role === 'SUPER_ADMIN';

    if (!isOwner) throw new AppError(403, 'Access denied', 'FORBIDDEN');

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function listCustomerOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerProfile = await prisma.customerProfile.findUnique({ where: { userId: req.user!.sub } });
    if (!customerProfile) throw new AppError(404, 'Profile not found', 'PROFILE_NOT_FOUND');

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerProfileId: customerProfile.id },
        include: { vendorProfile: { select: { shopName: true, logo: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { customerProfileId: customerProfile.id } }),
    ]);

    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');

    const cancellableStatuses: string[] = [OrderStatus.PENDING, OrderStatus.PICKUP_ASSIGNED];
    if (!cancellableStatuses.includes(order.status)) {
      throw new AppError(400, 'Order cannot be cancelled at this stage', 'INVALID_STATUS_TRANSITION');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: req.body.reason,
        statusHistory: {
          create: {
            status: OrderStatus.CANCELLED,
            actorId: req.user!.sub,
            actorRole: req.user!.role,
            note: req.body.note ?? 'Cancelled by customer',
          },
        },
      },
    });

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
}

export async function confirmWeight(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { actualWeightKg } = req.body as { actualWeightKg: number };
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');
    if (order.status !== OrderStatus.AT_LAUNDRY) {
      throw new AppError(400, 'Weight can only be confirmed when order is at laundry', 'INVALID_STATUS');
    }

    const priceDelta = (actualWeightKg - Number(order.estimatedWeightKg)) * 0; // recalc logic placeholder

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { actualWeightKg, status: OrderStatus.PROCESSING },
      }),
      prisma.weightAdjustment.create({
        data: {
          orderId: order.id,
          originalWeightKg: order.estimatedWeightKg,
          actualWeightKg,
          priceDelta,
          confirmedByVendorId: req.user!.sub,
        },
      }),
      prisma.orderStatusEvent.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PROCESSING,
          actorId: req.user!.sub,
          actorRole: req.user!.role,
          note: `Weight confirmed: ${actualWeightKg}kg`,
        },
      }),
    ]);

    res.json({ message: 'Weight confirmed', actualWeightKg });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, note } = req.body as { status: OrderStatus; note?: string };
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND');

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        statusHistory: {
          create: { status, actorId: req.user!.sub, actorRole: req.user!.role, note },
        },
      },
    });

    res.json({ order: updated });
  } catch (err) {
    next(err);
  }
}
