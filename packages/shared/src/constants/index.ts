export const PLATFORM_COMMISSION_RATE = 0.15; // 15% default platform fee

export const MIN_ORDER_WEIGHT_KG = 1;
export const MAX_ORDER_WEIGHT_KG = 50;

export const CURRENCY = 'PHP';
export const CURRENCY_SYMBOL = '₱';
export const LOCALE = 'en-PH';
export const TIMEZONE = 'Asia/Manila';

// Geolocation — max distance in km for marketplace discovery
export const MAX_VENDOR_SEARCH_RADIUS_KM = 20;
export const DEFAULT_SEARCH_RADIUS_KM = 5;

// Order timing constraints (minutes)
export const MIN_PICKUP_LEAD_TIME_MINUTES = 60;
export const MIN_DELIVERY_WINDOW_HOURS = 2;

// JWT
export const JWT_COOKIE_NAME = 'cykle_refresh_token';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Socket.io events
export const SOCKET_EVENTS = {
  // Order lifecycle
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  ORDER_CANCELLED: 'order:cancelled',

  // Driver tracking
  DRIVER_LOCATION_UPDATED: 'driver:location_updated',
  DRIVER_ASSIGNED: 'driver:assigned',
  DRIVER_ARRIVED: 'driver:arrived',

  // Vendor notifications
  NEW_ORDER_RECEIVED: 'vendor:new_order',
  ORDER_WEIGHT_CONFIRMED: 'vendor:weight_confirmed',

  // System
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Order Placed',
  PICKUP_ASSIGNED: 'Driver Assigned for Pickup',
  DRIVER_EN_ROUTE_PICKUP: 'Driver On the Way',
  DRIVER_ARRIVED_CUSTOMER: 'Driver Arrived',
  COLLECTED: 'Laundry Collected',
  AT_LAUNDRY: 'At Laundry Shop',
  PROCESSING: 'Being Processed',
  READY_FOR_DELIVERY: 'Ready for Return',
  DELIVERY_ASSIGNED: 'Driver Assigned for Delivery',
  DRIVER_EN_ROUTE_DELIVERY: 'On the Way Back',
  DRIVER_ARRIVED_DELIVERY: 'Driver Arrived',
  DELIVERED: 'Delivered',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Under Review',
};
