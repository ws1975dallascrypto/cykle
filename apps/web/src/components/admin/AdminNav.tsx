'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Store, Bike, Settings, LogOut, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';

const NAV = [
  { href: '/admin',          icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/admin/orders',   icon: ShoppingBag,     label: 'Orders'     },
  { href: '/admin/vendors',  icon: Store,           label: 'Vendors'    },
  { href: '/admin/drivers',  icon: Bike,            label: 'Drivers'    },
  { href: '/admin/settings', icon: Settings,        label: 'Settings'   },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleSignOut = () => { clearAuth(); router.push('/login'); };

  return (
    <aside className="w-60 shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <span className="text-xl font-black text-white tracking-tight">Cykle</span>
        <span className="ml-2 rounded-md bg-brand-500/20 px-2 py-0.5 text-[10px] font-black text-brand-400 uppercase tracking-wider">Admin</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                active
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && <ChevronRight className="h-3 w-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 border-t border-slate-800 pt-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
