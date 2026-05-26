'use client';

import { CheckCircle, Circle, Clock, Truck, WashingMachine, Package, MapPin } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '@cykle/shared';
import type { OrderDetail } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';

const STATUS_STEPS = [
  { statuses: ['PENDING'],                         label: 'Order Placed',       icon: '📋' },
  { statuses: ['PICKUP_ASSIGNED'],                 label: 'Driver Assigned',    icon: '🛵' },
  { statuses: ['DRIVER_EN_ROUTE_PICKUP', 'DRIVER_ARRIVED_CUSTOMER'], label: 'Driver On the Way', icon: '📍' },
  { statuses: ['COLLECTED'],                       label: 'Collected',          icon: '📦' },
  { statuses: ['AT_LAUNDRY', 'PROCESSING'],        label: 'At Laundry',         icon: '🫧' },
  { statuses: ['READY_FOR_DELIVERY', 'DELIVERY_ASSIGNED'], label: 'Ready',     icon: '✅' },
  { statuses: ['DRIVER_EN_ROUTE_DELIVERY', 'DRIVER_ARRIVED_DELIVERY'], label: 'Out for Delivery', icon: '🚀' },
  { statuses: ['DELIVERED', 'COMPLETED'],          label: 'Delivered',          icon: '🎉' },
];

function getStepIndex(currentStatus: string): number {
  for (let i = 0; i < STATUS_STEPS.length; i++) {
    if (STATUS_STEPS[i].statuses.includes(currentStatus)) return i;
  }
  return 0;
}

export function OrderTracker({ order }: { order: OrderDetail }) {
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED' || order.status === 'DISPUTED';

  const activeDriver = order.orderLegs.find(
    (l) => ['EN_ROUTE', 'ASSIGNED', 'ACCEPTED', 'ARRIVED'].includes(l.legStatus) && l.driverProfile
  );

  return (
    <div className="space-y-4">
      {/* Live status banner */}
      <div className={cn(
        'rounded-2xl p-4 text-center',
        isCancelled ? 'bg-red-50' : 'bg-brand-50'
      )}>
        <span className="text-3xl">{isCancelled ? '❌' : STATUS_STEPS[currentStep]?.icon}</span>
        <p className={cn('mt-1 font-bold text-lg', isCancelled ? 'text-red-700' : 'text-slate-900')}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">Order #{order.orderNumber}</p>
      </div>

      {/* Active driver card */}
      {activeDriver?.driverProfile && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-lg font-bold">
              {activeDriver.driverProfile.user.firstName[0]}
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {activeDriver.driverProfile.user.firstName} {activeDriver.driverProfile.user.lastName}
              </p>
              <p className="text-xs text-slate-500">
                {activeDriver.driverProfile.vehicleModel} · {activeDriver.driverProfile.vehiclePlate}
              </p>
            </div>
          </div>
          <a
            href={`tel:${activeDriver.driverProfile.user.phone}`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white text-lg"
          >
            📞
          </a>
        </div>
      )}

      {/* Progress stepper */}
      {!isCancelled && (
        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="text-sm font-bold text-slate-700 mb-4">Order Progress</p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100" />
            <div className="space-y-5">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx < currentStep;
                const active = idx === currentStep;
                return (
                  <div key={step.label} className="relative flex items-start gap-4 pl-1">
                    <div className={cn(
                      'relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm transition-all',
                      done   ? 'bg-brand-500 text-white' :
                      active ? 'bg-white border-2 border-brand-500 text-brand-500' :
                               'bg-white border-2 border-slate-200 text-slate-300'
                    )}>
                      {done ? '✓' : step.icon}
                    </div>
                    <div className={cn('pt-0.5', active ? 'opacity-100' : done ? 'opacity-60' : 'opacity-30')}>
                      <p className={cn('text-sm font-semibold', active ? 'text-slate-900' : 'text-slate-600')}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Status history */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4">
        <p className="text-sm font-bold text-slate-700 mb-3">Activity Log</p>
        <div className="space-y-3">
          {order.statusHistory.map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn('h-2 w-2 mt-1 rounded-full flex-shrink-0', i === 0 ? 'bg-brand-500' : 'bg-slate-200')} />
                {i < order.statusHistory.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-slate-100" />}
              </div>
              <div className="pb-3">
                <p className="text-xs font-semibold text-slate-800">
                  {ORDER_STATUS_LABELS[event.status] ?? event.status}
                </p>
                {event.note && <p className="text-xs text-slate-500">{event.note}</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(event.createdAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
