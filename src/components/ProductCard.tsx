import React from 'react';
import { Heart, Star, ShoppingBag, Eye, Check } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (p: Product) => void;
  onQuickAddToCart: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  currency: 'COP' | 'USD';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onQuickAddToCart,
  isWishlisted,
  onToggleWishlist,
  currency
}) => {
  return (
    <div className="group bg-white border border-[#E6E2D9] hover:border-[#D4AF37] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col h-full relative">
      
      {/* Top Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F9F7F2] cursor-pointer" onClick={() => onSelectProduct(product)}>
        
        {/* Main Product Image */}
        {product.images[0] ? (
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95"
        />
        ) : (
          <div className="w-full h-full bg-[#EAE7E0]" />
        )}

        {/* Optional Secondary Image on Hover */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={`${product.name} detalle`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-[#4A453E] text-[#F9F7F2] text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
              Novedad
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="bg-[#8C8479] text-white text-[9px] font-sans font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
              Oferta
            </span>
          )}
          {product.materials[0] && (
          <span className="bg-white/90 backdrop-blur-md border border-[#E6E2D9] text-[#6B6459] text-[10px] font-sans font-medium px-2 py-0.5 rounded-full shadow-2xs">
            {product.materials[0]}
          </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isWishlisted
              ? 'bg-[#4A453E] text-white shadow-md scale-105'
              : 'bg-white/80 text-[#6B6459] hover:text-[#4A453E] hover:bg-white border border-[#E6E2D9]'
          }`}
          title={isWishlisted ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
        </button>

        {/* Quick View Floating Action Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-[#4A453E] text-xs font-sans font-semibold py-2 px-3 rounded-full border border-[#D9D5CD] backdrop-blur-md flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            Ver producto
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* SKU & Category */}
          <div className="flex items-center justify-between text-[11px] font-sans text-[#8C8479] mb-1">
            <span className="font-mono">{product.sku}</span>
            {product.reviewCount > 0 && (
            <span className="flex items-center gap-1 text-[#4A453E] font-medium">
              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              {product.rating} ({product.reviewCount})
            </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelectProduct(product)}
            className="font-serif text-base font-normal text-[#4A453E] hover:text-[#9A8E79] cursor-pointer line-clamp-2 mb-1.5 transition-colors"
          >
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-[#8C8479] font-sans line-clamp-2 font-light leading-relaxed mb-3">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#F0EEE9] flex items-center justify-between mt-auto">
          <div>
            <div className="text-base font-sans font-light text-[#4A453E] tracking-tight">
              {formatCurrency(product.price, currency)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-[#8C8479] line-through font-light">
                {formatCurrency(product.originalPrice, currency)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickAddToCart(product)}
              className="p-2.5 rounded-full bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-semibold transition-all shadow-2xs active:scale-95"
              title="Agregar rápido al carrito"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
