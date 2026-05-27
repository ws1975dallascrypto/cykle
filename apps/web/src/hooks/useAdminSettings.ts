'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface PlatformConfig {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export function useAdminSettings() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['admin', 'config'],
    queryFn: () =>
      api.get<{ configs: PlatformConfig[] }>('/admin/config', accessToken ?? undefined).then((r) => r.configs),
    enabled: !!accessToken,
  });
}

export function useSetPlatformConfig() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: string; description?: string }) =>
      api.put(`/admin/config/${key}`, { value, description }, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'config'] }),
  });
}
