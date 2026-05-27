'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/customer',        icon: Home,          label: 'Home'    },
  { href: '/customer/orders', icon: ClipboardList, label: 'Orders'  },
  { href: '/customer/cart',   icon: ShoppingBag,   label: 'Cart'    },
  { href: '/customer/profile', icon: User,         label: 'Profile' },
];

export function CustomerNav() {
  const pathname = usePathname();
  const { itemCount } = useCartStore();
  const cartCount = itemCount();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/customer' && pathname.startsWith(href));
          const isCart = href === '/customer/cart';
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors',
                active ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', active && 'stroke-[2.5px]')} />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-black text-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
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
