'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, CreditCard, Smartphone, Banknote, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { SchedulingEngine } from '@/components/customer/SchedulingEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatPHP, formatWeight } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Step = 'schedule' | 'payment' | 'confirm';

const PAYMENT_METHODS = [
  {
    id: 'gcash' as const,
    label: 'GCash',
    icon: '💚',
    description: 'Pay via GCash e-wallet',
    color: 'border-green-200 bg-green-50',
    activeColor: 'border-green-500 bg-green-50',
  },
  {
    id: 'maya' as const,
    label: 'Maya',
    icon: '💜',
    description: 'Pay via Maya (PayMaya)',
    color: 'border-purple-200 bg-purple-50',
    activeColor: 'border-purple-500 bg-purple-50',
  },
  {
    id: 'card' as const,
    label: 'Credit / Debit Card',
    icon: '💳',
    description: 'Visa, Mastercard, JCB',
    color: 'border-blue-200 bg-blue-50',
    activeColor: 'border-blue-500 bg-blue-50',
  },
  {
    id: 'cod' as const,
    label: 'Cash on Delivery',
    icon: '💵',
    description: 'Pay the driver upon delivery',
    color: 'border-amber-200 bg-amber-50',
    activeColor: 'border-amber-500 bg-amber-50',
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('schedule');
  const {
    items, subtotal, estimatedWeightKg, vendorProfileId,
    pickupSlot, deliverySlot, paymentMethod, setPaymentMethod,
    pickupAddressId, deliveryAddressId, garmentPreferences, specialInstructions,
    clearCart,
  } = useCartStore();

  const { mutate: createOrder, isPending, error } = useCreateOrder();

  const DELIVERY_FEE = 80;
  const total = subtotal() + DELIVERY_FEE;

  const canProceedFromSchedule = pickupSlot && deliverySlot;

  const handlePlaceOrder = () => {
    if (!vendorProfileId || !pickupSlot || !deliverySlot || !pickupAddressId) return;

    createOrder(
      {
        vendorProfileId,
        pickupAddressId,
        deliveryAddressId: deliveryAddressId ?? pickupAddressId,
        items: items.map((i) => ({
          serviceId: i.serviceId,
          serviceItemId: i.serviceItemId,
          quantity: i.quantity,
        })),
        pickupScheduledAt: new Date(`${pickupSlot.date}T${pickupSlot.time}:00+08:00`).toISOString(),
        deliveryScheduledAt: new Date(`${deliverySlot.date}T${deliverySlot.time}:00+08:00`).toISOString(),
        estimatedWeightKg,
        paymentMethod,
        garmentPreferences,
        specialInstructions,
      },
      {
        onSuccess: (data) => {
          clearCart();
          router.push(`/customer/orders/${data.order.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-slate-100 px-4 py-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <h1 className="font-bold text-slate-900">Checkout</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 bg-white border-b border-slate-100 px-4 py-2">
        {(['schedule', 'payment', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors',
              step === s ? 'bg-brand-500 text-white' :
              (['payment', 'confirm'].indexOf(step) > ['payment', 'confirm'].indexOf(s))
                ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
            )}>
              {i + 1}
            </div>
            <span className={cn('ml-1 text-xs font-medium mr-2 capitalize', step === s ? 'text-brand-600' : 'text-slate-400')}>
              {s}
            </span>
            {i < 2 && <div className="w-6 h-px bg-slate-200 mr-2" />}
          </div>
        ))}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Step: Schedule */}
        {step === 'schedule' && (
          <>
            <SchedulingEngine />
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 pb-safe-or-4">
              <Button
                className="w-full"
                size="lg"
                disabled={!canProceedFromSchedule}
                onClick={() => setStep('payment')}
              >
                Continue to Payment
              </Button>
            </div>
          </>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <>
            <div className="space-y-3">
              <h2 className="font-bold text-slate-900">Choose Payment Method</h2>
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all',
                    paymentMethod === method.id ? method.activeColor + ' shadow-sm' : 'border-slate-200 bg-white'
                  )}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{method.label}</p>
                    <p className="text-xs text-slate-500">{method.description}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 pb-safe-or-4 space-y-2">
              <Button className="w-full" size="lg" onClick={() => setStep('confirm')}>
                Review Order
              </Button>
            </div>
          </>
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <>
            {/* Order summary */}
            <Card>
              <CardContent className="space-y-2 py-4">
                <h3 className="font-bold text-slate-900">Order Summary</h3>
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-600">{item.itemName ?? item.serviceName} × {item.quantity}</span>
                    <span className="font-medium">{formatPHP(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Delivery fee</span><span>{formatPHP(DELIVERY_FEE)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Est. weight</span><span>{formatWeight(estimatedWeightKg)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1">
                    <span>Total (est.)</span>
                    <span className="text-brand-600">{formatPHP(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule summary */}
            <Card>
              <CardContent className="space-y-2 py-4">
                <h3 className="font-bold text-slate-900">Schedule</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">📦 Pickup</span>
                  <span className="font-medium">{pickupSlot?.date} at {pickupSlot?.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">🚀 Delivery</span>
                  <span className="font-medium">{deliverySlot?.date} at {deliverySlot?.time}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment method */}
            <Card>
              <CardContent className="py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Payment</span>
                  <span className="font-bold capitalize">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                Failed to place order. Please try again.
              </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 pb-safe-or-4">
              <Button
                className="w-full"
                size="lg"
                loading={isPending}
                onClick={handlePlaceOrder}
              >
                Place Order · {formatPHP(total)}
              </Button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                By placing your order, you agree to our Terms of Service.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
