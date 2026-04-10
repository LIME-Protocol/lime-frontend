import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatAxisValue, formatAxisLabel } from '@/lib/chart-utils';

interface PriceHistoryChartProps {
  marketId: string;
  currentPrice: number;
  unit: string;
  lowerBound: number;
  upperBound: number;
  height?: number;
}

function generatePriceHistory(currentPrice: number, days = 90) {
  const data: { date: string; buy: number; sell: number }[] = [];
  const now = new Date();
  let price = currentPrice * 0.7 + Math.random() * 0.2;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const drift = (currentPrice - price) * 0.03;
    const noise = (Math.random() - 0.5) * 0.04;
    price = Math.max(0.01, Math.min(0.99, price + drift + noise));
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      buy: Number(price.toFixed(3)),
      sell: Number((1 - price).toFixed(3)),
    });
  }
  return data;
}

export default function PriceHistoryChart({ marketId, currentPrice, unit, lowerBound, upperBound, height = 240 }: PriceHistoryChartProps) {
  const data = useMemo(() => generatePriceHistory(currentPrice), [marketId, currentPrice]);

  const impliedFromPrice = (p: number) => lowerBound + p * (upperBound - lowerBound);

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`buyGrad-${marketId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--positive))" stopOpacity={0.25} />
              <stop offset="100%" stopColor="hsl(var(--positive))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`sellGrad-${marketId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--negative))" stopOpacity={0.15} />
              <stop offset="100%" stopColor="hsl(var(--negative))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}¢`}
            width={38}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const buyPrice = payload[0]?.value as number;
              const sellPrice = payload[1]?.value as number;
              const implied = impliedFromPrice(buyPrice);
              return (
                <div className="surface-card px-3 py-2 text-xs shadow-xl border border-border/50 space-y-1">
                  <p className="text-muted-foreground">{label}</p>
                  <p className="text-positive font-mono font-semibold">
                    Buy: {(buyPrice * 100).toFixed(1)}¢
                  </p>
                  <p className="text-negative font-mono font-semibold">
                    Sell: {(sellPrice * 100).toFixed(1)}¢
                  </p>
                  <p className="text-muted-foreground">
                    Implied: <span className="text-foreground font-mono">{formatAxisLabel(implied, unit)}</span>
                  </p>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="line"
            wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
          />
          <Area
            type="monotone"
            dataKey="buy"
            name="Buy Price"
            stroke="hsl(var(--positive))"
            strokeWidth={2}
            fill={`url(#buyGrad-${marketId})`}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--positive))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="sell"
            name="Sell Price"
            stroke="hsl(var(--negative))"
            strokeWidth={1.5}
            fill={`url(#sellGrad-${marketId})`}
            dot={false}
            strokeDasharray="4 2"
            activeDot={{ r: 3, fill: 'hsl(var(--negative))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
