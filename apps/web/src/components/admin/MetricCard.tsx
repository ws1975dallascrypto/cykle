import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
}

const colorMap = {
  blue:   'bg-blue-500/10 text-blue-400',
  green:  'bg-emerald-500/10 text-emerald-400',
  amber:  'bg-amber-500/10 text-amber-400',
  purple: 'bg-purple-500/10 text-purple-400',
  rose:   'bg-rose-500/10 text-rose-400',
};

export function MetricCard({ label, value, icon, sub, color = 'blue' }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-3xl font-black text-slate-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-xl', colorMap[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
