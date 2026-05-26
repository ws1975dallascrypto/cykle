import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">
          <span className="text-brand-500">Cykle</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-lg">
          On-demand laundry marketplace — pickup, process, deliver.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { href: '/customer', label: 'Customer', icon: '👕', color: 'bg-blue-50 hover:bg-blue-100' },
          { href: '/vendor', label: 'Vendor', icon: '🏪', color: 'bg-green-50 hover:bg-green-100' },
          { href: '/driver', label: 'Driver', icon: '🛵', color: 'bg-amber-50 hover:bg-amber-100' },
          { href: '/admin', label: 'Admin', icon: '⚙️', color: 'bg-purple-50 hover:bg-purple-100' },
        ].map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className={`flex flex-col items-center gap-3 rounded-2xl p-6 ${portal.color} transition-colors`}
          >
            <span className="text-4xl">{portal.icon}</span>
            <span className="font-semibold text-slate-700">{portal.label} Portal</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
