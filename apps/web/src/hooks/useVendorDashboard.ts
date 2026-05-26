'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { OrderStatus } from '@cykle/shared';

export interface VendorStats {
  pending: number;
  processing: number;
  readyForDelivery: number;
  todayRevenue: number;
}

export interface VendorDashboardData {
  vendor: {
    id: string;
    shopName: string;
    logo?: string;
    isOpen: boolean;
    rating: number;
    totalReviews: number;
    commissionRate: number;
  };
  stats: VendorStats;
}

export function useVendorDashboard() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['vendor', 'dashboard'],
    queryFn: () =>
      api.get<VendorDashboardData>('/vendors/dashboard', accessToken ?? undefined),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });
}

export function useToggleOpen() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch<{ isOpen: boolean }>('/vendors/toggle-open', {}, accessToken ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
    },
  });
}

export function useUpdateVendorProfile() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch('/vendors/profile', data, accessToken ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['vendor', 'profile'] });
    },
  });
}
