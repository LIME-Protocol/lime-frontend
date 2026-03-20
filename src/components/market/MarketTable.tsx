import { Link } from 'react-router-dom';
import { Market, formatCurrency, formatPrice, impliedValue, daysUntil } from '@/lib/types';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface MarketTableProps {
  markets: Market[];
}

export default function MarketTable({ markets }: MarketTableProps) {
  return (
    <div className="surface-raised rounded-xl border overflow-hidden animate-reveal-up">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/40">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Market</th>
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Implied</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">24h Vol</th>
              <th className="text-right px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Resolution</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => {
              const implied = impliedValue(m.currentPrice, m.lowerBound, m.upperBound);
              const days = daysUntil(m.resolutionDate);
              return (
                <tr key={m.id} className="border-b last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/market/${m.id}`} className="font-medium text-sm hover:text-accent transition-colors">
                      {m.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.category}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">
                    {formatImplied(implied, m.unit)}
                    <span className="text-[10px] text-muted-foreground ml-1">{m.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {formatPrice(m.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground">
                    {formatCurrency(m.volume24h)}
                  </td>
                  <td className={cn(
                    'px-4 py-3 text-right text-xs hidden md:table-cell',
                    days <= 14 && m.status === 'active' ? 'text-warning font-medium' : 'text-muted-foreground'
                  )}>
                    {m.status === 'active' ? `${days}d` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
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

function formatImplied(n: number, unit: string): string {
  if (unit === 'pts' || unit === '$' || unit === '$/oz' || unit === '$/bbl') {
    return n >= 1000 ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : n.toFixed(1);
  }
  return n.toFixed(2);
}
