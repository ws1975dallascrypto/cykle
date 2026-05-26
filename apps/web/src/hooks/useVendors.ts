'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface VendorSummary {
  id: string;
  shopName: string;
  logo?: string;
  description?: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  services: Array<{ id: string; name: string; turnaroundHours: number }>;
}

export interface VendorDetail extends VendorSummary {
  street: string;
  city: string;
  province: string;
  operatingHours: Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>;
  services: Array<{
    id: string;
    name: string;
    description?: string;
    serviceType: string;
    pricingType: string;
    basePrice: number;
    unit: string;
    turnaroundHours: number;
    isExpress: boolean;
    serviceItems: Array<{ id: string; name: string; pricePerItem: number }>;
  }>;
}

export function useVendors(lat: number | null, lng: number | null, radius = 10) {
  return useQuery({
    queryKey: ['vendors', lat, lng, radius],
    queryFn: () =>
      api.get<{ vendors: VendorSummary[] }>(
        `/vendors/discover?lat=${lat}&lng=${lng}&radius=${radius}`
      ).then((r) => r.vendors),
    enabled: lat !== null && lng !== null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useVendorDetail(id: string | null) {
  return useQuery({
    queryKey: ['vendor', id],
    queryFn: () =>
      api.get<{ vendor: VendorDetail }>(`/vendors/${id}/public`).then((r) => r.vendor),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
