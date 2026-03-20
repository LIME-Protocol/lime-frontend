import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface InfoTipProps {
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function InfoTip({ content, side = 'top' }: InfoTipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button className="inline-flex text-muted-foreground hover:text-foreground transition-colors ml-1 align-middle">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[240px] text-xs leading-relaxed bg-popover border-border shadow-lg"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
