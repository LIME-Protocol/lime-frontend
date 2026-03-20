import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="h-12 w-12 rounded-xl bg-negative/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-5 w-5 text-negative" />
      </div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground text-center max-w-xs mb-4">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="active:scale-[0.97]">
          Try again
        </Button>
      )}
    </div>
  );
}
