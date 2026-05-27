'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface AdminVendor {
  id: string;
  shopName: string;
  isOpen: boolean;
  rating: number;
  commissionRate: number;
  city?: string;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string; isActive: boolean; isVerified: boolean };
  _count: { orders: number };
}

export interface AdminVendorPage {
  vendors: AdminVendor[];
  total: number;
  page: number;
  pages: number;
}

export function useAdminVendors(page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'vendors', page],
    queryFn: () => api.get<AdminVendorPage>(`/admin/vendors?page=${page}`, accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useToggleVendorActive() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<{ isOpen: boolean }>(`/admin/vendors/${id}/toggle-active`, {}, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }),
  });
}

export function useSetCommission() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rate, note }: { id: string; rate: number; note?: string }) =>
      api.post(`/admin/vendors/${id}/commission`, { rate, note }, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'vendors'] }),
  });
}
