'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/driver',         icon: Home,    label: 'Home'    },
  { href: '/driver/history', icon: History, label: 'History' },
  { href: '/driver/profile', icon: User,    label: 'Profile' },
];

export function DriverNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-900 pb-safe">
      <div className="flex items-center justify-around px-4 py-3">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/driver' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-1 rounded-xl transition-colors',
                active ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'stroke-[2.5px]')} />
              <span className="text-[11px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
