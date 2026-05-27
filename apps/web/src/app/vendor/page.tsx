'use client';

import { useRouter } from 'next/navigation';
import { Power, RefreshCw } from 'lucide-react';
import { useVendorDashboard, useToggleOpen } from '@/hooks/useVendorDashboard';
import { useVendorOrders } from '@/hooks/useVendorOrders';
import { StatsCard } from '@/components/vendor/StatsCard';
import { VendorOrderCard } from '@/components/vendor/VendorOrderCard';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { formatPHP } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@cykle/shared';

const ACTIVE_STATUSES = [
  OrderStatus.PENDING, OrderStatus.AT_LAUNDRY, OrderStatus.PROCESSING,
  OrderStatus.READY_FOR_DELIVERY,
];

export default function VendorDashboardPage() {
  const router = useRouter();
  const { data, isLoading: dashLoading } = useVendorDashboard();
  const { data: allOrders = [], isLoading: ordersLoading } = useVendorOrders();
  const { mutate: toggleOpen, isPending: toggling } = useToggleOpen();

  const activeOrders = allOrders.filter((o) =>
    (ACTIVE_STATUSES as string[]).includes(o.status)
  );

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const { vendor, stats } = data ?? {
    vendor: { shopName: 'My Shop', isOpen: false, rating: 0, totalReviews: 0 },
    stats: { pending: 0, processing: 0, readyForDelivery: 0, todayRevenue: 0 },
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{vendor.shopName}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            ⭐ {vendor.rating.toFixed(1)} · {vendor.totalReviews} reviews
          </p>
        </div>

        {/* Open / Closed toggle */}
        <button
          onClick={() => toggleOpen()}
          disabled={toggling}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all shadow-sm',
            vendor.isOpen
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          )}
        >
          {toggling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          {vendor.isOpen ? 'Open' : 'Closed'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          label="Pending / At Shop"
          value={stats.pending}
          icon="📋"
          color="amber"
          onClick={() => router.push('/vendor/orders?tab=pending')}
        />
        <StatsCard
          label="Processing"
          value={stats.processing}
          icon="🫧"
          color="blue"
          onClick={() => router.push('/vendor/orders?tab=processing')}
        />
        <StatsCard
          label="Ready for Pickup"
          value={stats.readyForDelivery}
          icon="✅"
          color="green"
          onClick={() => router.push('/vendor/orders?tab=ready')}
        />
        <StatsCard
          label="Today's Revenue"
          value={formatPHP(stats.todayRevenue)}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Active order stream */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-900">
            Active Orders
            {activeOrders.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[11px] font-black text-white">
                {activeOrders.length}
              </span>
            )}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/vendor/orders')}>
            View all
          </Button>
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center gap-2">
            <span className="text-4xl">🎉</span>
            <p className="font-semibold text-slate-700">No active orders</p>
            <p className="text-sm text-slate-400">
              {vendor.isOpen ? 'Your shop is open — new orders will appear here.' : 'Open your shop to start receiving orders.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeOrders.map((order) => (
              <VendorOrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
