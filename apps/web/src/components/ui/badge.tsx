import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-brand-100 text-brand-700',
        success:  'bg-emerald-100 text-emerald-700',
        warning:  'bg-amber-100 text-amber-700',
        danger:   'bg-red-100 text-red-700',
        neutral:  'bg-slate-100 text-slate-600',
        express:  'bg-orange-100 text-orange-700',
        open:     'bg-green-100 text-green-700',
        closed:   'bg-slate-100 text-slate-500',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
