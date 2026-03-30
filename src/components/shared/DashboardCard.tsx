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
  onClick?: () => void;
}

export default function DashboardCard({ emoji, label, value, sub, color, onClick }: DashboardCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'surface-card px-4 py-3 text-left w-full transition-colors',
        onClick && 'hover:border-primary/20 cursor-pointer active:scale-[0.98]'
      )}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{emoji}</span>
        <p className="data-label text-[10px]">{label}</p>
      </div>
      <p className={cn('text-lg font-bold font-mono tabular-nums leading-tight', colorMap[color] || 'text-foreground')}>{value}</p>
      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</p>
    </button>
  );
}
