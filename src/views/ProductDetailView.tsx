import React, { useState } from 'react';
import { 
  ArrowLeft, Star, Heart, ShoppingBag, ShieldCheck, Truck, Clock, 
  Sparkles, Check, Gem, RotateCcw, Share2, Award, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react';
import { Product, MetalType, CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onAddToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  onSelectProduct: (p: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (p: Product) => void;
  currency: 'COP' | 'USD';
  onQuickCheckout: (item: Omit<CartItem, 'cartItemId'>) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onBack,
  onAddToCart,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist,
  currency,
  onQuickCheckout
}) => {
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Variant selections
  const [selectedMetal, setSelectedMetal] = useState<MetalType>(
    product.metalTypes[0] || ''
  );
  const [selectedSize, setSelectedSize] = useState<number | undefined>(
    product.sizes ? product.sizes[0] : undefined
  );
  const [selectedLength, setSelectedLength] = useState<string | undefined>(
    product.chainLengths ? product.chainLengths[0] : undefined
  );
  const [customEngraving, setCustomEngraving] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Tab accordion
  const [activeTab, setActiveTab] = useState<'specs' | 'care' | 'shipping' | 'reviews'>('specs');
  const [reviewsList] = useState(product.reviews || []);

  // Related products (same category or material, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.materials.some(m => product.materials.includes(m))))
    .slice(0, 4);

  const handleAddToCart = () => {
    onAddToCart({
      product,
      quantity,
      selectedMetal,
      selectedSize,
      selectedLength,
      customEngraving: customEngraving.trim() || undefined
    });
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  const handleBuyNow = () => {
    onQuickCheckout({
      product,
      quantity,
      selectedMetal,
      selectedSize,
      selectedLength,
      customEngraving: customEngraving.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#4A453E] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E6E2D9]">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[#6B6459] hover:text-[#4A453E] font-sans font-medium text-xs uppercase tracking-wider transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al catálogo
          </button>

          <div className="flex items-center gap-3 text-xs font-sans text-[#8C8479]">
            <span>SKU: <strong className="text-[#4A453E] font-mono">{product.sku}</strong></span>
            <span>•</span>
            <span className="capitalize">{product.category}</span>
          </div>
        </div>

        {/* Main Product Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          
          {/* Left: Gallery Column (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Main Stage Image */}
            <div className="relative aspect-square bg-[#EAE7E0] border border-[#D9D5CD] rounded-3xl overflow-hidden shadow-2xs group">
              {product.images[activeImageIndex] || product.images[0] ? (
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 cursor-zoom-in opacity-95"
              />
              ) : null}

              {/* Wishlist Floating Button */}
              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all z-10 ${
                  isWishlisted
                    ? 'bg-[#4A453E] text-white shadow-md'
                    : 'bg-white/80 text-[#6B6459] hover:text-[#4A453E] hover:bg-white border border-[#E6E2D9]'
                }`}
                title="Favoritos"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isNew && (
                  <span className="bg-[#4A453E] text-[#F9F7F2] font-sans font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-widest shadow-2xs">
                    Nueva Colección
                  </span>
                )}
                {product.specs.certificate && (
                  <span className="bg-white/90 border border-[#D9D5CD] text-[#6B6459] font-sans font-medium text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Certificado de Autenticidad
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-[#4A453E] ring-2 ring-[#4A453E]/20 scale-105'
                      : 'border-[#E6E2D9] hover:border-[#D9D5CD] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Value Guarantees row */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="bg-white border border-[#E6E2D9] p-3 rounded-2xl text-center shadow-2xs">
                <Truck className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <span className="block text-xs font-sans font-semibold text-[#4A453E]">Envío Asegurado</span>
                <span className="block text-[10px] font-sans text-[#8C8479]">A todo el país</span>
              </div>
              <div className="bg-white border border-[#E6E2D9] p-3 rounded-2xl text-center shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <span className="block text-xs font-sans font-semibold text-[#4A453E]">Garantía Real</span>
                <span className="block text-[10px] font-sans text-[#8C8479]">Oro Ley 750 / Plata 925</span>
              </div>
              <div className="bg-white border border-[#E6E2D9] p-3 rounded-2xl text-center shadow-2xs">
                <RotateCcw className="w-5 h-5 text-[#D4AF37] mx-auto mb-1" />
                <span className="block text-xs font-sans font-semibold text-[#4A453E]">30 Días Devolución</span>
                <span className="block text-[10px] font-sans text-[#8C8479]">Sin complicaciones</span>
              </div>
            </div>

          </div>

          {/* Right: Product Buy Info Column (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Title & Ratings */}
            <div>
              {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-[#D4AF37] text-[#D4AF37]'
                          : 'text-[#E6E2D9]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-sans font-semibold text-[#4A453E]">{product.rating}</span>
                <span className="text-xs font-sans text-[#8C8479]">({reviewsList.length} valoraciones)</span>
              </div>
              )}

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#4A453E] leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Box & Installments */}
            <div className="bg-[#EAE7E0] border border-[#D9D5CD] p-4 rounded-2xl">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-sans font-light text-[#4A453E] tracking-tight">
                  {formatCurrency(product.price, currency)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base text-[#8C8479] line-through font-light">
                    {formatCurrency(product.originalPrice, currency)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B6459] font-sans mt-1 font-light flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Hasta 3 cuotas sin interés con Addi o Tarjeta de Crédito
              </p>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-[#6B6459] font-sans font-light leading-relaxed">
              {product.longDescription}
            </p>

            {/* Variant Selector: Metal Type */}
            {product.metalTypes.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-sans font-semibold text-[#8C8479] uppercase tracking-wider">
                  Material / Metal: <strong className="text-[#4A453E]">{selectedMetal}</strong>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {product.metalTypes.map((metal) => (
                    <button
                      key={metal}
                      type="button"
                      onClick={() => setSelectedMetal(metal)}
                      className={`px-3.5 py-2.5 rounded-xl text-xs font-sans font-medium border text-left flex items-center justify-between transition-all ${
                        selectedMetal === metal
                          ? 'bg-[#4A453E] border-[#4A453E] text-[#F9F7F2] shadow-xs'
                          : 'bg-white border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                      }`}
                    >
                      <span>{metal}</span>
                      {selectedMetal === metal && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selector: Size or Length */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-sans">
                  <span className="font-semibold text-[#8C8479] uppercase tracking-wider">Talla de Anillo:</span>
                  <a href="#guia-tallas" className="text-[#8C8479] hover:text-[#4A453E] underline">¿Cómo saber mi talla?</a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-xl text-xs font-sans font-medium border flex items-center justify-center transition-all ${
                        selectedSize === size
                          ? 'bg-[#4A453E] text-[#F9F7F2] border-[#4A453E] font-bold shadow-xs'
                          : 'bg-white border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.chainLengths && product.chainLengths.length > 0 && (
              <div className="space-y-2">
                <span className="block text-xs font-sans font-semibold text-[#8C8479] uppercase tracking-wider">
                  Largo de Cadena:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.chainLengths.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSelectedLength(len)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-sans font-medium border transition-all ${
                        selectedLength === len
                          ? 'bg-[#4A453E] text-[#F9F7F2] border-[#4A453E] font-bold shadow-xs'
                          : 'bg-white border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Engraving Option */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-sans font-medium text-[#4A453E]">
                Grabado Personalizado (Opcional - Gratis):
              </label>
              <input
                type="text"
                value={customEngraving}
                onChange={(e) => setCustomEngraving(e.target.value)}
                placeholder="Ej: A & M 20/08/2026 o Te Amo"
                maxLength={25}
                className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#4A453E] placeholder-[#8C8479] focus:outline-none focus:border-[#4A453E] font-sans"
              />
              <span className="text-[10px] font-sans text-[#8C8479]">Hasta 25 caracteres para la cara interna o posterior</span>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-[#E6E2D9] rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-[#4A453E] hover:text-black font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-sans font-bold text-[#4A453E]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-[#4A453E] hover:text-black font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-full font-sans font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
                    addedSuccess
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      ¡Agregado al Carrito!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 stroke-[2]" />
                      Agregar al Carrito
                    </>
                  )}
                </button>
              </div>

              {/* Express Buy Button */}
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-full font-sans font-semibold text-xs uppercase tracking-wider border border-[#D9D5CD] bg-white text-[#4A453E] hover:bg-[#EAE7E0] transition-colors flex items-center justify-center gap-2 shadow-2xs"
              >
                Comprar Ahora en 1 Clic
              </button>
            </div>

          </div>

        </div>

        {/* Technical Specs & Reviews Accordion Section */}
        <div className="bg-white border border-[#E6E2D9] rounded-3xl p-6 sm:p-8 mb-16 shadow-2xs">
          <div className="flex border-b border-[#E6E2D9] overflow-x-auto gap-6 mb-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 text-xs uppercase tracking-wider font-sans font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'specs'
                  ? 'border-[#4A453E] text-[#4A453E]'
                  : 'border-transparent text-[#8C8479] hover:text-[#4A453E]'
              }`}
            >
              Especificaciones Técnicas
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 text-xs uppercase tracking-wider font-sans font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'care'
                  ? 'border-[#4A453E] text-[#4A453E]'
                  : 'border-transparent text-[#8C8479] hover:text-[#4A453E]'
              }`}
            >
              Cuidado y Mantenimiento
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs uppercase tracking-wider font-sans font-semibold whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-[#4A453E] text-[#4A453E]'
                  : 'border-transparent text-[#8C8479] hover:text-[#4A453E]'
              }`}
            >
              Reseñas de Clientes ({reviewsList.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                <span className="text-[#8C8479] block mb-1">SKU</span>
                <span className="text-[#4A453E] font-semibold text-sm">{product.sku || '—'}</span>
              </div>
              <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                <span className="text-[#8C8479] block mb-1">Stock</span>
                <span className="text-[#4A453E] font-semibold text-sm">{product.stockCount}</span>
              </div>
              {product.specs.metal && (
                <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                  <span className="text-[#8C8479] block mb-1">Metal Principal</span>
                  <span className="text-[#4A453E] font-semibold text-sm">{product.specs.metal}</span>
                </div>
              )}
              {product.specs.karatOrPurity && (
                <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                  <span className="text-[#8C8479] block mb-1">Pureza / Quilataje</span>
                  <span className="text-[#4A453E] font-semibold text-sm">{product.specs.karatOrPurity}</span>
                </div>
              )}
              {product.specs.weightGrams && (
                <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                  <span className="text-[#8C8479] block mb-1">Peso Aproximado</span>
                  <span className="text-[#4A453E] font-semibold text-sm">{product.specs.weightGrams} gramos</span>
                </div>
              )}
              {product.specs.gemstone && (
                <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                  <span className="text-[#8C8479] block mb-1">Gema / Piedra Preciosa</span>
                  <span className="text-[#4A453E] font-semibold text-sm">{product.specs.gemstone}</span>
                </div>
              )}
              {product.specs.dimensions && (
                <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                  <span className="text-[#8C8479] block mb-1">Dimensiones</span>
                  <span className="text-[#4A453E] font-semibold text-sm">{product.specs.dimensions}</span>
                </div>
              )}
              {product.specs.warranty && (
              <div className="p-4 bg-[#F9F7F2] rounded-xl border border-[#E6E2D9]">
                <span className="text-[#8C8479] block mb-1">Garantía</span>
                <span className="text-[#4A453E] font-semibold text-sm">{product.specs.warranty}</span>
              </div>
              )}
            </div>
          )}

          {activeTab === 'care' && (
            <div className="space-y-3 text-xs text-[#6B6459] font-sans leading-relaxed font-light">
              <p>• Evita el contacto directo con perfumes, lociones, laca para cabello y productos químicos corrosivos.</p>
              <p>• Guarda cada joya de forma individual en su estuche o saco de terciopelo para evitar rayones.</p>
              <p>• Para limpiar piezas de Oro 18K y Plata 925, usa un paño suave de microfibra humedecido con agua tibia y jabón neutro.</p>
              <p>• Ofrecemos servicio de mantenimiento y pulido gratis 1 vez al año en cualquiera de nuestros talleres autorizados.</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviewsList.length === 0 && (
                <p className="text-xs text-[#8C8479] font-sans">No hay reseñas para este producto.</p>
              )}
              <div className="space-y-4">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 bg-[#F9F7F2] rounded-2xl border border-[#E6E2D9]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[#4A453E] font-sans">{rev.user}</span>
                      <span className="text-[10px] text-[#8C8479] font-sans">{rev.date}</span>
                    </div>
                    <div className="flex items-center text-[#D4AF37] text-xs mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-[#E6E2D9]'}`} />
                      ))}
                      {rev.verifiedPurchase && (
                        <span className="ml-2 text-[10px] text-[#4A453E] bg-[#EAE7E0] px-2 py-0.5 rounded-full font-sans">
                          Compra Verificada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6459] font-sans font-light">{rev.comment}</p>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* "Ver más productos" Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-8 border-t border-[#E6E2D9]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#4A453E]">
                  Ver Más Productos
                </h2>
                <p className="text-xs text-[#6B6459] font-sans font-light mt-1">
                  Joyas complementarias y piezas recomendadas para completar tu estilo
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  onSelectProduct={onSelectProduct}
                  onQuickAddToCart={(p) => onAddToCart({ product: p, quantity: 1, selectedMetal: p.metalTypes[0] || '' })}
                  isWishlisted={isWishlisted}
                  onToggleWishlist={onToggleWishlist}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
