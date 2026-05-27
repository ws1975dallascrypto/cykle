'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  estimatedWeightKg: number;
  isExpress: boolean;
  createdAt: string;
  vendorProfile: { shopName: string };
  customerProfile: { user: { firstName: string; lastName: string } };
}

export interface AdminOrderPage {
  orders: AdminOrder[];
  total: number;
  page: number;
  pages: number;
}

export function useAdminOrders(page = 1, status?: string) {
  const { accessToken } = useAuthStore();
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set('status', status);
  return useQuery({
    queryKey: ['admin', 'orders', page, status],
    queryFn: () => api.get<AdminOrderPage>(`/admin/orders?${params}`, accessToken ?? undefined),
    enabled: !!accessToken,
  });
}
