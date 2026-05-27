'use client';

import { useState, useEffect } from 'react';
import { useAdminSettings, useSetPlatformConfig, PlatformConfig } from '@/hooks/useAdminSettings';
import { Spinner } from '@/components/ui/spinner';
import { Save, Info } from 'lucide-react';

const CONFIG_META: Record<string, { label: string; description: string; suffix?: string }> = {
  PLATFORM_COMMISSION_RATE: { label: 'Default Commission Rate', description: 'Applied to all vendors without a custom override. Enter as a decimal (e.g. 0.15 = 15%).', suffix: '(0–1)' },
  BASE_DELIVERY_FEE:        { label: 'Base Delivery Fee (₱)', description: 'Flat fee charged to customer before distance-based calculation.', suffix: '₱' },
  DELIVERY_FEE_PER_KM:      { label: 'Delivery Fee per km (₱)', description: 'Additional charge per kilometre of pickup/delivery distance.', suffix: '₱/km' },
  EXPRESS_MULTIPLIER:       { label: 'Express Surcharge Multiplier', description: 'Price multiplier applied to express orders (e.g. 1.5 = 50% premium).', suffix: '×' },
  MAX_ORDER_WEIGHT_KG:      { label: 'Max Order Weight (kg)', description: 'Maximum weight per order. Heavier orders must be split.', suffix: 'kg' },
};

function ConfigRow({ config, onSave }: { config: PlatformConfig; onSave: (key: string, value: string) => void }) {
  const [value, setValue] = useState(config.value);
  const [dirty, setDirty] = useState(false);
  const meta = CONFIG_META[config.key];

  useEffect(() => { setValue(config.value); setDirty(false); }, [config.value]);

  return (
    <div className="flex items-start gap-4 py-5 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-900 text-sm">{meta?.label ?? config.key}</p>
          <span className="font-mono text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">{config.key}</span>
        </div>
        {meta?.description && (
          <div className="flex items-start gap-1.5 mt-0.5">
            <Info className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-400">{meta.description}</p>
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-1">
          Last updated: {new Date(config.updatedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-brand-400">
          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setDirty(true); }}
            className="w-28 text-right font-mono text-sm font-bold text-slate-900 outline-none"
          />
          {meta?.suffix && <span className="ml-1.5 text-xs text-slate-400">{meta.suffix}</span>}
        </div>
        <button
          onClick={() => { onSave(config.key, value); setDirty(false); }}
          disabled={!dirty}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-bold text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-3.5 w-3.5" /> Save
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: configs, isLoading } = useAdminSettings();
  const { mutate: setConfig } = useSetPlatformConfig();

  if (isLoading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;

  const sortedConfigs = [...(configs ?? [])].sort((a, b) => {
    const order = Object.keys(CONFIG_META);
    return (order.indexOf(a.key) ?? 99) - (order.indexOf(b.key) ?? 99);
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Changes take effect immediately for new orders</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-6">
        {sortedConfigs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-slate-400 text-sm">No configuration found.</p>
            <p className="text-slate-400 text-xs mt-1">Run the database seed to populate default values.</p>
          </div>
        ) : (
          sortedConfigs.map((config) => (
            <ConfigRow
              key={config.key}
              config={config}
              onSave={(key, value) => setConfig({ key, value })}
            />
          ))
        )}
      </div>
    </div>
  );
}
