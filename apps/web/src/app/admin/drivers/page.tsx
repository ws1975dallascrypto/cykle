'use client';

import { useState } from 'react';
import { useAdminDrivers, useToggleDriverActive } from '@/hooks/useAdminDrivers';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { ToggleLeft, ToggleRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminDriversPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminDrivers(page);
  const { mutate: toggleActive } = useToggleDriverActive();

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Drivers</h1>
        <p className="text-sm text-slate-500">{data?.total ?? '—'} registered drivers</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Driver</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500">Vehicle</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Rating</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Trips</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Online</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Account</th>
                  <th className="text-center px-4 py-3 font-semibold text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data?.drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{driver.user.firstName} {driver.user.lastName}</p>
                      <p className="text-xs text-slate-400">{driver.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{driver.vehicleType}</p>
                      {driver.vehiclePlate && <p className="text-xs text-slate-400 font-mono">{driver.vehiclePlate}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-slate-700">{driver.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{driver._count.orderLegs}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('inline-block h-2 w-2 rounded-full', driver.isOnline ? 'bg-emerald-400' : 'bg-slate-300')} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        driver.user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600')}>
                        {driver.user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleActive(driver.id)}
                        title={driver.user.isActive ? 'Suspend driver' : 'Reactivate driver'}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {driver.user.isActive
                          ? <ToggleRight className="h-6 w-6 text-emerald-500" />
                          : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {data?.drivers.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-slate-400">No drivers found</td></tr>
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
    </div>
  );
}
