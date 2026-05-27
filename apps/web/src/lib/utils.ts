import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}

/** Returns time slots for scheduling in Asia/Manila timezone */
export function getTimeSlots(date: Date, intervalMinutes = 30): string[] {
  const slots: string[] = [];
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const minHour = isToday ? now.getHours() + 1 : 7;

  for (let h = Math.max(minHour, 7); h <= 21; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const label = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      slots.push(label);
    }
  }
  return slots;
}

/** Next N days starting from today */
export function getAvailableDates(days = 7): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
}
