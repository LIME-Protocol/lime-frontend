import { cn } from '@/lib/utils';

const colorMap: Record<string, string> = {
  primary: 'text-primary',
  warning: 'text-warning',
  positive: 'text-positive',
  info: 'text-info',
};

interface DashboardCardProps {
  emoji: string;
  label: string;
  value: string;
  sub: string;
  color: string;
}

export default function DashboardCard({ emoji, label, value, sub, color }: DashboardCardProps) {
  return (
    <div className="surface-card px-4 py-3.5 group hover:border-primary/20 transition-colors">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{emoji}</span>
        <p className="data-label">{label}</p>
      </div>
      <p className={cn('text-xl font-bold font-mono tabular-nums', colorMap[color] || 'text-foreground')}>{value}</p>
      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</p>
    </div>
  );
}
