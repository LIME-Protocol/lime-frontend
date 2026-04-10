import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { calculatePayoff, calculateSellPayoff } from '@/lib/types';
import type { PayoffCurve } from '@/lib/types';
import { formatAxisValue, formatAxisLabel } from '@/lib/chart-utils';
import { cn } from '@/lib/utils';

interface PayoffChartProps {
  lower: number;
  upper: number;
  currentPrice: number;
  unit: string;
  resolvedValue?: number;
  referenceValue?: number;
  height?: number;
  curve?: PayoffCurve;
}

export default function PayoffChart({ lower, upper, currentPrice, unit, resolvedValue, referenceValue, height = 260, curve }: PayoffChartProps) {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');

  const data = useMemo(() => {
    const range = upper - lower;
    const padding = range * 0.12;
    const start = lower - padding;
    const end = upper + padding;
    const steps = 80;
    const step = (end - start) / steps;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = start + i * step;
      const buyPayoff = calculatePayoff(value, lower, upper, curve);
      const sellPayoff = calculateSellPayoff(value, lower, upper, curve);
      return {
        value: Number(value.toFixed(2)),
        buy: Number(buyPayoff.toFixed(4)),
        sell: Number(sellPayoff.toFixed(4)),
      };
    });
  }, [lower, upper, curve]);

  const impliedVal = lower + currentPrice * (upper - lower);
  const tickFmt = (v: number) => formatAxisValue(v, unit);
  const labelFmt = (v: number) => formatAxisLabel(v, unit);

  const isBuy = side === 'buy';
  const dataKey = isBuy ? 'buy' : 'sell';
  const strokeColor = isBuy ? 'hsl(142, 60%, 42%)' : 'hsl(0, 72%, 51%)';
  const gradientId = isBuy ? 'payoffGradBuy' : 'payoffGradSell';

  return (
    <div>
      {/* Buy / Sell toggle */}
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setSide('buy')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            isBuy
              ? 'bg-positive/15 text-positive border border-positive/30'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          Buyer Payoff
        </button>
        <button
          onClick={() => setSide('sell')}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
            !isBuy
              ? 'bg-negative/15 text-negative border border-negative/30'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          Seller Payoff
        </button>
        <span className="text-[10px] text-muted-foreground ml-2">
          {isBuy ? 'Pays more when value is higher' : 'Pays more when value is lower'}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 16, right: 12, bottom: 20, left: 0 }}>
          <defs>
            <linearGradient id="payoffGradBuy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142, 60%, 42%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(142, 60%, 42%)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="payoffGradSell" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="value"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={tickFmt}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickLine={false}
            label={{
              value: unit || 'Value',
              position: 'insideBottom',
              offset: -10,
              style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 },
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}¢`}
            domain={[-0.05, 1.05]}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '11px',
              boxShadow: '0 8px 24px hsl(0 0% 0% / 0.2)',
              padding: '8px 12px',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}¢`, isBuy ? 'Buyer Payoff' : 'Seller Payoff']}
            labelFormatter={(label) => labelFmt(Number(label))}
          />
          <Area type={curve?.type === 'step' ? 'stepAfter' : 'monotone'} dataKey={dataKey} stroke={strokeColor} strokeWidth={2} fill={`url(#${gradientId})`} />
          <ReferenceLine x={lower} stroke="hsl(var(--border))" strokeDasharray="4 2" strokeWidth={1}
            label={{ value: `Floor: ${labelFmt(lower)}`, position: 'insideBottomLeft', fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
          />
          <ReferenceLine x={upper} stroke="hsl(var(--border))" strokeDasharray="4 2" strokeWidth={1}
            label={{ value: `Cap: ${labelFmt(upper)}`, position: 'insideBottomRight', fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
          />
          <ReferenceLine x={Number(impliedVal.toFixed(2))} stroke="hsl(38, 92%, 56%)" strokeDasharray="4 4" strokeWidth={1.5}
            label={{ value: `Implied: ${labelFmt(impliedVal)}`, position: 'top', fill: 'hsl(38, 92%, 56%)', fontSize: 10, fontWeight: 600 }}
          />
          {referenceValue !== undefined && !resolvedValue && (
            <ReferenceLine x={referenceValue} stroke="hsl(210, 80%, 58%)" strokeDasharray="2 4" strokeWidth={1}
              label={{ value: `Ref: ${labelFmt(referenceValue)}`, position: 'insideTopRight', fill: 'hsl(210, 80%, 58%)', fontSize: 10 }}
            />
          )}
          {resolvedValue !== undefined && (
            <ReferenceLine x={resolvedValue} stroke="hsl(142, 60%, 42%)" strokeWidth={2.5}
              label={{ value: `Settled: ${labelFmt(resolvedValue)}`, position: 'top', fill: 'hsl(142, 60%, 42%)', fontSize: 10, fontWeight: 700 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
