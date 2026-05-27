'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { WeightEstimator } from '@/components/customer/WeightEstimator';
import { GarmentPreferences } from '@/components/customer/GarmentPreferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPHP, formatWeight } from '@/lib/utils';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Tab = 'items' | 'weight' | 'prefs';

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, vendorName, estimatedWeightKg, updateQuantity, clearCart } = useCartStore();
  const [activeTab, setActiveTab] = useState<Tab>('items');

  const total = subtotal();
  const DELIVERY_FEE = 80; // ₱80 flat for now — will use API calculation

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <span className="text-6xl">🧺</span>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500">Browse nearby laundry shops and add services to get started.</p>
        <Button onClick={() => router.push('/customer')}>Find Laundry Shops</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-slate-100 px-4 py-3 pt-safe-or-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-900">Your Cart</h1>
          <p className="text-xs text-slate-500">{vendorName}</p>
        </div>
        <button onClick={clearCart} className="text-xs text-red-500 font-medium">Clear</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-white">
        {([
          { id: 'items',  label: 'Items',      icon: '🧺' },
          { id: 'weight', label: 'Weight',     icon: '⚖️' },
          { id: 'prefs',  label: 'Preferences', icon: '⚙️' },
        ] as { id: Tab; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors border-b-2',
              activeTab === tab.id
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {activeTab === 'items' && (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{item.serviceName}</p>
                    {item.itemName && (
                      <p className="text-xs text-slate-500">{item.itemName}</p>
                    )}
                    <p className="text-xs text-brand-600 font-bold mt-0.5">{formatPHP(item.unitPrice)} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-slate-200 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity - 1, item.serviceItemId)}
                        className="text-slate-600 w-5 text-center"
                      >−</button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.serviceId, item.quantity + 1, item.serviceItemId)}
                        className="text-slate-600 w-5 text-center"
                      >+</button>
                    </div>
                    <p className="text-sm font-bold text-slate-900 w-16 text-right">
                      {formatPHP(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'weight' && <WeightEstimator />}
        {activeTab === 'prefs' && <GarmentPreferences />}
      </div>

      {/* Order summary — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 pt-3 pb-safe-or-4 pb-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>{formatPHP(total)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Est. delivery fee</span>
          <span>{formatPHP(DELIVERY_FEE)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Estimated weight</span>
          <span>{formatWeight(estimatedWeightKg)}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-2">
          <span>Total (est.)</span>
          <span className="text-brand-600">{formatPHP(total + DELIVERY_FEE)}</span>
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={() => router.push('/customer/checkout')}
        >
          Schedule & Checkout <ChevronRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-[11px] text-slate-400">
          Final price confirmed after weight check at the laundry shop
        </p>
      </div>
    </div>
  );
}
