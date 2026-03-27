import { cn } from '@/lib/utils';
import InfoTip from './InfoTip';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  tooltip?: string;
  highlight?: boolean;
}

export default function MetricCard({ label, value, sub, tooltip, highlight }: MetricCardProps) {
  return (
    <div className={cn('surface-card px-4 py-3', highlight && 'glow-accent border-primary/20')}>
      <p className="data-label mb-0.5">{label}{tooltip && <InfoTip content={tooltip} />}</p>
      <p className={cn('text-lg font-bold font-mono tabular-nums', highlight && 'text-primary')}>
        {value}{sub && <span className="text-xs font-normal text-muted-foreground ml-1">{sub}</span>}
      </p>
    </div>
  );
}
