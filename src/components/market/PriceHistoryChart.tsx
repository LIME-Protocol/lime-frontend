import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface PriceHistoryChartProps {
  marketId: string;
  currentPrice: number;
  unit: string;
  lowerBound: number;
  upperBound: number;
  height?: number;
}

function generatePriceHistory(currentPrice: number, days = 90) {
  const data: { date: string; price: number; volume: number }[] = [];
  const now = new Date();
  let price = currentPrice * 0.7 + Math.random() * 0.2;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const drift = (currentPrice - price) * 0.03;
    const noise = (Math.random() - 0.5) * 0.04;
    price = Math.max(0.01, Math.min(0.99, price + drift + noise));
    const volume = Math.floor(20000 + Math.random() * 80000 + (days - i) * 500);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(3)),
      volume,
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
            <linearGradient id={`priceGrad-${marketId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
              const p = payload[0].value as number;
              return (
                <div className="surface-card px-3 py-2 text-xs shadow-xl border border-border/50">
                  <p className="text-muted-foreground mb-1">{label}</p>
                  <p className="font-mono font-semibold text-foreground">{(p * 100).toFixed(1)}¢</p>
                  <p className="text-muted-foreground">
                    Implied: <span className="text-foreground font-mono">{impliedFromPrice(p).toFixed(1)} {unit}</span>
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill={`url(#priceGrad-${marketId})`}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--card))', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
