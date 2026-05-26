export const metadata = { title: 'Vendor Dashboard' };

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen">{children}</div>;
}
