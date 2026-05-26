import { Badge } from '@/components/ui/badge';
import { ORDER_STATUS_LABELS } from '@cykle/shared';
import { Zap } from 'lucide-react';

type BadgeVariant = 'default' | 'warning' | 'success' | 'danger' | 'neutral' | 'express';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  PENDING:                  'warning',
  PICKUP_ASSIGNED:          'warning',
  DRIVER_EN_ROUTE_PICKUP:   'warning',
  DRIVER_ARRIVED_CUSTOMER:  'warning',
  COLLECTED:                'default',
  AT_LAUNDRY:               'default',
  PROCESSING:               'default',
  READY_FOR_DELIVERY:       'success',
  DELIVERY_ASSIGNED:        'success',
  DRIVER_EN_ROUTE_DELIVERY: 'success',
  DRIVER_ARRIVED_DELIVERY:  'success',
  DELIVERED:                'success',
  COMPLETED:                'success',
  CANCELLED:                'danger',
  DISPUTED:                 'danger',
};

interface OrderStatusBadgeProps {
  status: string;
  isExpress?: boolean;
}

export function OrderStatusBadge({ status, isExpress }: OrderStatusBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={STATUS_VARIANT[status] ?? 'neutral'}>
        {ORDER_STATUS_LABELS[status] ?? status}
      </Badge>
      {isExpress && (
        <Badge variant="express">
          <Zap className="h-3 w-3" />Express
        </Badge>
      )}
    </div>
  );
}
