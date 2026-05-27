'use client';

import { useState } from 'react';
import { Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirmWeight } from '@/hooks/useVendorOrders';
import { formatPHP, formatWeight } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WeightConfirmSheetProps {
  orderId: string;
  estimatedWeightKg: number;
  pricePerKg?: number;
  onClose: () => void;
}

export function WeightConfirmSheet({
  orderId,
  estimatedWeightKg,
  pricePerKg = 85,
  onClose,
}: WeightConfirmSheetProps) {
  const [actual, setActual] = useState(estimatedWeightKg);
  const { mutate: confirmWeight, isPending, isSuccess } = useConfirmWeight();

  const delta = actual - estimatedWeightKg;
  const priceDelta = delta * pricePerKg;
  const hasOverage = Math.abs(delta) > 0.1;

  const handleConfirm = () => {
    confirmWeight(
      { orderId, actualWeightKg: actual },
      { onSuccess: () => setTimeout(onClose, 1200) }
    );
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle className="h-14 w-14 text-emerald-500" />
        <p className="text-lg font-bold text-slate-900">Weight Confirmed!</p>
        <p className="text-sm text-slate-500">Order is now marked as Processing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-black text-slate-900">Confirm Actual Weight</p>
        <p className="text-sm text-slate-500 mt-0.5">
          Customer estimated <strong>{formatWeight(estimatedWeightKg)}</strong>. Enter the actual weight after receiving the laundry.
        </p>
      </div>

      {/* Weight input */}
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex items-center justify-between mb-3">
          <Scale className="h-5 w-5 text-slate-400" />
          <span className="text-3xl font-black text-slate-900">{actual.toFixed(1)} kg</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={30}
          step={0.1}
          value={actual}
          onChange={(e) => setActual(parseFloat(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>0.5 kg</span><span>30 kg</span>
        </div>

        {/* Quick number input */}
        <div className="mt-4 flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium">Or enter manually:</label>
          <input
            type="number"
            min={0.5}
            max={30}
            step={0.1}
            value={actual}
            onChange={(e) => setActual(Math.max(0.5, Math.min(30, parseFloat(e.target.value) || 0)))}
            className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <span className="text-sm text-slate-500">kg</span>
        </div>
      </div>

      {/* Delta summary */}
      {hasOverage && (
        <div className={cn(
          'rounded-xl border p-3 flex items-start gap-2.5',
          delta > 0 ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'
        )}>
          <AlertTriangle className={cn('h-4 w-4 mt-0.5 flex-shrink-0', delta > 0 ? 'text-amber-600' : 'text-blue-600')} />
          <div className="text-sm">
            <p className={cn('font-semibold', delta > 0 ? 'text-amber-800' : 'text-blue-800')}>
              {delta > 0 ? `+${delta.toFixed(1)} kg over estimate` : `${delta.toFixed(1)} kg under estimate`}
            </p>
            <p className={cn('text-xs mt-0.5', delta > 0 ? 'text-amber-700' : 'text-blue-700')}>
              Price adjustment: {delta > 0 ? '+' : ''}{formatPHP(priceDelta)} — customer will be notified.
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button className="flex-1" loading={isPending} onClick={handleConfirm}>
          Confirm {formatWeight(actual)}
        </Button>
      </div>
    </div>
  );
}
