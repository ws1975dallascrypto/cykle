'use client';

import { Power, Loader2 } from 'lucide-react';
import { useToggleOnline } from '@/hooks/useDriverDashboard';
import { cn } from '@/lib/utils';

interface OnlineToggleProps {
  isOnline: boolean;
}

export function OnlineToggle({ isOnline }: OnlineToggleProps) {
  const { mutate: toggle, isPending } = useToggleOnline();

  return (
    <button
      onClick={() => toggle()}
      disabled={isPending}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-full transition-all duration-300 shadow-2xl',
        'w-40 h-40 mx-auto select-none active:scale-95',
        isOnline
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/40'
          : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-slate-900/60'
      )}
    >
      {/* Pulse ring when online */}
      {isOnline && (
        <span className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-20" />
      )}

      {isPending ? (
        <Loader2 className="h-12 w-12 text-white animate-spin" />
      ) : (
        <Power className={cn('h-12 w-12 transition-colors', isOnline ? 'text-white' : 'text-slate-400')} />
      )}

      <span className={cn('mt-2 text-sm font-black tracking-wider', isOnline ? 'text-white' : 'text-slate-400')}>
        {isPending ? 'SWITCHING…' : isOnline ? 'ONLINE' : 'OFFLINE'}
      </span>
    </button>
  );
}
