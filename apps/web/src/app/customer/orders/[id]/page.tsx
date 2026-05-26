'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { OrderTracker } from '@/components/customer/OrderTracker';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { formatPHP, formatWeight } from '@/lib/utils';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen"><Spinner className="h-8 w-8" /></div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <span className="text-5xl">😕</span>
        <p className="font-semibold text-slate-700">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-slate-100 px-4 py-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="font-bold text-slate-900">Order #{order.orderNumber}</h1>
          <p className="text-xs text-slate-500">{order.vendorProfile.shopName}</p>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tracker */}
        <OrderTracker order={order} />

        {/* Order items */}
        <Card>
          <CardContent className="py-4 space-y-2">
            <h3 className="font-bold text-slate-900">Items</h3>
            {order.orderItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">
                  {item.itemName ?? item.serviceName} × {item.quantity}
                  <span className="text-xs text-slate-400 ml-1">({item.pricingType})</span>
                </span>
                <span className="font-medium">{formatPHP(item.totalPrice)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="py-4 space-y-2">
            <h3 className="font-bold text-slate-900">Pricing</h3>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span><span>{formatPHP(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Delivery fee</span><span>{formatPHP(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Est. weight</span><span>{formatWeight(order.estimatedWeightKg)}</span>
            </div>
            {order.actualWeightKg && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Actual weight (confirmed)</span><span>{formatWeight(order.actualWeightKg)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 border-t pt-2">
              <span>Total</span>
              <span className="text-brand-600">{formatPHP(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500">
              <span>Payment</span>
              <span className="capitalize font-medium">{order.paymentMethod?.replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardContent className="py-4 space-y-2">
            <h3 className="font-bold text-slate-900">Schedule</h3>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">📦 Pickup</span>
              <span className="font-medium">
                {new Date(order.pickupScheduledAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">🚀 Delivery</span>
              <span className="font-medium">
                {new Date(order.deliveryScheduledAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Garment preferences */}
        {order.garmentPreferences && Object.keys(order.garmentPreferences).length > 0 && (
          <Card>
            <CardContent className="py-4 space-y-2">
              <h3 className="font-bold text-slate-900">Care Preferences</h3>
              {Object.entries(order.garmentPreferences).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <span className="font-medium capitalize">{String(v).replace(/_/g, ' ').toLowerCase()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {order.specialInstructions && (
          <Card>
            <CardContent className="py-4">
              <h3 className="font-bold text-slate-900 mb-1">Special Instructions</h3>
              <p className="text-sm text-slate-600">{order.specialInstructions}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
