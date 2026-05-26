'use client';

import { LogOut, MapPin, Settings, ChevronRight, Phone, Mail } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <span className="text-5xl">👤</span>
        <h2 className="text-xl font-bold text-slate-900">Sign in to view your profile</h2>
        <Button onClick={() => router.push('/login')}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 space-y-4">
      {/* Avatar */}
      <div className="flex flex-col items-center py-6 gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-3xl font-black">
          {user.firstName[0]}{user.lastName[0]}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      {/* Account details */}
      <Card>
        <CardContent className="divide-y divide-slate-50 py-0">
          {[
            { icon: Mail, label: 'Email', value: user.email },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3">
              <Icon className="h-4 w-4 text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Menu */}
      <Card>
        <CardContent className="divide-y divide-slate-50 py-0">
          {[
            { icon: MapPin, label: 'Saved Addresses', href: '/customer/addresses' },
            { icon: Settings, label: 'Garment Preferences', href: '/customer/preferences' },
          ].map(({ icon: Icon, label, href }) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 transition-colors"
            >
              <Icon className="h-4 w-4 text-slate-400" />
              <span className="flex-1 text-sm font-medium text-slate-900">{label}</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="outline" className="w-full text-red-500 border-red-200" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>

      <p className="text-center text-xs text-slate-400">Cykle PH v0.1.0</p>
    </div>
  );
}
