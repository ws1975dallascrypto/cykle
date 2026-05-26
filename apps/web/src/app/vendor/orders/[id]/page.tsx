'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Scale, User, MessageSquare, Clock } from 'lucide-react';
import { useVendorOrder } from '@/hooks/useVendorOrders';
import { WeightConfirmSheet } from '@/components/vendor/WeightConfirmSheet';
import { StatusUpdatePanel } from '@/components/vendor/StatusUpdatePanel';
import { OrderStatusBadge } from '@/components/vendor/OrderStatusBadge';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPHP, formatWeight } from '@/lib/utils';
import { ORDER_STATUS_LABELS, OrderStatus } from '@cykle/shared';

const PREF_LABELS: Record<string, Record<string, string>> = {
  detergentType:      { STANDARD: 'Standard', SENSITIVE: 'Sensitive', FRAGRANCE_FREE: 'Fragrance-Free' },
  waterTemperature:   { COLD: 'Cold', WARM: 'Warm', HOT: 'Hot' },
  dryingMethod:       { TUMBLE_DRY: 'Tumble Dry', AIR_DRY: 'Air Dry', HANG_DRY: 'Hang Dry' },
  foldingPreference:  { FOLDED: 'Folded', HANGERS: 'On Hangers', NO_PREFERENCE: 'No Preference' },
  starchLevel:        { NONE: 'None', LIGHT: 'Light', MEDIUM: 'Medium', HEAVY: 'Heavy' },
};

const PREF_ICONS: Record<string, string> = {
  detergentType: '🧼', waterTemperature: '🌡️', dryingMethod: '💨',
  foldingPreference: '📦', starchLevel: '⭐',
};

export default function VendorOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useVendorOrder(id);
  const [showWeightSheet, setShowWeightSheet] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Spinner className="h-8 w-8" /></div>;
  }
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <span className="text-5xl">😕</span>
        <p className="font-semibold text-slate-700">Order not found</p>
      </div>
    );
  }

  const customer = order.customerProfile.user;
  const showWeightConfirm =
    order.status === OrderStatus.AT_LAUNDRY && !order.actualWeightKg;

  return (
    <div className="p-4 lg:p-8 max-w-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-black text-slate-900">Order #{order.orderNumber}</h1>
          <div className="mt-0.5">
            <OrderStatusBadge status={order.status} isExpress={order.isExpress} />
          </div>
        </div>
      </div>

      {/* Weight confirmation — surfaces only when AT_LAUNDRY */}
      {showWeightConfirm && !showWeightSheet && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <p className="font-bold text-amber-900">Confirm Actual Weight</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Customer estimated <strong>{formatWeight(order.estimatedWeightKg)}</strong>. Weigh the laundry and confirm to begin processing.
              </p>
            </div>
          </div>
          <Button className="w-full" onClick={() => setShowWeightSheet(true)}>
            <Scale className="h-4 w-4" />
            Confirm Weight & Start Processing
          </Button>
        </div>
      )}

      {/* Inline weight confirm sheet */}
      {showWeightSheet && (
        <Card>
          <CardContent className="py-4">
            <WeightConfirmSheet
              orderId={order.id}
              estimatedWeightKg={Number(order.estimatedWeightKg)}
              onClose={() => setShowWeightSheet(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Status update panel (PROCESSING → READY) */}
      <StatusUpdatePanel orderId={order.id} currentStatus={order.status} />

      {/* Customer info */}
      <Card>
        <CardContent className="py-4 space-y-3">
          <h3 className="font-bold text-slate-900">Customer</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-black text-sm">
                {customer.firstName[0]}{customer.lastName[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{customer.firstName} {customer.lastName}</p>
                <p className="text-xs text-slate-500">{customer.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${customer.phone}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600 hover:bg-brand-200 transition-colors"
            >
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Order items */}
      <Card>
        <CardContent className="py-4 space-y-2">
          <h3 className="font-bold text-slate-900">Items Ordered</h3>
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
              <div>
                <span className="font-medium text-slate-800">
                  {item.itemName ?? item.serviceName}
                </span>
                <span className="text-slate-400 ml-1.5">×{item.quantity} {item.pricingType === 'PER_KG' ? 'kg' : ''}</span>
              </div>
              <span className="font-bold text-slate-900">{formatPHP(item.totalPrice)}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-slate-500 pt-1">
            <span>Subtotal</span><span>{formatPHP(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Delivery fee</span><span>{formatPHP(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 border-t pt-2">
            <span>Total</span>
            <span className="text-brand-600">{formatPHP(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Weight summary */}
      <Card>
        <CardContent className="py-4 space-y-2">
          <h3 className="font-bold text-slate-900">Weight</h3>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Customer estimate</span>
            <span className="font-medium">{formatWeight(Number(order.estimatedWeightKg))}</span>
          </div>
          {order.actualWeightKg ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Confirmed actual</span>
              <span className="font-bold text-emerald-600">{formatWeight(Number(order.actualWeightKg))}</span>
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-medium">Actual weight not yet confirmed</p>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardContent className="py-4 space-y-2">
          <h3 className="font-bold text-slate-900">Schedule</h3>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Pickup</span>
            <span className="font-medium">
              {new Date(order.pickupScheduledAt).toLocaleString('en-PH', {
                timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Return delivery</span>
            <span className="font-medium">
              {new Date(order.deliveryScheduledAt).toLocaleString('en-PH', {
                timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Payment</span>
            <span className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ') ?? '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Payment status</span>
            <span className={`font-medium ${order.paymentStatus === 'CAPTURED' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {order.paymentStatus}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Garment preferences */}
      {order.garmentPreferences && Object.keys(order.garmentPreferences).length > 0 && (
        <Card>
          <CardContent className="py-4 space-y-2">
            <h3 className="font-bold text-slate-900">Care Preferences</h3>
            {Object.entries(order.garmentPreferences).map(([key, val]) => {
              const label = PREF_LABELS[key]?.[String(val)] ?? String(val);
              const icon = PREF_ICONS[key] ?? '·';
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <span>{icon}</span>
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  </span>
                  <span className="font-semibold text-slate-800">{label}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Special instructions */}
      {order.specialInstructions && (
        <Card>
          <CardContent className="py-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              Special Instructions
            </h3>
            <p className="text-sm text-slate-700 bg-amber-50 rounded-xl p-3 border border-amber-100">
              {order.specialInstructions}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
