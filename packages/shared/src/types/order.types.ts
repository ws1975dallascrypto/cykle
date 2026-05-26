export enum OrderStatus {
  // Customer places order — awaiting driver assignment for pickup
  PENDING = 'PENDING',
  // A driver has been assigned to collect from customer
  PICKUP_ASSIGNED = 'PICKUP_ASSIGNED',
  // Driver is traveling to the customer's address
  DRIVER_EN_ROUTE_PICKUP = 'DRIVER_EN_ROUTE_PICKUP',
  // Driver has arrived at the customer location
  DRIVER_ARRIVED_CUSTOMER = 'DRIVER_ARRIVED_CUSTOMER',
  // Laundry collected; driver heading to the shop
  COLLECTED = 'COLLECTED',
  // Laundry has arrived at the vendor shop
  AT_LAUNDRY = 'AT_LAUNDRY',
  // Vendor is processing (washing, drying, pressing, etc.)
  PROCESSING = 'PROCESSING',
  // Vendor has finished — ready for delivery driver pickup
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  // A driver has been assigned for the return leg
  DELIVERY_ASSIGNED = 'DELIVERY_ASSIGNED',
  // Driver collected clean laundry from shop; heading to customer
  DRIVER_EN_ROUTE_DELIVERY = 'DRIVER_EN_ROUTE_DELIVERY',
  // Driver arrived at customer for return delivery
  DRIVER_ARRIVED_DELIVERY = 'DRIVER_ARRIVED_DELIVERY',
  // Laundry successfully returned to customer
  DELIVERED = 'DELIVERED',
  // Payment settled, order fully closed
  COMPLETED = 'COMPLETED',
  // Order cancelled (with reason and refund state)
  CANCELLED = 'CANCELLED',
  // Disputed by customer or vendor
  DISPUTED = 'DISPUTED',
}

export enum LegType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum LegStatus {
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  CAPTURED = 'CAPTURED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PricingType {
  PER_KG = 'PER_KG',
  PER_ITEM = 'PER_ITEM',
  FLAT_RATE = 'FLAT_RATE',
}

export enum ServiceType {
  WASH_AND_FOLD = 'WASH_AND_FOLD',
  WASH_AND_IRON = 'WASH_AND_IRON',
  DRY_CLEAN = 'DRY_CLEAN',
  PRESS_ONLY = 'PRESS_ONLY',
  STEAM_CLEAN = 'STEAM_CLEAN',
  ALTERATIONS = 'ALTERATIONS',
  STAIN_REMOVAL = 'STAIN_REMOVAL',
  DUVET_BEDDING = 'DUVET_BEDDING',
  EXPRESS = 'EXPRESS',
}

export enum CancellationReason {
  CUSTOMER_CANCELLED = 'CUSTOMER_CANCELLED',
  VENDOR_DECLINED = 'VENDOR_DECLINED',
  NO_DRIVER_AVAILABLE = 'NO_DRIVER_AVAILABLE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  DUPLICATE_ORDER = 'DUPLICATE_ORDER',
  OTHER = 'OTHER',
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  vendorName: string;
  vendorLogo?: string;
  estimatedWeight: number;
  actualWeight?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  pickupScheduledAt: string;
  deliveryScheduledAt: string;
  createdAt: string;
}

export interface CartItem {
  serviceId: string;
  serviceItemId?: string;
  serviceName: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  pricingType: PricingType;
  estimatedWeight?: number;
}
