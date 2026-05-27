'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdateOrderStatus } from '@/hooks/useVendorOrders';
import { OrderStatus } from '@cykle/shared';


// The weight confirm panel handles AT_LAUNDRY → PROCESSING transition,
// so we surface only the remaining vendor step here.
const PROCESSING_ACTION = {
  next: OrderStatus.READY_FOR_DELIVERY,
  label: 'Done Processing — Mark Ready',
  note: 'Laundry has been cleaned, dried, and packed.',
  color: 'success',
};

interface StatusUpdatePanelProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusUpdatePanel({ orderId, currentStatus }: StatusUpdatePanelProps) {
  const { mutate: updateStatus, isPending, isSuccess } = useUpdateOrderStatus();
  const [confirmed, setConfirmed] = useState(false);

  // Only show panel for PROCESSING status (the one vendor-actionable transition post weight-confirm)
  if (currentStatus !== OrderStatus.PROCESSING) return null;

  const action = PROCESSING_ACTION;

  if (isSuccess || confirmed) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-emerald-700 text-sm font-semibold">
        <CheckCircle className="h-4 w-4" />
        Status updated successfully
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
      <p className="text-sm font-bold text-slate-900">Update Order Status</p>
      <p className="text-xs text-slate-500">{action.note}</p>
      <Button
        className="w-full"
        variant="success"
        loading={isPending}
        onClick={() => {
          updateStatus(
            { orderId, status: action.next, note: action.note },
            { onSuccess: () => setConfirmed(true) }
          );
        }}
      >
        <CheckCircle className="h-4 w-4" />
        {action.label}
      </Button>
    </div>
  );
}
