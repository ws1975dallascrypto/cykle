/**
 * Calculates distance between two geo-coordinates using the Haversine formula.
 * Returns distance in kilometres.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Generates a short, human-readable order number (e.g. CYK-20240601-4F2A). */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CYK-${date}-${suffix}`;
}

/** Formats a monetary value for display. */
export function formatCurrency(amount: number, currency = 'AED'): string {
  return new Intl.NumberFormat('en-AE', { style: 'currency', currency }).format(amount);
}

/** Calculates the platform commission on a subtotal. */
export function calculateCommission(subtotal: number, rate: number): number {
  return Math.round(subtotal * rate * 100) / 100;
}

/** Calculates weight-based delivery fee. */
export function calculateDeliveryFee(distanceKm: number, weightKg: number): number {
  const BASE_FEE = 5;
  const DISTANCE_RATE = 0.5; // per km
  const WEIGHT_THRESHOLD_KG = 10;
  const HEAVY_SURCHARGE = 5;

  const distanceFee = distanceKm * DISTANCE_RATE;
  const weightSurcharge = weightKg > WEIGHT_THRESHOLD_KG ? HEAVY_SURCHARGE : 0;
  return Math.round((BASE_FEE + distanceFee + weightSurcharge) * 100) / 100;
}
