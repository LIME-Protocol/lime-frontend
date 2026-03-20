import { Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
        {icon || <Package className="h-5 w-5 text-muted-foreground" />}
      </div>
      <h3 className="text-sm font-semibold mb-1 text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground text-center max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
