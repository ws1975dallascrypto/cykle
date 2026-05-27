'use client';

import { useState } from 'react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { Spinner } from '@/components/ui/spinner';
import { formatPHP } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'AT_LAUNDRY' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Ready', value: 'READY_FOR_DELIVERY' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-600',
  PICKUP_ASSIGNED: 'bg-blue-100 text-blue-700',
  DRIVER_EN_ROUTE: 'bg-blue-100 text-blue-700',
  AT_LAUNDRY: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  READY_FOR_DELIVERY: 'bg-emerald-100 text-emerald-700',
  DELIVERY_ASSIGNED: 'bg-blue-100 text-blue-700',
  OUT_FOR_DELIVERY: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  DISPUTED: 'bg-rose-100 text-rose-700',
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminOrders(page, status || undefined);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500">{data?.total ?? '—'} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
              status === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Order</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Vendor</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500">Amount</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700">{order.orderNumber}</span>
                        {order.isExpress && <Zap className="h-3 w-3 text-amber-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {order.customerProfile.user.firstName} {order.customerProfile.user.lastName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{order.vendorProfile.shopName}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600')}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPHP(order.total)}</td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'Asia/Manila' })}
                    </td>
                  </tr>
                ))}
                {data?.orders.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">No orders found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">Page {data.page} of {data.pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
