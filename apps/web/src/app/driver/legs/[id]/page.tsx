'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Phone, MapPin, Package, Thermometer } from 'lucide-react';
import { useActiveLeg } from '@/hooks/useDriverLegs';
import { MapEmbed } from '@/components/driver/MapEmbed';
import { LegActionButtons } from '@/components/driver/LegActionButtons';
import { Spinner } from '@/components/ui/spinner';
import { formatPHP } from '@/lib/utils';

export default function LegDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: leg, isLoading } = useActiveLeg();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="text-white" />
      </div>
    );
  }

  if (!leg || leg.id !== id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-8 text-center">
        <p className="text-slate-400">Assignment not found or already completed.</p>
        <button onClick={() => router.push('/driver')} className="text-brand-400 font-semibold">
          Go Home
        </button>
      </div>
    );
  }

  const isPickup = leg.legType === 'PICKUP';
  const destAddress = isPickup ? leg.order.pickupAddress : leg.order.deliveryAddress;
  const destLat = destAddress.lat ?? 14.5547;
  const destLng = destAddress.lng ?? 121.0509;

  const carePrefs = leg.order.garmentPreferences as Record<string, string> | null;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 px-4 py-3 flex items-center gap-3 border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5 text-slate-300" />
        </button>
        <div>
          <h1 className="font-black text-white text-sm">
            {isPickup ? 'Pick-up Assignment' : 'Delivery Assignment'}
          </h1>
          <p className="text-xs text-slate-400">Order #{leg.order.orderNumber}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Map */}
        <MapEmbed
          destLat={destLat}
          destLng={destLng}
          label={destAddress.street}
        />

        {/* Destination details */}
        <div className="rounded-2xl bg-slate-800 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-brand-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">{destAddress.street}</p>
              {destAddress.barangay && (
                <p className="text-xs text-slate-400">
                  Brgy. {destAddress.barangay}, {destAddress.city}
                </p>
              )}
              {destAddress.landmark && (
                <p className="text-xs text-slate-500 mt-0.5">Landmark: {destAddress.landmark}</p>
              )}
            </div>
          </div>

          {/* Customer contact */}
          <div className="border-t border-slate-700 pt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Customer</p>
              <p className="font-semibold text-white text-sm">{leg.order.customer.name}</p>
            </div>
            <a
              href={`tel:${leg.order.customer.phone}`}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3 py-2 text-emerald-400 text-sm font-semibold"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl bg-slate-800 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Details</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Package className="h-4 w-4 text-slate-400" />
              Weight
            </div>
            <span className="font-bold text-white">
              {leg.order.actualWeightKg ?? leg.order.estimatedWeightKg} kg
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Order total</span>
            <span className="font-bold text-white">{formatPHP(leg.order.totalAmount)}</span>
          </div>

          {/* Service items */}
          {leg.order.orderItems.length > 0 && (
            <div className="border-t border-slate-700 pt-3 space-y-1">
              {leg.order.orderItems.map((item: { id: string; serviceName: string; quantity: number }) => (
                <div key={item.id} className="flex justify-between text-xs text-slate-400">
                  <span>{item.serviceName}</span>
                  <span>×{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care preferences */}
        {carePrefs && Object.keys(carePrefs).length > 0 && (
          <div className="rounded-2xl bg-slate-800 p-4 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Care Preferences</p>
            </div>
            {Object.entries(carePrefs).map(([key, val]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className="text-white font-semibold">{val as string}</span>
              </div>
            ))}
          </div>
        )}

        {/* Special instructions */}
        {leg.order.specialInstructions && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4">
            <p className="text-xs font-semibold text-amber-400 mb-1">Special Instructions</p>
            <p className="text-sm text-white">{leg.order.specialInstructions}</p>
          </div>
        )}

        {/* Action button */}
        <LegActionButtons
          legId={leg.id}
          legStatus={leg.legStatus}
          legType={leg.legType as 'PICKUP' | 'DELIVERY'}
          orderId={leg.order.id}
        />
      </div>
    </div>
  );
}
