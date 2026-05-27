'use client';

import { useRouter } from 'next/navigation';
import { Star, Bike, Phone, ChevronRight, LogOut, Shield } from 'lucide-react';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { useAuthStore } from '@/store/auth.store';
import { Spinner } from '@/components/ui/spinner';

export default function DriverProfilePage() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const { data: dash, isLoading } = useDriverDashboard();

  const handleSignOut = () => {
    clearAuth();
    router.push('/login');
  };

  if (isLoading || !dash) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="text-white" />
      </div>
    );
  }

  const { driver } = dash;
  const initials = driver.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="px-4 pt-10 pb-6 max-w-md mx-auto space-y-6">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
          <span className="text-3xl font-black text-white">{initials}</span>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-black text-white">{driver.name}</h1>
          <p className="text-sm text-slate-400">{driver.email}</p>
        </div>

        {/* Rating pill */}
        <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 px-4 py-1.5">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          <span className="font-black text-amber-400">{driver.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({driver.totalDeliveries} trips)</span>
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Phone</p>
              <p className="font-semibold text-white">{driver.phone ?? '—'}</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-3 flex items-center gap-3">
            <Bike className="h-5 w-5 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Vehicle</p>
              <p className="font-semibold text-white">
                {driver.vehicleType} · {driver.vehiclePlate ?? 'No plate set'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-800 p-4 text-center">
            <p className="text-2xl font-black text-white">{driver.todayDeliveries}</p>
            <p className="text-xs text-slate-400 mt-0.5">Today</p>
          </div>
          <div className="rounded-2xl bg-slate-800 p-4 text-center">
            <p className="text-2xl font-black text-white">{driver.totalDeliveries}</p>
            <p className="text-xs text-slate-400 mt-0.5">All-time</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="rounded-2xl bg-slate-800 overflow-hidden">
        <button className="w-full flex items-center justify-between px-4 py-4 border-b border-slate-700 active:bg-slate-700">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold text-white">Vehicle Details</span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-500" />
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-700"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold text-red-400">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
