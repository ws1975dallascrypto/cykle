'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateService, useUpdateService, ServiceData } from '@/hooks/useVendorServices';
import { cn } from '@/lib/utils';

const SERVICE_TYPES = [
  'WASH_AND_FOLD', 'WASH_AND_IRON', 'DRY_CLEAN', 'PRESS_ONLY',
  'STEAM_CLEAN', 'STAIN_REMOVAL', 'DUVET_BEDDING', 'EXPRESS',
];
const PRICING_TYPES = ['PER_KG', 'PER_ITEM', 'FLAT_RATE'];

interface ServiceFormProps {
  existing?: ServiceData;
  onClose: () => void;
}

export function ServiceForm({ existing, onClose }: ServiceFormProps) {
  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    serviceType: existing?.serviceType ?? 'WASH_AND_FOLD',
    pricingType: existing?.pricingType ?? 'PER_KG',
    basePrice: existing?.basePrice ?? 85,
    unit: existing?.unit ?? 'kg',
    minQuantity: existing?.minQuantity ?? 1,
    turnaroundHours: existing?.turnaroundHours ?? 24,
    isExpress: existing?.isExpress ?? false,
    isActive: existing?.isActive ?? true,
  });

  const { mutate: create, isPending: creating } = useCreateService();
  const { mutate: update, isPending: updating } = useUpdateService();
  const isPending = creating || updating;

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      update({ id: existing.id, data: form }, { onSuccess: onClose });
    } else {
      create(form as Omit<ServiceData, 'id' | 'serviceItems'>, { onSuccess: onClose });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Service Name"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        placeholder="e.g. Wash & Fold"
        required
      />
      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={2}
          placeholder="Brief description of the service…"
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Service Type</label>
          <select
            value={form.serviceType}
            onChange={(e) => set('serviceType', e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Pricing Type</label>
          <select
            value={form.pricingType}
            onChange={(e) => {
              const pt = e.target.value;
              set('pricingType', pt);
              set('unit', pt === 'PER_KG' ? 'kg' : pt === 'PER_ITEM' ? 'item' : 'flat');
            }}
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            {PRICING_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={`Base Price (₱ per ${form.unit})`}
          type="number"
          min={1}
          value={form.basePrice}
          onChange={(e) => set('basePrice', parseFloat(e.target.value))}
          required
        />
        <Input
          label="Turnaround (hours)"
          type="number"
          min={1}
          value={form.turnaroundHours}
          onChange={(e) => set('turnaroundHours', parseInt(e.target.value))}
          required
        />
      </div>

      {form.pricingType === 'PER_KG' && (
        <Input
          label="Minimum Quantity (kg)"
          type="number"
          min={0.5}
          step={0.5}
          value={form.minQuantity}
          onChange={(e) => set('minQuantity', parseFloat(e.target.value))}
        />
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isExpress}
            onChange={(e) => set('isExpress', e.target.checked)}
            className="rounded accent-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">Express Service</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="rounded accent-brand-500"
          />
          <span className="text-sm font-medium text-slate-700">Active</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={isPending}>
          {existing ? 'Save Changes' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
}
