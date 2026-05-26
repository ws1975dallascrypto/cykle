'use client';

import { useState } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Truck, Package } from 'lucide-react';
import { useCartStore, ScheduleSlot } from '@/store/cart.store';
import { getAvailableDates, getTimeSlots, formatShortDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

function DateSlider({
  dates,
  selected,
  onSelect,
}: {
  dates: Date[];
  selected: string | null;
  onSelect: (dateStr: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {dates.map((d) => {
        const dateStr = d.toISOString().slice(0, 10);
        const isSelected = selected === dateStr;
        const isToday = d.toDateString() === new Date().toDateString();
        return (
          <button
            key={dateStr}
            onClick={() => onSelect(dateStr)}
            className={cn(
              'flex flex-shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-all min-w-[64px]',
              isSelected
                ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
            )}
          >
            <span className={cn('text-xs font-medium', isSelected ? 'text-brand-100' : 'text-slate-500')}>
              {isToday ? 'Today' : d.toLocaleDateString('en-PH', { weekday: 'short' })}
            </span>
            <span className="text-xl font-black leading-tight">{d.getDate()}</span>
            <span className={cn('text-xs', isSelected ? 'text-brand-100' : 'text-slate-400')}>
              {d.toLocaleDateString('en-PH', { month: 'short' })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TimeGrid({
  times,
  selected,
  onSelect,
}: {
  times: string[];
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {times.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={cn(
            'rounded-xl border py-2 text-xs font-semibold transition-all',
            selected === t
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SlotPicker({
  title,
  icon,
  slot,
  onSet,
  minDate,
  description,
}: {
  title: string;
  icon: React.ReactNode;
  slot: ScheduleSlot | null;
  onSet: (slot: ScheduleSlot) => void;
  minDate?: Date;
  description?: string;
}) {
  const dates = getAvailableDates(7);
  const [selectedDate, setSelectedDate] = useState<string | null>(slot?.date ?? null);
  const [selectedTime, setSelectedTime] = useState<string | null>(slot?.time ?? null);

  const handleDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTime = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) onSet({ date: selectedDate, time });
  };

  const availableTimes = selectedDate
    ? getTimeSlots(new Date(selectedDate + 'T00:00:00'))
    : [];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-900">{title}</p>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>
        {slot && (
          <div className="ml-auto text-right">
            <p className="text-xs font-semibold text-brand-600">
              {formatShortDate(new Date(slot.date))} · {slot.time}
            </p>
          </div>
        )}
      </div>

      <DateSlider dates={dates} selected={selectedDate} onSelect={handleDate} />

      {selectedDate && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Select a time slot
          </p>
          <TimeGrid times={availableTimes} selected={selectedTime} onSelect={handleTime} />
        </div>
      )}
    </div>
  );
}

export function SchedulingEngine() {
  const { pickupSlot, deliverySlot, setPickupSlot, setDeliverySlot } = useCartStore();

  const minDeliveryDate = pickupSlot
    ? new Date(new Date(pickupSlot.date).getTime() + 24 * 60 * 60 * 1000)
    : new Date();

  return (
    <div className="space-y-4">
      <SlotPicker
        title="Pickup Schedule"
        icon={<Package className="h-4 w-4" />}
        slot={pickupSlot}
        onSet={setPickupSlot}
        description="When should we collect your laundry?"
      />
      <SlotPicker
        title="Return Delivery Schedule"
        icon={<Truck className="h-4 w-4" />}
        slot={deliverySlot}
        onSet={setDeliverySlot}
        minDate={minDeliveryDate}
        description="When should we return your clean laundry?"
      />

      {pickupSlot && deliverySlot && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm text-emerald-700">
          ✓ Pickup on <strong>{formatShortDate(new Date(pickupSlot.date))} at {pickupSlot.time}</strong>
          {' '}· Return on <strong>{formatShortDate(new Date(deliverySlot.date))} at {deliverySlot.time}</strong>
        </div>
      )}
    </div>
  );
}
