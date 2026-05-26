'use client';

import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';
import type { GarmentPreferences } from '@cykle/shared';

type PrefOption<T extends string> = { value: T; label: string; icon: string };

const DETERGENT_OPTIONS: PrefOption<GarmentPreferences['detergentType']>[] = [
  { value: 'STANDARD',       label: 'Standard',        icon: '🧼' },
  { value: 'SENSITIVE',      label: 'Sensitive Skin',  icon: '🌸' },
  { value: 'FRAGRANCE_FREE', label: 'Fragrance-Free',  icon: '🍃' },
];

const WATER_TEMP_OPTIONS: PrefOption<GarmentPreferences['waterTemperature']>[] = [
  { value: 'COLD', label: 'Cold',  icon: '🧊' },
  { value: 'WARM', label: 'Warm',  icon: '🌡️' },
  { value: 'HOT',  label: 'Hot',   icon: '🔥' },
];

const DRYING_OPTIONS: PrefOption<GarmentPreferences['dryingMethod']>[] = [
  { value: 'TUMBLE_DRY', label: 'Tumble Dry', icon: '🌀' },
  { value: 'AIR_DRY',    label: 'Air Dry',    icon: '💨' },
  { value: 'HANG_DRY',   label: 'Hang Dry',   icon: '🧵' },
];

const FOLDING_OPTIONS: PrefOption<GarmentPreferences['foldingPreference']>[] = [
  { value: 'FOLDED',       label: 'Folded',       icon: '📦' },
  { value: 'HANGERS',      label: 'On Hangers',   icon: '🧥' },
  { value: 'NO_PREFERENCE', label: 'No Pref',     icon: '✌️' },
];

const STARCH_OPTIONS: PrefOption<GarmentPreferences['starchLevel']>[] = [
  { value: 'NONE',   label: 'None',   icon: '·' },
  { value: 'LIGHT',  label: 'Light',  icon: '✦' },
  { value: 'MEDIUM', label: 'Medium', icon: '✦✦' },
  { value: 'HEAVY',  label: 'Heavy',  icon: '✦✦✦' },
];

function PrefRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: PrefOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all',
              value === opt.value
                ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200'
            )}
          >
            <span>{opt.icon}</span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GarmentPreferences() {
  const { garmentPreferences, setGarmentPreferences, specialInstructions, setSpecialInstructions } = useCartStore();

  return (
    <div className="space-y-5">
      <PrefRow
        label="Detergent Type"
        options={DETERGENT_OPTIONS}
        value={garmentPreferences.detergentType}
        onChange={(v) => setGarmentPreferences({ detergentType: v })}
      />
      <PrefRow
        label="Water Temperature"
        options={WATER_TEMP_OPTIONS}
        value={garmentPreferences.waterTemperature}
        onChange={(v) => setGarmentPreferences({ waterTemperature: v })}
      />
      <PrefRow
        label="Drying Method"
        options={DRYING_OPTIONS}
        value={garmentPreferences.dryingMethod}
        onChange={(v) => setGarmentPreferences({ dryingMethod: v })}
      />
      <PrefRow
        label="Folding Preference"
        options={FOLDING_OPTIONS}
        value={garmentPreferences.foldingPreference}
        onChange={(v) => setGarmentPreferences({ foldingPreference: v })}
      />
      <PrefRow
        label="Starch Level"
        options={STARCH_OPTIONS}
        value={garmentPreferences.starchLevel}
        onChange={(v) => setGarmentPreferences({ starchLevel: v })}
      />

      {/* Special instructions */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Special Instructions</p>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="e.g. Handle barong delicately. Separate dark and light colors."
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
        />
      </div>
    </div>
  );
}
