'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { formatPHP } from '@/lib/utils';

export function CartBar() {
  const router = useRouter();
  const { items, subtotal, vendorName, itemCount } = useCartStore();

  if (items.length === 0) return null;

  const count = itemCount();
  const total = subtotal();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe-or-4 pb-4">
      <button
        onClick={() => router.push('/customer/cart')}
        className="flex w-full items-center justify-between rounded-2xl bg-brand-500 px-4 py-3.5 text-white shadow-2xl hover:bg-brand-600 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-brand-600">
              {count}
            </span>
          </div>
          <div className="text-left">
            <p className="text-xs text-brand-200">{vendorName}</p>
            <p className="text-sm font-bold">{count} item{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">{formatPHP(total)}</span>
          <ChevronRight className="h-4 w-4 text-brand-200" />
        </div>
      </button>
    </div>
  );
}
