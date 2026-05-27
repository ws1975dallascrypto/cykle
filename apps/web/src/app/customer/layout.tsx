import type { Metadata } from 'next';
import { CustomerNav } from '@/components/customer/CustomerNav';

export const metadata: Metadata = { title: 'Cykle — Find Laundry Near You' };

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-muted pb-20">
      {children}
      <CustomerNav />
    </div>
  );
}
