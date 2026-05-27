'use client';

import { useState } from 'react';
import { useAdminVendors, useToggleVendorActive, AdminVendor } from '@/hooks/useAdminVendors';
import { CommissionSheet } from '@/components/admin/CommissionSheet';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { ToggleLeft, ToggleRight, Percent, ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function AdminVendorsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminVendors(page);
  const { mutate: toggleActive } = useToggleVendorActive();
  const [commissionVendor, setCommissionVendor] = useState<AdminVendor | null>(null);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Vendors</h1>
        <p className="text-sm text-slate-500">{data?.total ?? '—'} registered laundry shops</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Shop</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Owner</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Orders</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Commission</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.vendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{vendor.shopName}</p>
                      <p className="text-xs text-slate-400">{vendor.city ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{vendor.user.firstName} {vendor.user.lastName}</p>
                      <p className="text-xs text-slate-400">{vendor.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-700">{vendor.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{vendor._count.orders}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setCommissionVendor(vendor)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-600 px-2 py-1 text-xs font-bold text-slate-600 transition-colors"
                      >
                        {Math.round(vendor.commissionRate * 100)}%
                        <Percent className="h-3 w-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        vendor.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>
                        {vendor.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(vendor.id)}
                        title={vendor.isOpen ? 'Force close' : 'Force open'}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {vendor.isOpen
                          ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                          : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.vendors.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-400">No vendors found</td></tr>
                )}
              </tbody>
            </table>
          </div>

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

      {commissionVendor && (
        <CommissionSheet
          vendorId={commissionVendor.id}
          vendorName={commissionVendor.shopName}
          currentRate={commissionVendor.commissionRate}
          onClose={() => setCommissionVendor(null)}
        />
      )}
    </div>
  );
}
