import { cn } from '@/lib/utils';
import { MarketStatus, OrderStatus, LogAction } from '@/lib/types';

const marketStatusConfig: Record<MarketStatus, { label: string; dot: string; className: string }> = {
  draft: { label: 'Draft', dot: 'bg-muted-foreground', className: 'bg-secondary text-secondary-foreground' },
  active: { label: 'Active', dot: 'bg-positive', className: 'bg-positive-soft text-positive-foreground' },
  pending: { label: 'Pending Review', dot: 'bg-warning', className: 'bg-warning-soft text-warning-foreground' },
  preliminary: { label: 'Bookbuilding', dot: 'bg-info', className: 'bg-info-soft text-info-foreground' },
  pending_resolution: { label: 'Pending Resolution', dot: 'bg-warning', className: 'bg-warning-soft text-warning-foreground' },
  resolved: { label: 'Resolved', dot: 'bg-info', className: 'bg-info-soft text-info-foreground' },
  settled: { label: 'Settled', dot: 'bg-muted-foreground', className: 'bg-secondary text-secondary-foreground' },
  invalid: { label: 'Invalid', dot: 'bg-negative', className: 'bg-negative-soft text-negative-foreground' },
  invalidated: { label: 'Invalidated', dot: 'bg-negative', className: 'bg-negative-soft text-negative-foreground' },
  cancelled: { label: 'Cancelled', dot: 'bg-negative', className: 'bg-negative-soft text-negative-foreground' },
};

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-info-soft text-info-foreground' },
  filled: { label: 'Filled', className: 'bg-positive-soft text-positive-foreground' },
  partial: { label: 'Partial', className: 'bg-warning-soft text-warning-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-secondary text-secondary-foreground' },
};

const logActionConfig: Record<LogAction, { label: string; className: string }> = {
  create: { label: 'Created', className: 'bg-info-soft text-info-foreground' },
  approve: { label: 'Approved', className: 'bg-positive-soft text-positive-foreground' },
  resolve: { label: 'Resolved', className: 'bg-positive-soft text-positive-foreground' },
  invalidate: { label: 'Invalidated', className: 'bg-negative-soft text-negative-foreground' },
  edit: { label: 'Edited', className: 'bg-warning-soft text-warning-foreground' },
};

interface StatusBadgeProps {
  type: 'market' | 'order' | 'log';
  status: string;
  className?: string;
}

export default function StatusBadge({ type, status, className }: StatusBadgeProps) {
  if (type === 'market') {
    const config = marketStatusConfig[status as MarketStatus];
    if (!config) return null;
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium', config.className, className)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
        {config.label}
      </span>
    );
  }

  let config: { label: string; className: string } | undefined;
  if (type === 'order') config = orderStatusConfig[status as OrderStatus];
  else if (type === 'log') config = logActionConfig[status as LogAction];
  if (!config) return null;

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium', config.className, className)}>
      {config.label}
    </span>
  );
}
