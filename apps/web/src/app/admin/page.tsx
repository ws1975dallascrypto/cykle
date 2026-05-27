'use client';

import { useSystemAnalytics } from '@/hooks/useAdminDashboard';
import { MetricCard } from '@/components/admin/MetricCard';
import { Spinner } from '@/components/ui/spinner';
import { formatPHP } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data, isLoading } = useSystemAnalytics();

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Control Center</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform overview — refreshes every 30 seconds</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard label="Total Orders" value={data.orders.total.toLocaleString()} icon="📦"
          sub={`${data.orders.active} active · ${data.orders.completedToday} today`} color="blue" />
        <MetricCard label="Total Revenue" value={formatPHP(data.revenue.total)} icon="💰"
          sub={`${formatPHP(data.revenue.commissions)} in commissions`} color="green" />
        <MetricCard label="Registered Users" value={data.users.total.toLocaleString()} icon="👥" color="purple" />
        <MetricCard label="Drivers Online" value={data.drivers.online} icon="🛵" sub="Currently active" color="amber" />
        <MetricCard label="Vendors Open" value={data.vendors.open} icon="🏪" sub="Currently accepting orders" color="rose" />
        <MetricCard label="Completed Today" value={data.orders.completedToday} icon="✅" sub="Orders fulfilled today" color="green" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold text-slate-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/admin/orders',   label: 'All Orders',  icon: '📋' },
            { href: '/admin/vendors',  label: 'Vendors',     icon: '🏪' },
            { href: '/admin/drivers',  label: 'Drivers',     icon: '🛵' },
            { href: '/admin/settings', label: 'Settings',    icon: '⚙️' },
          ].map(({ href, label, icon }) => (
            <a key={href} href={href}
              className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 hover:border-brand-200 hover:bg-brand-50 transition-colors">
              <span className="text-xl">{icon}</span>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
