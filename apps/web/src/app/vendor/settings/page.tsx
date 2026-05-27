'use client';

import { useState, useEffect } from 'react';
import { Save, Store, Clock } from 'lucide-react';
import { useVendorDashboard, useUpdateVendorProfile } from '@/hooks/useVendorDashboard';
import { OperatingHoursEditor } from '@/components/vendor/OperatingHoursEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import type { OperatingHours } from '@cykle/shared';

export default function VendorSettingsPage() {
  const { data, isLoading } = useVendorDashboard();
  const { mutate: updateProfile, isPending, isSuccess } = useUpdateVendorProfile();

  const [form, setForm] = useState({
    shopName: '',
    description: '',
    operatingHours: {} as Partial<OperatingHours>,
  });

  useEffect(() => {
    if (data?.vendor) {
      setForm((f) => ({
        ...f,
        shopName: data.vendor.shopName ?? '',
        description: data.vendor.description ?? '',
        operatingHours: data.vendor.operatingHours ?? {},
      }));
    }
  }, [data]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }

  return (
    <form onSubmit={handleSave} className="p-4 lg:p-8 max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Shop Settings</h1>
        <Button type="submit" loading={isPending}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      {isSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Shop info */}
      <Card>
        <CardContent className="py-4 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Store className="h-4 w-4 text-slate-400" />
            Shop Information
          </h2>
          <Input
            label="Shop Name"
            value={form.shopName}
            onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))}
            placeholder="e.g. Clean Express BGC"
            required
          />
          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Tell customers about your shop…"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating hours */}
      <Card>
        <CardContent className="py-4 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            Operating Hours
          </h2>
          <p className="text-xs text-slate-500">
            Set your pickup and processing hours. These are shown to customers on your shop page.
          </p>
          <OperatingHoursEditor
            value={form.operatingHours}
            onChange={(hours) => setForm((f) => ({ ...f, operatingHours: hours }))}
          />
        </CardContent>
      </Card>

      {/* Commission info (read-only) */}
      <Card>
        <CardContent className="py-4 space-y-2">
          <h2 className="font-bold text-slate-900">Commission</h2>
          <p className="text-sm text-slate-500">
            Platform commission rate is set by Cykle admin and cannot be changed here. Current rate:{' '}
            <strong className="text-slate-900">{((data?.vendor?.commissionRate ?? 0.15) * 100).toFixed(0)}%</strong>
          </p>
          <p className="text-xs text-slate-400">Contact support if you have questions about your commission rate.</p>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" loading={isPending}>
        <Save className="h-4 w-4" /> Save All Settings
      </Button>
    </form>
  );
}
