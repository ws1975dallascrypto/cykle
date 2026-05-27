'use client';

import { ArrowUpFromLine, ArrowDownToLine, CheckCircle } from 'lucide-react';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { formatPHP } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface CompletedLeg {
  id: string;
  legType: 'PICKUP' | 'DELIVERY';
  completedAt: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    customer: { name: string };
  };
}

export default function DriverHistoryPage() {
  const { data: dash, isLoading } = useDriverDashboard();

  if (isLoading || !dash) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="text-white" />
      </div>
    );
  }

  const completedLegs: CompletedLeg[] = dash.completedLegs ?? [];

  return (
    <div className="px-4 pt-10 pb-6 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Delivery History</h1>
        <p className="text-sm text-slate-400">{completedLegs.length} completed trips</p>
      </div>

      {completedLegs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <CheckCircle className="h-12 w-12 text-slate-700" />
          <p className="font-semibold text-slate-500">No completed trips yet</p>
          <p className="text-sm text-slate-600">Your delivery history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedLegs.map((leg) => {
            const isPickup = leg.legType === 'PICKUP';
            return (
              <div key={leg.id} className="rounded-2xl bg-slate-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full shrink-0',
                        isPickup ? 'bg-amber-500/20' : 'bg-brand-500/20'
                      )}
                    >
                      {isPickup
                        ? <ArrowUpFromLine className="h-4 w-4 text-amber-400" />
                        : <ArrowDownToLine className="h-4 w-4 text-brand-400" />}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">
                        {isPickup ? 'Pick-up' : 'Delivery'} · #{leg.order.orderNumber}
                      </p>
                      <p className="font-bold text-white text-sm">{leg.order.customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-white text-sm">{formatPHP(leg.order.totalAmount)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(leg.completedAt).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'Asia/Manila',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
