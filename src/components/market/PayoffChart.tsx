import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { calculatePayoff } from '@/lib/types';

interface PayoffChartProps {
  lower: number;
  upper: number;
  currentPrice: number;
  unit: string;
  resolvedValue?: number;
  referenceValue?: number;
  height?: number;
}

export default function PayoffChart({ lower, upper, currentPrice, unit, resolvedValue, referenceValue, height = 260 }: PayoffChartProps) {
  const data = useMemo(() => {
    const range = upper - lower;
    const padding = range * 0.12;
    const start = lower - padding;
    const end = upper + padding;
    const steps = 80;
    const step = (end - start) / steps;

    return Array.from({ length: steps + 1 }, (_, i) => {
      const value = start + i * step;
      return {
        value: Number(value.toFixed(2)),
        payoff: Number(calculatePayoff(value, lower, upper).toFixed(4)),
      };
    });
  }, [lower, upper]);

  const impliedVal = lower + currentPrice * (upper - lower);

  const formatVal = (v: number) => {
    if (Math.abs(v) >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return v.toFixed(1);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="payoffGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(160, 60%, 38%)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="hsl(160, 60%, 38%)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 92%)" />
        <XAxis
          dataKey="value"
          tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }}
          tickFormatter={formatVal}
          axisLine={{ stroke: 'hsl(215, 20%, 90%)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}¢`}
          domain={[-0.05, 1.05]}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(0, 0%, 100%)',
            border: '1px solid hsl(215, 20%, 90%)',
            borderRadius: '8px',
            fontSize: '11px',
            boxShadow: '0 4px 12px hsl(220, 25%, 10%, 0.08)',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}¢`, 'Payoff']}
          labelFormatter={(label) => `${formatVal(Number(label))} ${unit}`}
        />
        <Area
          type="linear"
          dataKey="payoff"
          stroke="hsl(160, 60%, 38%)"
          strokeWidth={2}
          fill="url(#payoffGrad)"
        />
        <ReferenceLine
          x={Number(impliedVal.toFixed(2))}
          stroke="hsl(38, 92%, 50%)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{ value: `Implied: ${formatVal(impliedVal)}`, position: 'top', fill: 'hsl(38, 92%, 50%)', fontSize: 10, fontWeight: 500 }}
        />
        {referenceValue !== undefined && !resolvedValue && (
          <ReferenceLine
            x={referenceValue}
            stroke="hsl(210, 80%, 52%)"
            strokeDasharray="2 4"
            strokeWidth={1}
            label={{ value: `Ref: ${formatVal(referenceValue)}`, position: 'insideTopRight', fill: 'hsl(210, 80%, 52%)', fontSize: 10 }}
          />
        )}
        {resolvedValue !== undefined && (
          <ReferenceLine
            x={resolvedValue}
            stroke="hsl(160, 60%, 38%)"
            strokeWidth={2}
            label={{ value: `Settled: ${formatVal(resolvedValue)}`, position: 'top', fill: 'hsl(160, 60%, 38%)', fontSize: 10, fontWeight: 600 }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
