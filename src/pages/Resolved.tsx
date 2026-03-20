import { markets } from '@/lib/mock-data';
import MarketCard from '@/components/MarketCard';

export default function ResolvedPage() {
  const resolved = markets.filter((m) => m.status === 'resolved');

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8 animate-reveal-up">
        <h1 className="text-2xl font-bold mb-1">Mercados resolvidos</h1>
        <p className="text-sm text-muted-foreground">
          Mercados que já foram liquidados
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resolved.map((market, i) => (
          <MarketCard key={market.id} market={market} index={i} />
        ))}
      </div>

      {resolved.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <p className="text-muted-foreground text-sm">Nenhum mercado resolvido ainda</p>
        </div>
      )}
    </div>
  );
}
