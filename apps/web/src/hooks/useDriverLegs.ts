'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { ActiveLeg } from '@/hooks/useDriverDashboard';

export function useActiveLeg() {
  const { accessToken } = useAuthStore();
  return useQuery({
    queryKey: ['driver', 'leg', 'active'],
    queryFn: () =>
      api
        .get<{ leg: ActiveLeg | null }>('/drivers/legs/active', accessToken ?? undefined)
        .then((r) => r.leg),
    enabled: !!accessToken,
    refetchInterval: 10_000,
  });
}

export function useAcceptLeg() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (legId: string) =>
      api.patch(`/drivers/legs/${legId}/accept`, {}, accessToken ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['driver', 'leg', 'active'] });
    },
  });
}

export function useUpdateLegStatus() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ legId, status }: { legId: string; status: string }) =>
      api.patch(`/drivers/legs/${legId}/status`, { status }, accessToken ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['driver', 'leg', 'active'] });
    },
  });
}

export function useUploadProof() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      legId,
      notes,
      proofPhotoUrl,
    }: {
      legId: string;
      notes?: string;
      proofPhotoUrl?: string;
    }) =>
      api.post(`/drivers/legs/${legId}/proof`, { notes, proofPhotoUrl }, accessToken ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['driver', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['driver', 'leg', 'active'] });
    },
  });
}
