'use client';

import { useState } from 'react';
import { X, Percent } from 'lucide-react';
import { useSetCommission } from '@/hooks/useAdminVendors';

interface CommissionSheetProps {
  vendorId: string;
  vendorName: string;
  currentRate: number;
  onClose: () => void;
}

export function CommissionSheet({ vendorId, vendorName, currentRate, onClose }: CommissionSheetProps) {
  const [rate, setRate] = useState(Math.round(currentRate * 100));
  const [note, setNote] = useState('');
  const { mutate, isPending, isSuccess } = useSetCommission();

  const handleSubmit = () => {
    mutate({ id: vendorId, rate: rate / 100, note }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-slate-900">Set Commission Rate</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>

        <p className="text-sm text-slate-500 mb-4">{vendorName}</p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Commission Rate (%)</label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <input
              type="number"
              min={0}
              max={50}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1 text-lg font-black outline-none text-slate-900"
            />
            <Percent className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Current: {Math.round(currentRate * 100)}% → New: {rate}%
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for change..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || isSuccess}
            className="flex-1 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {isPending ? 'Saving…' : 'Save Rate'}
          </button>
        </div>
      </div>
    </div>
  );
}
