import type { Metadata } from 'next';
import { VendorSidebar, VendorBottomNav } from '@/components/vendor/VendorNav';

export const metadata: Metadata = { title: { default: 'Vendor Dashboard', template: '%s | Cykle Vendor' } };

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <VendorSidebar />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0">
        {children}
      </main>
      <VendorBottomNav />
    </div>
  );
}
