'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export interface ServiceItemData {
  id: string;
  name: string;
  pricePerItem: number;
  displayOrder: number;
  isActive: boolean;
}

export interface ServiceData {
  id: string;
  name: string;
  description?: string;
  serviceType: string;
  pricingType: string;
  basePrice: number;
  unit: string;
  minQuantity?: number;
  turnaroundHours: number;
  isActive: boolean;
  isExpress: boolean;
  displayOrder: number;
  serviceItems: ServiceItemData[];
}

export function useVendorServices(vendorId: string | null) {
  return useQuery({
    queryKey: ['vendor', 'services', vendorId],
    queryFn: () =>
      api.get<{ services: ServiceData[] }>(`/vendors/${vendorId}/services`).then((r) => r.services),
    enabled: !!vendorId,
  });
}

export function useCreateService() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ServiceData, 'id' | 'serviceItems'>) =>
      api.post('/vendors/services', data, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', 'services'] }),
  });
}

export function useUpdateService() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceData> }) =>
      api.patch(`/vendors/services/${id}`, data, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', 'services'] }),
  });
}

export function useDeleteService() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/vendors/services/${id}`, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', 'services'] }),
  });
}

export function useCreateServiceItem() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: Omit<ServiceItemData, 'id'> }) =>
      api.post(`/vendors/services/${serviceId}/items`, data, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', 'services'] }),
  });
}

export function useUpdateServiceItem() {
  const { accessToken } = useAuthStore();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, itemId, data }: { serviceId: string; itemId: string; data: Partial<ServiceItemData> }) =>
      api.patch(`/vendors/services/${serviceId}/items/${itemId}`, data, accessToken ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vendor', 'services'] }),
  });
}
