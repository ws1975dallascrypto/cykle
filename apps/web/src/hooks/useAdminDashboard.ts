'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface SystemAnalytics {
  orders: { total: number; active: number; completedToday: number };
  revenue: { total: number; commissions: number };
  users: { total: number };
  drivers: { online: number };
  vendors: { open: number };
}

export function useSystemAnalytics() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get<SystemAnalytics>('/admin/analytics', accessToken ?? undefined),
    enabled: !!accessToken,
    refetchInterval: 30_000,
  });
}
