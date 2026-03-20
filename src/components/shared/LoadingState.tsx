import { cn } from '@/lib/utils';

interface LoadingStateProps {
  rows?: number;
  variant?: 'card' | 'table' | 'detail';
}

function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('h-3 rounded animate-shimmer', className)} />;
}

function SkeletonCard() {
  return (
    <div className="surface-card p-5 space-y-3">
      <SkeletonLine className="w-16 h-5" />
      <SkeletonLine className="w-3/4 h-4" />
      <SkeletonLine className="w-1/2 h-7" />
      <SkeletonLine className="w-full h-2 rounded-full" />
      <div className="flex gap-4">
        <SkeletonLine className="w-20 h-3" />
        <SkeletonLine className="w-20 h-3" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0">
      <SkeletonLine className="w-32 h-4" />
      <SkeletonLine className="w-16 h-4" />
      <SkeletonLine className="w-20 h-4" />
      <SkeletonLine className="w-16 h-4 ml-auto" />
    </div>
  );
}

export default function LoadingState({ rows = 6, variant = 'card' }: LoadingStateProps) {
  if (variant === 'table') {
    return (
      <div className="surface-card overflow-hidden">
        {Array.from({ length: rows }).map((_, i) => <SkeletonTableRow key={i} />)}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <SkeletonLine className="w-20 h-5" />
          <SkeletonLine className="w-2/3 h-6" />
          <SkeletonLine className="w-full h-4" />
        </div>
        <div className="surface-card p-5 h-72">
          <SkeletonLine className="w-full h-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: rows }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
