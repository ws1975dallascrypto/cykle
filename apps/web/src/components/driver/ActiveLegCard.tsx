'use client';

import { MapPin, Clock, Package, ArrowUpFromLine, ArrowDownToLine } from 'lucide-react';
import { ActiveLeg } from '@/hooks/useDriverDashboard';
import { cn } from '@/lib/utils';

interface ActiveLegCardProps {
  leg: ActiveLeg;
  onViewDetails: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived',
  COMPLETED: 'Completed',
};

export function ActiveLegCard({ leg, onViewDetails }: ActiveLegCardProps) {
  const isPickup = leg.legType === 'PICKUP';
  const destAddress = isPickup ? leg.order.pickupAddress : leg.order.deliveryAddress;
  const scheduleTime = isPickup ? leg.order.scheduledPickupAt : leg.order.scheduledDeliveryAt;

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4 cursor-pointer active:scale-[0.99] transition-transform',
        isPickup
          ? 'border-amber-500/50 bg-amber-500/10'
          : 'border-brand-500/50 bg-brand-500/10'
      )}
      onClick={onViewDetails}
    >
      {/* Leg type pill */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black tracking-wider',
            isPickup ? 'bg-amber-500 text-white' : 'bg-brand-500 text-white'
          )}
        >
          {isPickup
            ? <ArrowUpFromLine className="h-3 w-3" />
            : <ArrowDownToLine className="h-3 w-3" />}
          {isPickup ? 'PICK-UP' : 'DELIVERY'}
        </div>
        <span className="text-xs font-semibold text-slate-400">
          {STATUS_LABELS[leg.legStatus] ?? leg.legStatus}
        </span>
      </div>

      {/* Order number */}
      <p className="text-xs text-slate-500 mb-1">Order #{leg.order.orderNumber}</p>

      {/* Destination */}
      <div className="flex items-start gap-2 mb-2">
        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {isPickup ? leg.order.customer.name : destAddress.street}
          </p>
          <p className="text-xs text-slate-400 truncate">{destAddress.street}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5" />
          {leg.order.estimatedWeightKg} kg
        </div>
        {scheduleTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {new Date(scheduleTime).toLocaleTimeString('en-PH', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Manila',
            })}
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-xs font-semibold text-slate-400">
        Tap to view details →
      </div>
    </div>
  );
}
