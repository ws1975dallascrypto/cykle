'use client';

import { useState } from 'react';
import { CheckCircle, Navigation, MapPin, Camera } from 'lucide-react';
import { useUpdateLegStatus } from '@/hooks/useDriverLegs';
import { ProofUploadSheet } from './ProofUploadSheet';
import { cn } from '@/lib/utils';

interface LegActionButtonsProps {
  legId: string;
  legStatus: string;
  legType: 'PICKUP' | 'DELIVERY';
  orderId: string;
}

export function LegActionButtons({ legId, legStatus, legType, orderId }: LegActionButtonsProps) {
  const { mutate: updateStatus, isPending } = useUpdateLegStatus();
  const [showProof, setShowProof] = useState(false);

  const isPickup = legType === 'PICKUP';

  const actions: Record<string, { label: string; next: string; icon: React.ReactNode; color: string } | null> = {
    ASSIGNED: {
      label: 'Accept Assignment',
      next: 'ACCEPTED',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-emerald-500 active:bg-emerald-600',
    },
    ACCEPTED: {
      label: 'Start Route',
      next: 'EN_ROUTE',
      icon: <Navigation className="h-6 w-6" />,
      color: 'bg-blue-500 active:bg-blue-600',
    },
    EN_ROUTE: {
      label: "I've Arrived",
      next: 'ARRIVED',
      icon: <MapPin className="h-6 w-6" />,
      color: 'bg-amber-500 active:bg-amber-600',
    },
    ARRIVED: null,
    COMPLETED: null,
  };

  const action = actions[legStatus];

  if (legStatus === 'ARRIVED') {
    return (
      <>
        <button
          onClick={() => setShowProof(true)}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-brand-500 active:bg-brand-600 py-5 text-lg font-black text-white transition-all active:scale-[0.98]"
        >
          <Camera className="h-6 w-6" />
          {isPickup ? 'Items Collected — Upload Proof' : 'Items Delivered — Upload Proof'}
        </button>

        <ProofUploadSheet
          legId={legId}
          legType={legType}
          open={showProof}
          onClose={() => setShowProof(false)}
        />
      </>
    );
  }

  if (!action || legStatus === 'COMPLETED') return null;

  return (
    <button
      onClick={() => updateStatus({ legId, status: action.next })}
      disabled={isPending}
      className={cn(
        'w-full flex items-center justify-center gap-3 rounded-2xl py-5 text-lg font-black text-white transition-all active:scale-[0.98]',
        action.color,
        isPending && 'opacity-60'
      )}
    >
      {action.icon}
      {isPending ? 'Updating…' : action.label}
    </button>
  );
}
