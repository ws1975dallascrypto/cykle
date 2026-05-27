'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@cykle/shared';

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  vendorProfile: { shopName: string; logo?: string; phone?: string; latitude: number; longitude: number };
  orderItems: Array<{ serviceName: string; itemName?: string; quantity: number; unitPrice: number; totalPrice: number; pricingType: string }>;
  orderLegs: Array<{
    legType: string;
    legStatus: string;
    driverProfile?: { user: { firstName: string; lastName: string; phone: string }; vehiclePlate: string; vehicleModel?: string };
    estimatedArrival?: string;
  }>;
  statusHistory: Array<{ status: string; note?: string; createdAt: string }>;
  estimatedWeightKg: number;
  actualWeightKg?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  pickupScheduledAt: string;
  deliveryScheduledAt: string;
  pickupAddressSnapshot: Record<string, unknown>;
  garmentPreferences: Record<string, string>;
  specialInstructions?: string;
  paymentMethod?: string;
  paymentStatus: string;
  isExpress: boolean;
  createdAt: string;
}

export function useMyOrders() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['orders', 'me'],
    queryFn: () =>
      api.get<{ orders: OrderDetail[]; total: number }>('/orders/me', accessToken ?? undefined).then(
        (r) => r.orders
      ),
    enabled: !!accessToken,
  });
}

export function useOrder(id: string | null) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['order', id],
    queryFn: () =>
      api.get<{ order: OrderDetail }>(`/orders/${id}`, accessToken ?? undefined).then((r) => r.order),
    enabled: !!id && !!accessToken,
    refetchInterval: 30_000, // poll every 30s for live updates
  });
}

export function useCreateOrder() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<{ order: OrderDetail }>('/orders', payload, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders', 'me'] }),
  });
}
