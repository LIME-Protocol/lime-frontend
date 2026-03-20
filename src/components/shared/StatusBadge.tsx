import { cn } from '@/lib/utils';
import { MarketStatus, OrderStatus, LogAction } from '@/lib/types';

const marketStatusConfig: Record<MarketStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-positive/10 text-positive' },
  pending: { label: 'Pending', className: 'bg-[hsl(var(--pending-muted))] text-[hsl(var(--pending-foreground))]' },
  resolved: { label: 'Resolved', className: 'bg-[hsl(var(--info-muted))] text-[hsl(var(--info))]' },
  settled: { label: 'Settled', className: 'bg-secondary text-muted-foreground' },
  invalid: { label: 'Invalid', className: 'bg-negative/10 text-negative' },
};

const orderStatusConfig: Record<OrderStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-[hsl(var(--info-muted))] text-[hsl(var(--info))]' },
  filled: { label: 'Filled', className: 'bg-positive/10 text-positive' },
  partial: { label: 'Partial', className: 'bg-[hsl(var(--warning-muted))] text-[hsl(var(--warning))]' },
  cancelled: { label: 'Cancelled', className: 'bg-secondary text-muted-foreground' },
};

const logActionConfig: Record<LogAction, { label: string; className: string }> = {
  create: { label: 'Created', className: 'bg-[hsl(var(--info-muted))] text-[hsl(var(--info))]' },
  approve: { label: 'Approved', className: 'bg-positive/10 text-positive' },
  resolve: { label: 'Resolved', className: 'bg-positive/10 text-positive' },
  invalidate: { label: 'Invalidated', className: 'bg-negative/10 text-negative' },
  edit: { label: 'Edited', className: 'bg-[hsl(var(--warning-muted))] text-[hsl(var(--warning))]' },
};

interface StatusBadgeProps {
  type: 'market' | 'order' | 'log';
  status: string;
  className?: string;
}

export default function StatusBadge({ type, status, className }: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;

  if (type === 'market') config = marketStatusConfig[status as MarketStatus];
  else if (type === 'order') config = orderStatusConfig[status as OrderStatus];
  else if (type === 'log') config = logActionConfig[status as LogAction];

  if (!config) return null;

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium',
      config.className,
      className,
    )}>
      {config.label}
    </span>
  );
}
