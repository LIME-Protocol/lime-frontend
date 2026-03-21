import { Market, calculatePayoff } from '@/lib/types';
import InfoTip from '@/components/shared/InfoTip';
import { ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';

interface ContractExplainerProps {
  market: Market;
}

export default function ContractExplainer({ market }: ContractExplainerProps) {
  const fmtL = market.lowerBound.toLocaleString('en-US');
  const fmtU = market.upperBound.toLocaleString('en-US');
  const mid = (market.lowerBound + market.upperBound) / 2;
  const midPayoff = calculatePayoff(mid, market.lowerBound, market.upperBound);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[14px] font-semibold mb-1 flex items-center gap-1">
          How this contract settles
          <InfoTip content="This is a range contract. The payout depends linearly on where the final observed value lands within the contract range." />
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The contract tracks <span className="text-foreground font-medium">{market.variable}</span> and settles based on its observed value on the resolution date.
        </p>
      </div>

      {/* Visual settlement rules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-negative-soft/50 border border-negative/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-negative/15 flex items-center justify-center">
              <ArrowDown className="h-3.5 w-3.5 text-negative" />
            </div>
            <span className="text-[11px] font-semibold text-negative-foreground">Floor</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Value ≤ <span className="font-mono font-semibold text-foreground">{fmtL}</span> {market.unit}
          </p>
          <p className="text-lg font-bold font-mono tabular-nums text-negative mt-1">0¢</p>
        </div>

        <div className="rounded-lg bg-positive-soft/50 border border-positive/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-positive/15 flex items-center justify-center">
              <ArrowRight className="h-3.5 w-3.5 text-positive" />
            </div>
            <span className="text-[11px] font-semibold text-positive-foreground">Linear</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Between <span className="font-mono font-semibold text-foreground">{fmtL}</span> and <span className="font-mono font-semibold text-foreground">{fmtU}</span>
          </p>
          <p className="text-lg font-bold font-mono tabular-nums text-positive mt-1">0¢ — 100¢</p>
        </div>

        <div className="rounded-lg bg-info-soft/50 border border-info/10 p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-md bg-info/15 flex items-center justify-center">
              <ArrowUp className="h-3.5 w-3.5 text-info" />
            </div>
            <span className="text-[11px] font-semibold text-info-foreground">Cap</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Value ≥ <span className="font-mono font-semibold text-foreground">{fmtU}</span> {market.unit}
          </p>
          <p className="text-lg font-bold font-mono tabular-nums text-info mt-1">100¢</p>
        </div>
      </div>

      {/* Example calculation */}
      <div className="rounded-lg bg-secondary/40 border border-border/50 p-4">
        <p className="data-label mb-2">Example</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          If <span className="font-medium text-foreground">{market.variable}</span> settles at{' '}
          <span className="font-mono font-semibold text-foreground">{mid.toLocaleString('en-US', { maximumFractionDigits: 1 })} {market.unit}</span>{' '}
          (midpoint of the range), the contract pays{' '}
          <span className="font-mono font-semibold text-primary">{(midPayoff * 100).toFixed(0)}¢</span> per contract.
        </p>
      </div>

      <div className="text-xs text-muted-foreground">
        Settlement source: <span className="text-foreground font-medium">{market.settlementSource}</span>
      </div>
    </div>
  );
}
