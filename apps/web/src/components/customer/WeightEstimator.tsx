'use client';

import { useState } from 'react';
import { Scale, Plus, Minus, Info } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { formatWeight } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Common garment weights in kg (Philippine wardrobe context)
const GARMENT_PRESETS = [
  { label: 'Polo Shirt',    icon: '👔', weight: 0.2 },
  { label: 'T-shirt',       icon: '👕', weight: 0.15 },
  { label: 'Jeans',         icon: '👖', weight: 0.6 },
  { label: 'Shorts',        icon: '🩳', weight: 0.25 },
  { label: 'Dress',         icon: '👗', weight: 0.35 },
  { label: 'Underwear',     icon: '🩲', weight: 0.08 },
  { label: 'Socks (pair)',  icon: '🧦', weight: 0.06 },
  { label: 'Towel',         icon: '🏊', weight: 0.5 },
  { label: 'Bed Sheet',     icon: '🛏️', weight: 1.2 },
  { label: 'Barong',        icon: '🇵🇭', weight: 0.3 },
];

export function WeightEstimator() {
  const { estimatedWeightKg, setWeightEstimate } = useCartStore();
  const [counts, setCounts] = useState<Record<string, number>>({});

  const totalFromGarments = Object.entries(counts).reduce((sum, [label, count]) => {
    const preset = GARMENT_PRESETS.find((p) => p.label === label);
    return sum + (preset ? preset.weight * count : 0);
  }, 0);

  const updateCount = (label: string, delta: number) => {
    const next = Math.max(0, (counts[label] ?? 0) + delta);
    const newCounts = { ...counts, [label]: next };
    setCounts(newCounts);
    const total = Object.entries(newCounts).reduce((sum, [l, c]) => {
      const p = GARMENT_PRESETS.find((x) => x.label === l);
      return sum + (p ? p.weight * c : 0);
    }, 0);
    if (total > 0) setWeightEstimate(Math.max(1, Math.round(total * 10) / 10));
  };

  return (
    <div className="space-y-4">
      {/* Slider */}
      <div className="rounded-2xl bg-brand-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-brand-600" />
            <span className="text-sm font-semibold text-slate-700">Estimated Weight</span>
          </div>
          <span className="text-2xl font-black text-brand-600">{formatWeight(estimatedWeightKg)}</span>
        </div>
        <input
          type="range"
          min={1}
          max={30}
          step={0.5}
          value={estimatedWeightKg}
          onChange={(e) => setWeightEstimate(parseFloat(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1 kg</span>
          <span>30 kg</span>
        </div>
      </div>

      {/* Garment counter */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <p className="text-sm font-semibold text-slate-700">Count by Garment</p>
          <Info className="h-3.5 w-3.5 text-slate-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {GARMENT_PRESETS.map((preset) => {
            const count = counts[preset.label] ?? 0;
            return (
              <div
                key={preset.label}
                className={cn(
                  'flex items-center justify-between rounded-xl border p-2.5 transition-colors',
                  count > 0 ? 'border-brand-200 bg-brand-50' : 'border-slate-100 bg-white'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{preset.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-slate-800 leading-tight">{preset.label}</p>
                    <p className="text-[10px] text-slate-400">{preset.weight}kg each</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateCount(preset.label, -1)}
                    disabled={count === 0}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 disabled:opacity-30"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-4 text-center text-xs font-bold">{count}</span>
                  <button
                    onClick={() => updateCount(preset.label, 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {totalFromGarments > 0 && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Calculated from garments: <strong className="text-brand-600">{formatWeight(totalFromGarments)}</strong>
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Final weight is confirmed by the laundry shop. Price adjusts if actual weight differs.
      </p>
    </div>
  );
}
