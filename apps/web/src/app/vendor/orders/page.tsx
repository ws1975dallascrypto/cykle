'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { VendorOrderCard } from '@/components/vendor/VendorOrderCard';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@cykle/shared';

type Tab = 'all' | 'pending' | 'processing' | 'ready' | 'history';

const TABS: { id: Tab; label: string; icon: string; statuses?: OrderStatus[] }[] = [
  { id: 'all',        label: 'All',        icon: '📋' },
  {
    id: 'pending',
    label: 'Pending',
    icon: '⏳',
    statuses: [OrderStatus.PENDING, OrderStatus.AT_LAUNDRY],
  },
  {
    id: 'processing',
    label: 'Processing',
    icon: '🫧',
    statuses: [OrderStatus.PROCESSING],
  },
  {
    id: 'ready',
    label: 'Ready',
    icon: '✅',
    statuses: [OrderStatus.READY_FOR_DELIVERY],
  },
  {
    id: 'history',
    label: 'History',
    icon: '📂',
    statuses: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.DELIVERED],
  },
];

export default function VendorOrdersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <VendorOrdersContent />
    </Suspense>
  );
}

function VendorOrdersContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) ?? 'all');

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const statusParam = currentTab.statuses?.[0];

  const { data: orders = [], isLoading } = useVendorOrders(
    activeTab === 'all' ? undefined : statusParam
  );

  // Filter client-side for multi-status tabs
  const filtered =
    currentTab.statuses && currentTab.statuses.length > 1
      ? orders.filter((o) => (currentTab.statuses as string[]).includes(o.status))
      : orders;

  return (
    <div className="p-4 lg:p-8 max-w-4xl space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Orders</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar bg-slate-100 p-1 rounded-2xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order list */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center gap-2">
          <span className="text-5xl">📭</span>
          <p className="font-semibold text-slate-700">No orders here</p>
          <p className="text-sm text-slate-400">Orders in this category will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((order) => (
            <VendorOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
