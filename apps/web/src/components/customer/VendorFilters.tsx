'use client';

import { useState } from 'react';
import { SlidersHorizontal, Zap, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortKey = 'distance' | 'rating' | 'express';

interface VendorFiltersProps {
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  expressOnly: boolean;
  onExpressToggle: () => void;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

const RADII = [2, 5, 10, 20];

export function VendorFilters({
  sort,
  onSortChange,
  expressOnly,
  onExpressToggle,
  radius,
  onRadiusChange,
}: VendorFiltersProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {/* Sort chips */}
      <FilterChip
        active={sort === 'distance'}
        onClick={() => onSortChange('distance')}
        icon={<MapPin className="h-3.5 w-3.5" />}
        label="Nearest"
      />
      <FilterChip
        active={sort === 'rating'}
        onClick={() => onSortChange('rating')}
        icon={<Star className="h-3.5 w-3.5" />}
        label="Top Rated"
      />
      <FilterChip
        active={expressOnly}
        onClick={onExpressToggle}
        icon={<Zap className="h-3.5 w-3.5" />}
        label="Express"
        highlight
      />

      <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

      {/* Radius selector */}
      {RADII.map((r) => (
        <button
          key={r}
          onClick={() => onRadiusChange(r)}
          className={cn(
            'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
            radius === r
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          {r}km
        </button>
      ))}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  icon,
  label,
  highlight = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
        active
          ? highlight
            ? 'bg-orange-500 text-white shadow-sm'
            : 'bg-brand-500 text-white shadow-sm'
          : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
