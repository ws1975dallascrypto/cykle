'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, Clock, Phone, Zap } from 'lucide-react';
import { useVendorDetail } from '@/hooks/useVendors';
import { ServiceCatalog } from '@/components/customer/ServiceCatalog';
import { CartBar } from '@/components/customer/CartBar';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { formatDistance, formatRating } from '@/lib/utils';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: vendor, isLoading, error } = useVendorDetail(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <span className="text-5xl">😕</span>
        <p className="font-semibold text-slate-700">Shop not found</p>
      </div>
    );
  }

  const expressServices = vendor.services.filter((s) => s.isExpress);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayHours = vendor.operatingHours?.[today];

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="relative h-48 bg-gradient-to-br from-brand-400 to-brand-600 overflow-hidden">
        <button
          onClick={() => router.back()}
          className="absolute top-safe-or-4 top-4 left-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-30">👕</span>
        </div>
        {expressServices.length > 0 && (
          <div className="absolute bottom-3 left-4">
            <Badge variant="express"><Zap className="h-3 w-3" />Express Available</Badge>
          </div>
        )}
      </div>

      {/* Shop info */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-black text-slate-900">{vendor.shopName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{vendor.description}</p>
          </div>
          <Badge variant={vendor.isOpen ? 'open' : 'closed'}>
            {vendor.isOpen ? '● Open' : '● Closed'}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-600">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <strong className="text-slate-800">{formatRating(vendor.rating)}</strong>
            <span className="text-slate-400">({vendor.totalReviews} reviews)</span>
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            {vendor.city}
          </span>
          {todayHours?.isOpen && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-slate-400" />
              {todayHours.openTime}–{todayHours.closeTime}
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {vendor.street}, {vendor.city}, {vendor.province}
        </p>
      </div>

      {/* Services */}
      <div className="px-4 pt-4">
        <h2 className="text-base font-bold text-slate-900 mb-3">Services</h2>
        <ServiceCatalog vendor={vendor} />
      </div>

      {/* Cart CTA */}
      <CartBar />
    </div>
  );
}
