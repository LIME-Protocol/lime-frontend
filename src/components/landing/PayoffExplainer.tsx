import { useMemo, useState } from 'react';
import { Slider } from '@/components/ui/slider';

/**
 * Interactive Linear payoff explainer.
 * User drags "observed" value between Floor and Cap; payoff updates live.
 * Formula: (observed − floor) / (cap − floor) × 100¢, clamped to [0, 100].
 */
export default function PayoffExplainer() {
  const floor = 3.5;
  const cap = 5.5;
  const [observed, setObserved] = useState(4.25);

  const payoff = useMemo(() => {
    const raw = ((observed - floor) / (cap - floor)) * 100;
    return Math.max(0, Math.min(100, raw));
  }, [observed]);

  // Build path for linear curve preview with marker
  const W = 320;
  const H = 140;
  const pct = (observed - floor) / (cap - floor);
  const cx = Math.max(0, Math.min(1, pct)) * W;
  const cy = H - (payoff / 100) * H;

  return (
    <div className="grid md:grid-cols-2 gap-8 items-stretch">
      <div className="surface-card p-6 space-y-5">
        <div className="flex items-baseline justify-between">
          <span className="data-label">Observed value</span>
          <span className="font-mono tabular-nums text-2xl font-semibold">
            {observed.toFixed(2)}%
          </span>
        </div>
        <Slider
          aria-label="Observed value"
          value={[observed]}
          min={floor - 0.5}
          max={cap + 0.5}
          step={0.05}
          onValueChange={(v) => setObserved(v[0])}
        />
        <div className="flex justify-between text-[11px] font-mono tabular-nums text-muted-foreground">
          <span>Floor {floor.toFixed(2)}%</span>
          <span>Cap {cap.toFixed(2)}%</span>
        </div>

        <div className="pt-4 border-t border-border/60 space-y-2">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Payoff formula
          </div>
          <code className="block text-xs font-mono leading-relaxed bg-muted/60 rounded-md px-3 py-2.5 text-foreground">
            (observed − floor) ÷ (cap − floor) × 100¢
          </code>
          <div className="flex items-baseline justify-between pt-2">
            <span className="data-label">Contract payoff</span>
            <span className="font-mono tabular-nums text-3xl font-bold text-primary">
              {payoff.toFixed(1)}¢
            </span>
          </div>
        </div>
      </div>

      <div className="surface-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <span className="data-label">Linear payoff curve</span>
          <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
            0¢ → 100¢
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <svg
            viewBox={`0 0 ${W} ${H + 24}`}
            className="w-full h-auto"
            aria-hidden="true"
          >
            {/* grid */}
            <line x1="0" y1={H} x2={W} y2={H} stroke="hsl(var(--border))" />
            <line x1="0" y1="0" x2="0" y2={H} stroke="hsl(var(--border))" />
            {/* curve */}
            <line
              x1="0"
              y1={H}
              x2={W}
              y2="0"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* area under curve to marker */}
            <path
              d={`M0 ${H} L${cx} ${cy} L${cx} ${H} Z`}
              fill="hsl(var(--primary) / 0.18)"
            />
            {/* marker */}
            <line
              x1={cx}
              y1={H}
              x2={cx}
              y2={cy}
              stroke="hsl(var(--primary))"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
            <circle
              cx={cx}
              cy={cy}
              r="5"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
            <text
              x="4"
              y={H + 16}
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
              fontFamily="JetBrains Mono, monospace"
            >
              Floor
            </text>
            <text
              x={W - 24}
              y={H + 16}
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
              fontFamily="JetBrains Mono, monospace"
            >
              Cap
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
