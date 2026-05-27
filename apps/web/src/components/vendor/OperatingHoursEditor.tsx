'use client';

import { useState } from 'react';
import { OperatingHours, DayHours } from '@cykle/shared';
import { cn } from '@/lib/utils';

const DAYS: { key: keyof OperatingHours; label: string }[] = [
  { key: 'monday',    label: 'Monday'    },
  { key: 'tuesday',   label: 'Tuesday'   },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday'  },
  { key: 'friday',    label: 'Friday'    },
  { key: 'saturday',  label: 'Saturday'  },
  { key: 'sunday',    label: 'Sunday'    },
];

const DEFAULT_HOURS: DayHours = { isOpen: true, openTime: '08:00', closeTime: '20:00' };

interface OperatingHoursEditorProps {
  value: Partial<OperatingHours>;
  onChange: (hours: OperatingHours) => void;
}

export function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
  const [hours, setHours] = useState<OperatingHours>(() => {
    const base = {} as OperatingHours;
    for (const { key } of DAYS) {
      base[key] = (value as OperatingHours)[key] ?? { isOpen: false };
    }
    return base;
  });

  const update = (day: keyof OperatingHours, patch: Partial<DayHours>) => {
    const next = { ...hours, [day]: { ...hours[day], ...patch } };
    setHours(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const day = hours[key] ?? { isOpen: false };
        return (
          <div key={key} className={cn(
            'flex items-center gap-3 rounded-xl border p-3 transition-colors',
            day.isOpen ? 'border-brand-200 bg-brand-50' : 'border-slate-100 bg-white'
          )}>
            {/* Toggle */}
            <button
              type="button"
              onClick={() => {
                if (!day.isOpen) {
                  update(key, { isOpen: true, openTime: DEFAULT_HOURS.openTime, closeTime: DEFAULT_HOURS.closeTime });
                } else {
                  update(key, { isOpen: false });
                }
              }}
              className={cn(
                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors',
                day.isOpen ? 'bg-brand-500' : 'bg-slate-200'
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5',
                day.isOpen ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
              )} />
            </button>

            <span className={cn('w-24 text-sm font-semibold', day.isOpen ? 'text-slate-900' : 'text-slate-400')}>
              {label}
            </span>

            {day.isOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={day.openTime ?? '08:00'}
                  onChange={(e) => update(key, { openTime: e.target.value })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
                <span className="text-xs text-slate-400">to</span>
                <input
                  type="time"
                  value={day.closeTime ?? '20:00'}
                  onChange={(e) => update(key, { closeTime: e.target.value })}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-400"
                />
              </div>
            ) : (
              <span className="text-xs text-slate-400 flex-1">Closed</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
