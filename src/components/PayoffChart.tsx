import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart, ResponsiveContainer } from 'recharts';
import { calculatePayoff } from '@/lib/types';

interface PayoffChartProps {
  lower: number;
  upper: number;
  currentPrice: number;
  unit: string;
  resolvedValue?: number;
}

export default function PayoffChart({ lower, upper, currentPrice, unit, resolvedValue }: PayoffChartProps) {
  const data = useMemo(() => {
    const range = upper - lower;
    const padding = range * 0.15;
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

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="payoffGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(160, 60%, 38%)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="hsl(160, 60%, 38%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" />
          <XAxis
            dataKey="value"
            tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }}
            tickFormatter={(v) => v.toLocaleString()}
            axisLine={{ stroke: 'hsl(215, 20%, 90%)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(215, 12%, 50%)' }}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}¢`}
            domain={[-0.05, 1.05]}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(0, 0%, 100%)',
              border: '1px solid hsl(215, 20%, 90%)',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 12px hsl(220, 25%, 10%, 0.08)',
            }}
            formatter={(value: number) => [`${(value * 100).toFixed(1)}¢`, 'Payoff']}
            labelFormatter={(label) => `${label} ${unit}`}
          />
          <Area
            type="linear"
            dataKey="payoff"
            stroke="hsl(160, 60%, 38%)"
            strokeWidth={2}
            fill="url(#payoffGradient)"
          />
          <ReferenceLine
            x={impliedVal}
            stroke="hsl(38, 92%, 50%)"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Implícito: ${impliedVal.toFixed(1)} ${unit}`,
              position: 'top',
              fill: 'hsl(38, 92%, 50%)',
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          {resolvedValue !== undefined && (
            <ReferenceLine
              x={resolvedValue}
              stroke="hsl(160, 60%, 38%)"
              strokeWidth={2}
              label={{
                value: `Realizado: ${resolvedValue} ${unit}`,
                position: 'top',
                fill: 'hsl(160, 60%, 38%)',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
