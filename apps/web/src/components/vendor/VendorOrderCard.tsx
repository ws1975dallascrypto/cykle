'use client';

import Link from 'next/link';
import { Clock, User, ChevronRight, Scale } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatPHP, formatWeight } from '@/lib/utils';
import type { VendorOrder } from '@/hooks/useVendorOrders';

interface VendorOrderCardProps {
  order: VendorOrder;
}

const URGENCY_STATUSES = ['PENDING', 'AT_LAUNDRY', 'PROCESSING'];

export function VendorOrderCard({ order }: VendorOrderCardProps) {
  const isUrgent = URGENCY_STATUSES.includes(order.status);
  const customerName = `${order.customerProfile.user.firstName} ${order.customerProfile.user.lastName}`;
  const itemSummary = order.orderItems
    .slice(0, 2)
    .map((i) => `${i.itemName ?? i.serviceName}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`)
    .join(', ') + (order.orderItems.length > 2 ? ` +${order.orderItems.length - 2} more` : '');

  return (
    <Link href={`/vendor/orders/${order.id}`}>
      <Card className={`hover:shadow-card-hover transition-all cursor-pointer ${isUrgent ? 'border-l-4 border-l-brand-400' : ''}`}>
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-slate-900 text-sm">#{order.orderNumber}</span>
                <OrderStatusBadge status={order.status} isExpress={order.isExpress} />
              </div>

              {/* Customer */}
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-slate-600">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium">{customerName}</span>
                <span className="text-slate-400">·</span>
                <a href={`tel:${order.customerProfile.user.phone}`} className="text-brand-600 font-medium" onClick={(e) => e.stopPropagation()}>
                  {order.customerProfile.user.phone}
                </a>
              </div>

              {/* Items */}
              <p className="text-xs text-slate-500 mt-1 truncate">{itemSummary}</p>

              {/* Footer row */}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Scale className="h-3 w-3" />
                  {formatWeight(order.estimatedWeightKg)} est.
                  {order.actualWeightKg && <span className="text-emerald-600 font-semibold"> · {formatWeight(order.actualWeightKg)} actual</span>}
                </span>
                <span className="font-bold text-slate-700">{formatPHP(order.total)}</span>
              </div>

              <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
                <Clock className="h-3 w-3" />
                <span>
                  Pickup: {new Date(order.pickupScheduledAt).toLocaleString('en-PH', {
                    timeZone: 'Asia/Manila', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
