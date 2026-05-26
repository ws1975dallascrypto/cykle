'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPHP, formatDistance, formatRating } from '@/lib/utils';
import type { VendorSummary } from '@/hooks/useVendors';

interface VendorCardProps {
  vendor: VendorSummary;
}

export function VendorCard({ vendor }: VendorCardProps) {
  const expressService = vendor.services.find((s) => s.turnaroundHours <= 4);

  return (
    <Link href={`/customer/vendors/${vendor.id}`}>
      <Card className="hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden group">
        {/* Cover image / placeholder */}
        <div className="relative h-36 bg-gradient-to-br from-brand-50 to-brand-100 overflow-hidden">
          {vendor.logo ? (
            <Image src={vendor.logo} alt={vendor.shopName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">👕</span>
            </div>
          )}
          {/* Open/Closed badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={vendor.isOpen ? 'open' : 'closed'}>
              {vendor.isOpen ? '● Open' : '● Closed'}
            </Badge>
          </div>
          {expressService && (
            <div className="absolute top-2 right-2">
              <Badge variant="express">
                <Zap className="h-3 w-3" />
                Express
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="pt-3">
          <h3 className="font-bold text-slate-900 text-base leading-tight">{vendor.shopName}</h3>
          {vendor.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{vendor.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              {/* Rating */}
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-slate-800">{formatRating(vendor.rating)}</span>
                <span className="text-slate-400">({vendor.totalReviews})</span>
              </span>
              {/* Distance */}
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {formatDistance(vendor.distance)}
              </span>
            </div>

            {/* Fastest turnaround */}
            {vendor.services[0] && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {vendor.services[0].turnaroundHours}h
              </span>
            )}
          </div>

          {/* Starting price */}
          <div className="mt-2 pt-2 border-t border-slate-50">
            <span className="text-xs text-slate-500">From </span>
            <span className="text-sm font-bold text-brand-600">
              {formatPHP(Math.min(...vendor.services.map(() => 75)))} / kg
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
