import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil } from '@/lib/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface MarketTableProps {
  markets: Market[];
}

export default function MarketTable({ markets }: MarketTableProps) {
  return (
    <div className="surface-card overflow-hidden animate-reveal-up">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 data-label">Market</th>
              <th className="text-left px-4 py-3 data-label hidden sm:table-cell">Category</th>
              <th className="text-right px-4 py-3 data-label">Implied</th>
              <th className="text-right px-4 py-3 data-label">Price</th>
              <th className="text-right px-4 py-3 data-label hidden md:table-cell">Range</th>
              <th className="text-right px-4 py-3 data-label">24h Vol</th>
              <th className="text-right px-4 py-3 data-label hidden lg:table-cell">Resolution</th>
              <th className="text-center px-4 py-3 data-label">Status</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => {
              const implied = impliedValue(m.currentPrice, m.lowerBound, m.upperBound);
              const days = daysUntil(m.resolutionDate);
              return (
                <tr key={m.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <Link to={`/market/${m.id}`} className="font-medium text-[13px] hover:text-primary transition-colors">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{m.category}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="data-value text-foreground">{fmtImplied(implied, m.unit)}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">{m.unit}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-muted-foreground">
                    {formatPrice(m.currentPrice)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-[12px] text-muted-foreground hidden md:table-cell">
                    {fmtBound(m.lowerBound)}–{fmtBound(m.upperBound)}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-muted-foreground">
                    {formatCurrency(m.volume24h)}
                  </td>
                  <td className={cn(
                    'px-4 py-3.5 text-right text-xs hidden lg:table-cell',
                    days <= 14 && m.status === 'active' ? 'text-warning font-semibold' : 'text-muted-foreground'
                  )}>
                    {m.status === 'active' ? `${days}d` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge type="market" status={m.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function fmtImplied(n: number, unit: string): string {
  if (unit === 'pts' || unit === '$' || unit === '$/oz' || unit === '$/bbl') return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
  return n.toFixed(2);
}

function fmtBound(n: number): string {
  return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toString();
}
