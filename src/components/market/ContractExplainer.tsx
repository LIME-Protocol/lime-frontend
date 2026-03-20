import { Market } from '@/lib/types';
import { Info } from 'lucide-react';

interface ContractExplainerProps {
  market: Market;
}

export default function ContractExplainer({ market }: ContractExplainerProps) {
  const fmtL = market.lowerBound.toLocaleString('en-US');
  const fmtU = market.upperBound.toLocaleString('en-US');

  return (
    <div className="flex gap-3">
      <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
      <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
        <p className="font-medium text-foreground text-[13px]">How this contract settles</p>
        <p>
          This contract pays out based on the observed value of <strong>{market.variable}</strong> on the resolution date.
        </p>
        <div className="space-y-1 pl-3 border-l-2 border-accent/20">
          <p>• If the value is <strong>at or below {fmtL} {market.unit}</strong>, the contract settles at <strong>0¢</strong> (floor)</p>
          <p>• If the value is <strong>at or above {fmtU} {market.unit}</strong>, the contract settles at <strong>100¢</strong> (cap)</p>
          <p>• If the value falls <strong>between {fmtL} and {fmtU}</strong>, the payout scales <strong>linearly</strong></p>
        </div>
        <p className="pt-1">
          Settlement source: <span className="font-medium text-foreground">{market.settlementSource}</span>
        </p>
      </div>
    </div>
  );
}
