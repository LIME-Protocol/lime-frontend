import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface DetailItemProps {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  icon?: ReactNode;
}

export default function DetailItem({ label, value, mono, highlight, icon }: DetailItemProps) {
  return (
    <div>
      <p className="data-label mb-0.5">{label}</p>
      <p className={cn('text-sm', mono && 'font-mono tabular-nums', highlight && 'text-positive font-semibold')}>
        {icon && <span className="inline-flex mr-1 align-middle">{icon}</span>}{value}
      </p>
    </div>
  );
}
