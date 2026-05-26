'use client';

import Link from 'next/link';
import { ChevronRight, Package, Clock } from 'lucide-react';
import { useMyOrders } from '@/hooks/useOrders';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_LABELS } from '@cykle/shared';
import { formatPHP } from '@/lib/utils';

const ACTIVE_STATUSES = [
  'PENDING', 'PICKUP_ASSIGNED', 'DRIVER_EN_ROUTE_PICKUP',
  'DRIVER_ARRIVED_CUSTOMER', 'COLLECTED', 'AT_LAUNDRY',
  'PROCESSING', 'READY_FOR_DELIVERY', 'DELIVERY_ASSIGNED',
  'DRIVER_EN_ROUTE_DELIVERY', 'DRIVER_ARRIVED_DELIVERY',
];

function statusBadgeVariant(status: string) {
  if (ACTIVE_STATUSES.includes(status)) return 'default' as const;
  if (status === 'COMPLETED' || status === 'DELIVERED') return 'success' as const;
  if (status === 'CANCELLED') return 'danger' as const;
  return 'neutral' as const;
}

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useMyOrders();

  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const past = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="min-h-screen px-4 py-4">
      <h1 className="text-xl font-black text-slate-900 mb-4">My Orders</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-5xl">📋</span>
          <p className="font-semibold text-slate-700">No orders yet</p>
          <p className="text-sm text-slate-500">Browse shops and place your first order.</p>
          <Link href="/customer" className="text-brand-600 font-semibold text-sm">Find Shops →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Active</p>
              <div className="space-y-2">
                {active.map((order) => <OrderCard key={order.id} order={order} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Past</p>
              <div className="space-y-2">
                {past.map((order) => <OrderCard key={order.id} order={order} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: ReturnType<typeof useMyOrders>['data'] extends (infer T)[] ? T : never }) {
  return (
    <Link href={`/customer/orders/${order.id}`}>
      <Card className="hover:shadow-card-hover transition-shadow">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Package className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900 text-sm truncate">{order.vendorProfile.shopName}</p>
              <Badge variant={statusBadgeVariant(order.status)} className="flex-shrink-0 text-[10px]">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              #{order.orderNumber} · {formatPHP(order.total)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}
