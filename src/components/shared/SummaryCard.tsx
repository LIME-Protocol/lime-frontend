import { cn } from '@/lib/utils';

interface SummaryCardProps {
  label: string;
  value: string;
  valueClass?: string;
  icon?: string;
}

export default function SummaryCard({ label, value, valueClass, icon }: SummaryCardProps) {
  return (
    <div className="surface-card px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-sm">{icon}</span>}
        <p className="data-label">{label}</p>
      </div>
      <p className={cn('text-lg font-bold font-mono tabular-nums', valueClass)}>{value}</p>
    </div>
  );
}
