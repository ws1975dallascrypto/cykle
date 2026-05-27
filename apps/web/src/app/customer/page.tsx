'use client';

import { useState } from 'react';
import { MapPin, Search, Loader2, AlertCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useVendors } from '@/hooks/useVendors';
import { VendorCard } from '@/components/customer/VendorCard';
import { VendorFilters, SortKey } from '@/components/customer/VendorFilters';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

export default function CustomerHomePage() {
  const { latitude, longitude, loading: geoLoading, error: geoError } = useGeolocation();
  const [sort, setSort] = useState<SortKey>('distance');
  const [expressOnly, setExpressOnly] = useState(false);
  const [radius, setRadius] = useState(10);
  const [search, setSearch] = useState('');

  const { data: vendors = [], isLoading, error } = useVendors(latitude, longitude, radius);

  const filtered = vendors
    .filter((v) => {
      if (expressOnly && !v.services.some((s) => s.turnaroundHours <= 4)) return false;
      if (search && !v.shopName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'express') {
        const aExpress = a.services.some((s) => s.turnaroundHours <= 4);
        const bExpress = b.services.some((s) => s.turnaroundHours <= 4);
        return bExpress ? 1 : aExpress ? -1 : 0;
      }
      return a.distance - b.distance;
    });

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-sm">
        <div className="px-4 pt-safe pt-4 pb-3">
          {/* Location bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
              <MapPin className="h-4 w-4 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500">Delivering to</p>
              {geoLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin text-brand-500" />
                  <span className="text-sm text-slate-400">Detecting location…</span>
                </div>
              ) : (
                <p className="text-sm font-bold text-slate-900">
                  {geoError ? 'Metro Manila (default)' : `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`}
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <Input
            placeholder="Search laundry shops…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Filters */}
        <div className="px-4 pb-3">
          <VendorFilters
            sort={sort}
            onSortChange={setSort}
            expressOnly={expressOnly}
            onExpressToggle={() => setExpressOnly((v) => !v)}
            radius={radius}
            onRadiusChange={setRadius}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-slate-500">Finding laundry shops near you…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <p className="font-semibold text-slate-700">Could not load shops</p>
            <p className="text-sm text-slate-500">Please check your connection and try again.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <span className="text-5xl">🔍</span>
            <p className="font-semibold text-slate-700">No shops found</p>
            <p className="text-sm text-slate-500">Try increasing the search radius or removing filters.</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-slate-500 mb-3">
              {filtered.length} shop{filtered.length !== 1 ? 's' : ''} within {radius}km
            </p>
            <div className="grid gap-3">
              {filtered.map((vendor) => (
                <VendorCard key={vendor.id} vendor={vendor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
