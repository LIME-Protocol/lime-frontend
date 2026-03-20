import { useState } from 'react';
import { markets, categories } from '@/lib/mock-data';
import MarketCard from '@/components/MarketCard';
import { cn } from '@/lib/utils';

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [search, setSearch] = useState('');

  const filtered = markets.filter((m) => {
    if (m.status === 'resolved') return false;
    if (activeCategory !== 'Todos' && m.category !== activeCategory) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8 animate-reveal-up">
        <h1 className="text-2xl font-bold mb-1">Mercados</h1>
        <p className="text-sm text-muted-foreground">
          Negocie expectativas sobre variáveis econômicas futuras
        </p>
      </div>

      {/* Search */}
      <div className="mb-5 animate-reveal-up delay-100">
        <input
          type="text"
          placeholder="Buscar mercados..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md h-10 px-4 rounded-lg border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-shadow"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-reveal-up delay-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95',
              activeCategory === cat
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((market, i) => (
          <MarketCard key={market.id} market={market} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <p className="text-muted-foreground text-sm">Nenhum mercado encontrado</p>
        </div>
      )}
    </div>
  );
}
