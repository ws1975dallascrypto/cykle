'use client';

import { DriverNav } from '@/components/driver/DriverNav';
import { useGPSHeartbeat } from '@/hooks/useGPSHeartbeat';
import { useDriverDashboard } from '@/hooks/useDriverDashboard';

function GPSWatcher() {
  const { data } = useDriverDashboard();
  useGPSHeartbeat(data?.driver?.isOnline ?? false);
  return null;
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <GPSWatcher />
      <main className="pb-24">{children}</main>
      <DriverNav />
    </div>
  );
}
