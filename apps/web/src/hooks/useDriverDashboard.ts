'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface DriverAddress {
  street: string;
  barangay?: string;
  city?: string;
  province?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  vehicleType: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  rating: number;
  totalReviews: number;
  totalDeliveries: number;
  todayDeliveries: number;
}

export interface ActiveLegOrderItem {
  id: string;
  serviceName: string;
  quantity: number;
}

export interface ActiveLeg {
  id: string;
  legType: 'PICKUP' | 'DELIVERY';
  legStatus: string;
  acceptedAt?: string;
  estimatedArrival?: string;
  order: {
    id: string;
    orderNumber: string;
    isExpress: boolean;
    estimatedWeightKg: number;
    actualWeightKg?: number;
    totalAmount: number;
    scheduledPickupAt?: string;
    scheduledDeliveryAt?: string;
    garmentPreferences?: Record<string, string>;
    specialInstructions?: string;
    pickupAddress: DriverAddress;
    deliveryAddress: DriverAddress;
    customer: { name: string; phone?: string };
    vendor: { shopName: string; phone?: string; lat?: number; lng?: number };
    orderItems: ActiveLegOrderItem[];
  };
}

export interface CompletedLeg {
  id: string;
  legType: 'PICKUP' | 'DELIVERY';
  completedAt: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    customer: { name: string };
  };
}

export interface DriverDashboardData {
  driver: DriverProfile;
  activeLeg: ActiveLeg | null;
  completedLegs: CompletedLeg[];
}

export function useDriverDashboard() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['driver', 'dashboard'],
    queryFn: () =>
      api.get<DriverDashboardData>('/drivers/dashboard', accessToken ?? undefined),
    enabled: !!accessToken,
    refetchInterval: 15_000,
  });
}

export function useToggleOnline() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch<{ isOnline: boolean }>('/drivers/toggle-online', {}, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['driver', 'dashboard'] }),
  });
}

export function useUpdateLocation() {
  const { accessToken } = useAuthStore();
  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      api.patch('/drivers/location', { latitude, longitude }, accessToken ?? undefined),
  });
}
