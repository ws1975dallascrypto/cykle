import { formatPHP } from '@/lib/utils';

interface TodayStatsProps {
  deliveries: number;
  rating: number;
  totalDeliveries: number;
}

export function TodayStats({ deliveries, rating, totalDeliveries }: TodayStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Today's Trips",  value: deliveries.toString(),    icon: '🛵' },
        { label: 'Rating',         value: `${rating.toFixed(1)}⭐`,  icon: '⭐' },
        { label: 'All-time Trips', value: totalDeliveries.toString(), icon: '📦' },
      ].map(({ label, value, icon }) => (
        <div key={label} className="rounded-2xl bg-slate-800 p-3 text-center">
          <span className="text-xl">{icon}</span>
          <p className="text-lg font-black text-white mt-1">{value}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
}
