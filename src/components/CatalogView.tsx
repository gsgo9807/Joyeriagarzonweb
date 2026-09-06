import React from 'react';
import { SlidersHorizontal, Search, RotateCcw, Sparkles } from 'lucide-react';
import { Product, CategoryId, FilterState } from '../types';
import { ProductCard } from './ProductCard';

interface CatalogViewProps {
  products: Product[];
  categories: { id: string; name: string; count: number }[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProduct: (p: Product) => void;
  onQuickAddToCart: (p: Product) => void;
  wishlistIds: string[];
  onToggleWishlist: (p: Product) => void;
  currency: 'COP' | 'USD';
  openStylistAI: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  filters,
  setFilters,
  onSelectProduct,
  onQuickAddToCart,
  wishlistIds,
  onToggleWishlist,
  currency,
  openStylistAI
}) => {
  // Filter products based on state
  const filteredProducts = products.filter((p) => {
    // Search
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(term);
      const matchDesc = p.description.toLowerCase().includes(term);
      const matchMat = p.materials.some(m => m.toLowerCase().includes(term));
      const matchCategory = p.category.toLowerCase().includes(term);
      if (!matchName && !matchDesc && !matchMat && !matchCategory) return false;
    }

    // Category
    if (filters.category !== 'todos' && p.category !== filters.category) {
      return false;
    }

    // Material
    if (filters.material !== 'todos' && !p.materials.includes(filters.material)) {
      return false;
    }

    // Price
    if (p.price < filters.minPrice || p.price > filters.maxPrice) {
      return false;
    }

    // In Stock
    if (filters.inStockOnly && !p.inStock) {
      return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filters.sortBy === 'price-asc') return a.price - b.price;
    if (filters.sortBy === 'price-desc') return b.price - a.price;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const materialsList = ['todos', ...Array.from(new Set(products.flatMap((p) => p.materials)))];

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'todos',
      minPrice: 0,
      maxPrice: 2000000,
      material: 'todos',
      sortBy: 'featured',
      inStockOnly: false
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#4A453E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title & Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E2D9] pb-6">
          <div>
            <span className="text-xs font-sans font-semibold text-[#8C8479] uppercase tracking-[0.2em]">
              Garzon Joyería Fina
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#4A453E] mt-1">
              Catálogo de Joyas Exclusivas
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6459] font-sans font-light mt-1 max-w-xl">
              Explora nuestra refinada selección de collares, anillos, aretes y pulseras forjadas en metales nobles y piedras preciosas.
            </p>
          </div>

          <a
            href="https://wa.me/573506471972?text=Hola%20Garzon%20Joyer%C3%ADa%2C%20quisiera%20recibir%20asesor%C3%ADa%20personalizada%20sobre%20sus%20joyas."
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[#EAE7E0] border border-[#D9D5CD] text-[#4A453E] font-sans font-semibold text-xs flex items-center gap-2 hover:bg-[#4A453E] hover:text-[#F9F7F2] transition-all shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            ¿Dudas sobre qué regalar? Consulta por WhatsApp
          </a>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-[#EAE7E0] border border-[#D9D5CD] rounded-2xl p-4 space-y-4 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-[#8C8479] absolute left-3.5 top-3" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar por nombre, oro, esmeralda, diamantes..."
                className="w-full bg-white border border-[#E6E2D9] rounded-xl pl-10 pr-4 py-2 text-xs text-[#4A453E] placeholder-[#8C8479] focus:outline-none focus:border-[#4A453E] font-sans"
              />
            </div>

            {/* Material selector */}
            <div className="md:col-span-3">
              <select
                value={filters.material}
                onChange={(e) => setFilters({ ...filters, material: e.target.value })}
                className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3 py-2 text-xs text-[#4A453E] font-sans focus:outline-none focus:border-[#4A453E]"
              >
                <option value="todos">Todos los Materiales</option>
                {materialsList.slice(1).map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>

            {/* Sort selector */}
            <div className="md:col-span-3">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
                className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3 py-2 text-xs text-[#4A453E] font-sans focus:outline-none focus:border-[#4A453E]"
              >
                <option value="featured">Destacados &amp; Recomendados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="rating">Mejor Valorados ⭐</option>
                <option value="newest">Más Recientes (Novedades)</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="md:col-span-1 text-right">
              <button
                onClick={handleResetFilters}
                className="p-2 text-[#8C8479] hover:text-[#4A453E] hover:bg-[#D9D5CD] rounded-xl transition-colors"
                title="Restablecer Filtros"
              >
                <RotateCcw className="w-4 h-4 mx-auto" />
              </button>
            </div>

          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-[#8C8479] font-sans px-1">
          <span>
            Mostrando <strong className="text-[#4A453E] font-semibold">{sortedProducts.length}</strong> joyas encontradas
          </span>
          {filters.search && (
            <span>
              Búsqueda: &quot;<strong className="text-[#4A453E]">{filters.search}</strong>&quot;
            </span>
          )}
        </div>

        {/* Product Cards Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E6E2D9] rounded-3xl space-y-3">
            <SlidersHorizontal className="w-10 h-10 text-[#8C8479] mx-auto" />
            <h3 className="font-serif text-lg font-normal text-[#4A453E]">
              {products.length === 0
                ? 'No hay productos en el catálogo'
                : 'No se encontraron joyas con los filtros seleccionados'}
            </h3>
            <p className="text-xs text-[#8C8479] font-sans font-light max-w-sm mx-auto">
              {products.length === 0
                ? 'Cuando existan productos en el backend, aparecerán aquí.'
                : 'Intenta cambiar los términos de búsqueda o restablecer las opciones de filtrado.'}
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#4A453E] text-[#F9F7F2] font-sans font-semibold text-xs hover:bg-[#36322D] transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                onQuickAddToCart={onQuickAddToCart}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                currency={currency}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
