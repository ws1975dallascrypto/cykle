import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: 'blue' | 'amber' | 'green' | 'purple';
  trend?: string;
  onClick?: () => void;
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   ring: 'ring-blue-100',   icon: 'bg-blue-100 text-blue-600',   val: 'text-blue-700'   },
  amber:  { bg: 'bg-amber-50',  ring: 'ring-amber-100',  icon: 'bg-amber-100 text-amber-600',  val: 'text-amber-700'  },
  green:  { bg: 'bg-green-50',  ring: 'ring-green-100',  icon: 'bg-green-100 text-green-600',  val: 'text-green-700'  },
  purple: { bg: 'bg-purple-50', ring: 'ring-purple-100', icon: 'bg-purple-100 text-purple-600', val: 'text-purple-700' },
};

export function StatsCard({ label, value, icon, color = 'blue', trend, onClick }: StatsCardProps) {
  const c = COLOR_MAP[color];
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col gap-3 rounded-2xl p-4 text-left transition-all w-full',
        c.bg, onClick && 'hover:shadow-card-hover active:scale-[0.98]'
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-xl', c.icon)}>
          {icon}
        </div>
        {trend && <span className="text-xs font-medium text-slate-500">{trend}</span>}
      </div>
      <div>
        <p className={cn('text-3xl font-black', c.val)}>{value}</p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
      </div>
    </button>
  );
}
