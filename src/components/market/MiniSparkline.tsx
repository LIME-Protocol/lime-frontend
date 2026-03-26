import { useMemo } from 'react';

interface MiniSparklineProps {
  currentPrice: number;
  width?: number;
  height?: number;
}

export default function MiniSparkline({ currentPrice, width = 80, height = 28 }: MiniSparklineProps) {
  const points = useMemo(() => {
    const pts: number[] = [];
    let price = currentPrice * 0.7 + Math.random() * 0.2;
    for (let i = 0; i < 20; i++) {
      const drift = (currentPrice - price) * 0.08;
      const noise = (Math.random() - 0.5) * 0.04;
      price = Math.max(0.01, Math.min(0.99, price + drift + noise));
      pts.push(price);
    }
    return pts;
  }, [currentPrice]);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 0.01;

  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isUp = points[points.length - 1] >= points[0];

  return (
    <svg width={width} height={height} className="shrink-0">
      <path
        d={pathD}
        fill="none"
        stroke={isUp ? 'hsl(var(--positive))' : 'hsl(var(--negative))'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
