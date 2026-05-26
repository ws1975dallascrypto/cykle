'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Settings,
  LogOut,
  Shirt,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/vendor',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/vendor/orders',   icon: ClipboardList,   label: 'Orders'    },
  { href: '/vendor/catalog',  icon: BookOpen,        label: 'Catalog'   },
  { href: '/vendor/settings', icon: Settings,        label: 'Settings'  },
];

// ── Sidebar (desktop) ────────────────────────────────────────────────────────
export function VendorSidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  return (
    <aside className="hidden lg:flex w-60 flex-col bg-slate-900 text-white min-h-screen flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
          <Shirt className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-black text-white text-sm">Cykle</p>
          <p className="text-[10px] text-slate-400">Vendor Portal</p>
        </div>
      </div>

      {/* Shop name */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-800">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/vendor' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={() => { clearAuth(); router.push('/'); }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Bottom nav (mobile) ───────────────────────────────────────────────────────
export function VendorBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/vendor' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
                active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'stroke-[2.5px]')} />
              <span className={cn('text-[11px] font-medium', active ? 'text-brand-600' : 'text-slate-400')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
