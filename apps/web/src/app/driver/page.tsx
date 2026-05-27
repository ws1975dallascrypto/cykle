'use client';

import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';
import { useActiveLeg } from '@/hooks/useDriverLegs';
import { OnlineToggle } from '@/components/driver/OnlineToggle';
import { TodayStats } from '@/components/driver/TodayStats';
import { ActiveLegCard } from '@/components/driver/ActiveLegCard';
import { Spinner } from '@/components/ui/spinner';

export default function DriverHomePage() {
  const router = useRouter();
  const { data: dash, isLoading } = useDriverDashboard();
  const { data: activeLeg } = useActiveLeg();

  if (isLoading || !dash) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="text-white" />
      </div>
    );
  }

  const { driver } = dash;

  return (
    <div className="px-5 pt-12 pb-6 space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Welcome back,</p>
          <h1 className="text-xl font-black text-white">{driver.name.split(' ')[0]}</h1>
        </div>
        <button className="relative p-2 rounded-full bg-slate-800">
          <Bell className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      {/* Online toggle */}
      <div className="flex flex-col items-center gap-4 py-4">
        <OnlineToggle isOnline={driver.isOnline} />
        {!driver.isOnline && (
          <p className="text-xs text-slate-500 text-center max-w-[200px]">
            Go online to start receiving delivery assignments
          </p>
        )}
      </div>

      {/* Today stats */}
      <TodayStats
        deliveries={driver.todayDeliveries}
        rating={driver.rating}
        totalDeliveries={driver.totalDeliveries}
      />

      {/* Active leg */}
      {activeLeg ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Current Assignment
          </p>
          <ActiveLegCard
            leg={activeLeg}
            onViewDetails={() => router.push(`/driver/legs/${activeLeg.id}`)}
          />
        </div>
      ) : driver.isOnline ? (
        <div className="rounded-2xl bg-slate-800 p-6 text-center">
          <div className="text-3xl mb-2">🛵</div>
          <p className="font-bold text-white">Looking for orders…</p>
          <p className="text-xs text-slate-400 mt-1">
            New assignments will appear here automatically
          </p>
        </div>
      ) : null}
    </div>
  );
}
