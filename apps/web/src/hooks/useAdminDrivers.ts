'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface AdminDriver {
  id: string;
  vehicleType: string;
  vehiclePlate?: string;
  isOnline: boolean;
  rating: number;
  createdAt: string;
  user: { id: string; email: string; firstName: string; lastName: string; isActive: boolean; isVerified: boolean };
  _count: { orderLegs: number };
}

export interface AdminDriverPage {
  drivers: AdminDriver[];
  total: number;
  page: number;
  pages: number;
}

export function useAdminDrivers(page = 1) {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'drivers', page],
    queryFn: () => api.get<AdminDriverPage>(`/admin/drivers?page=${page}`, accessToken ?? undefined),
    enabled: !!accessToken,
  });
}

export function useToggleDriverActive() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<{ isActive: boolean }>(`/admin/drivers/${id}/toggle-active`, {}, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'drivers'] }),
  });
}
