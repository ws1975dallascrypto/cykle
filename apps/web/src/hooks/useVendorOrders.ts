'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@cykle/shared';

export interface VendorOrderItem {
  serviceName: string;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pricingType: string;
}

export interface VendorOrderCustomer {
  user: { firstName: string; lastName: string; phone: string };
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  customerProfile: VendorOrderCustomer;
  orderItems: VendorOrderItem[];
  estimatedWeightKg: number;
  actualWeightKg?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  pickupScheduledAt: string;
  deliveryScheduledAt: string;
  garmentPreferences: Record<string, string>;
  specialInstructions?: string;
  isExpress: boolean;
  paymentMethod?: string;
  paymentStatus: string;
  createdAt: string;
}

export function useVendorOrders(status?: string) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['vendor', 'orders', status],
    queryFn: () =>
      api
        .get<{ orders: VendorOrder[]; total: number }>(
          `/vendors/orders${status ? `?status=${status}` : ''}`,
          accessToken ?? undefined
        )
        .then((r) => r.orders),
    enabled: !!accessToken,
    refetchInterval: 20_000,
  });
}

export function useVendorOrder(id: string | null) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['vendor', 'order', id],
    queryFn: () =>
      api.get<{ order: VendorOrder }>(`/orders/${id}`, accessToken ?? undefined).then((r) => r.order),
    enabled: !!id && !!accessToken,
    refetchInterval: 15_000,
  });
}

export function useConfirmWeight() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, actualWeightKg }: { orderId: string; actualWeightKg: number }) =>
      api.patch(`/orders/${orderId}/weight`, { actualWeightKg }, accessToken ?? undefined),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['vendor', 'orders'] });
      qc.invalidateQueries({ queryKey: ['vendor', 'order', vars.orderId] });
      qc.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: OrderStatus; note?: string }) =>
      api.patch(`/orders/${orderId}/status`, { status, note }, accessToken ?? undefined),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['vendor', 'orders'] });
      qc.invalidateQueries({ queryKey: ['vendor', 'order', vars.orderId] });
      qc.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
    },
  });
}
