import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, ShieldCheck, Heart, ShoppingBag, 
  Phone, Mail, MapPin, Award, CheckCircle2, ChevronRight, Truck, Gift
} from 'lucide-react';

import { Product, CartItem, FilterState } from './types';
import { PROMO_CODES } from './data/products';
import { login as apiLogin, logout as apiLogout, testAuth } from './api/auth';
import { getStoredToken } from './api/client';
import { useCatalog } from './hooks/useCatalog';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailView } from './views/ProductDetailView';
import { CatalogView } from './components/CatalogView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { JewelryStylistAI } from './components/JewelryStylistAI';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { formatCurrency } from './utils/formatters';

export default function App() {
  const {
    products: productsList,
    setProducts: setProductsList,
    categories: storeCategories,
    loading: catalogLoading,
    error: catalogError,
    reload: loadCatalog,
  } = useCatalog(false);

  // Admin & Login state
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => Boolean(getStoredToken()));
  const [viewingAdminPanel, setViewingAdminPanel] = useState(false);

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'home' | 'catalog'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cart & Wishlist local persistence state
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal & Drawer toggles
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [stylistOpen, setStylistOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);

  // Currency & Promo state
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  // Filter state for catalog
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'todos',
    minPrice: 0,
    maxPrice: 2000000,
    material: 'todos',
    sortBy: 'featured',
    inStockOnly: false
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('aura_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    void testAuth().then((ok) => setIsAdminLoggedIn(ok));
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart Handlers
  const handleAddToCart = (newItem: Omit<CartItem, 'cartItemId'>) => {
    const cartItemId = `${newItem.product.id}-${newItem.selectedMetal}-${newItem.selectedSize || ''}-${newItem.selectedLength || ''}-${newItem.customEngraving || ''}`;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, cartItemId }];
    });

    showToast(`" ${newItem.product.name}" agregada al carrito`);
  };

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: newQty } : i))
    );
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Eliminada de favoritos: ${product.name}`);
        return prev.filter((id) => id !== product.id);
      }
      showToast(`Guardada en favoritos: ${product.name}`);
      return [...prev, product.id];
    });
  };

  // Promo Code Handler
  const handleApplyPromo = (code: string): boolean => {
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      showToast(`¡Cupón ${code} aplicado exitosamente!`);
      return true;
    }
    return false;
  };

  // Quick express checkout from product detail
  const handleQuickCheckout = (item: Omit<CartItem, 'cartItemId'>) => {
    handleAddToCart(item);
    setSelectedProduct(null);
    setCheckoutOpen(true);
  };

  // Calculate discount amount for checkout
  const cartSubtotal = cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const discountAmount = appliedPromo && PROMO_CODES[appliedPromo]
    ? Math.round((cartSubtotal * PROMO_CODES[appliedPromo].discountPercent) / 100)
    : 0;

  // If viewing admin panel, show AdminPanel view
  if (viewingAdminPanel && isAdminLoggedIn) {
    return (
      <AdminPanel
        products={productsList}
        setProducts={setProductsList}
        categories={storeCategories}
        onRefreshCatalog={() => loadCatalog(true)}
        onLogout={() => {
          apiLogout();
          setIsAdminLoggedIn(false);
          setViewingAdminPanel(false);
          showToast('Sesión de administrador cerrada');
          void loadCatalog(false);
        }}
        onExit={() => {
          setViewingAdminPanel(false);
          void loadCatalog(false);
        }}
        currency={currency}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#4A453E] font-sans flex flex-col">
      
      {/* Toast Notification Floating Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#4A453E] text-[#F9F7F2] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab as 'home' | 'catalog');
          setSelectedProduct(null);
          setViewingAdminPanel(false);
          if (tab === 'home') {
            setFilters((prev) => ({ ...prev, category: 'todos', search: '' }));
          }
        }}
        selectedCategory={filters.category}
        setSelectedCategory={(cat) => {
          setFilters((prev) => ({ ...prev, category: cat }));
          setSelectedProduct(null);
        }}
        navCategories={storeCategories}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        cartTotal={cartSubtotal}
        openCart={() => setCartOpen(true)}
        wishlistCount={wishlistIds.length}
        openWishlist={() => setWishlistModalOpen(true)}
        openStylistAI={() => setStylistOpen(true)}
        searchTerm={filters.search}
        setSearchTerm={(term) => {
          setFilters((prev) => ({ ...prev, search: term }));
          if (term) {
            setActiveTab('catalog');
            setSelectedProduct(null);
          }
        }}
        currency={currency}
        setCurrency={setCurrency}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenLogin={() => setAdminLoginOpen(true)}
        onOpenAdminPanel={() => {
          setViewingAdminPanel(true);
          void loadCatalog(true);
        }}
      />

      {/* Main Body View Switching */}
      <main className="flex-1">
        {catalogLoading && (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-sm text-[#8C8479]">
            Cargando catálogo desde Garzon Joyería...
          </div>
        )}
        {catalogError && !catalogLoading && (
          <div className="max-w-7xl mx-auto px-4 py-8 text-center">
            <p className="text-sm text-rose-700 mb-3">{catalogError}</p>
            <button
              onClick={() => void loadCatalog(false)}
              className="px-5 py-2 rounded-full bg-[#4A453E] text-[#F9F7F2] text-xs font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}
        {selectedProduct ? (
          /* PRODUCT DETAIL VIEW (When a product is selected) */
          <ProductDetailView
            product={selectedProduct}
            allProducts={productsList}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => setSelectedProduct(p)}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            onToggleWishlist={handleToggleWishlist}
            currency={currency}
            onQuickCheckout={handleQuickCheckout}
          />
        ) : activeTab === 'catalog' ? (
          /* CATALOG EXPLORER VIEW */
          <CatalogView
            products={productsList}
            categories={[{ id: 'todos', name: 'Todas las Joyas', count: productsList.length }, ...storeCategories]}
            filters={filters}
            setFilters={setFilters}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onQuickAddToCart={(p) => handleAddToCart({ product: p, quantity: 1, selectedMetal: p.metalTypes[0] || '' })}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            currency={currency}
            openStylistAI={() => setStylistOpen(true)}
          />
        ) : (
          /* HOME LANDING VIEW */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
            
            {/* Hero Banner Component */}
            <HeroBanner
              onExplore={() => setActiveTab('catalog')}
              onSelectCategory={(cat) => {
                setFilters((prev) => ({ ...prev, category: cat }));
                setActiveTab('catalog');
              }}
              openStylistAI={() => setStylistOpen(true)}
              categories={storeCategories}
            />

            {/* Featured Jewelry Section */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E6E2D9] pb-4">
                <div>
                  <span className="text-xs font-semibold text-[#8C8479] uppercase tracking-widest">
                    Piezas de Autor
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A453E] mt-0.5">
                    Productos Destacados
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B6459] hover:text-[#4A453E] transition-colors group"
                >
                  Ver Catálogo Completo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsList.filter((p) => p.isFeatured).length === 0 ? (
                  <p className="col-span-full text-sm text-[#8C8479] text-center py-8">No hay productos destacados.</p>
                ) : productsList.filter((p) => p.isFeatured).slice(0, 8).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onQuickAddToCart={(p) => handleAddToCart({ product: p, quantity: 1, selectedMetal: p.metalTypes[0] || '' })}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    currency={currency}
                  />
                ))}
              </div>
            </section>


            {/* New Arrivals Section */}
            <section className="space-y-6">
              <div className="border-b border-[#E6E2D9] pb-4">
                <span className="text-xs font-semibold text-[#8C8479] uppercase tracking-widest">
                  Ediciones Limitadas
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A453E] mt-0.5">
                  Novedades en Oro 18K &amp; Gemas
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsList.filter((p) => p.isNew).length === 0 ? (
                  <p className="col-span-full text-sm text-[#8C8479] text-center py-8">No hay novedades por ahora.</p>
                ) : productsList.filter((p) => p.isNew).slice(0, 3).map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onQuickAddToCart={(p) => handleAddToCart({ product: p, quantity: 1, selectedMetal: p.metalTypes[0] || '' })}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    currency={currency}
                  />
                ))}
              </div>
            </section>

          </div>
        )}
      </main>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        appliedPromo={appliedPromo}
        onApplyPromo={handleApplyPromo}
        currency={currency}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        onClearCart={() => setCartItems([])}
        currency={currency}
        discountAmount={discountAmount}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={async (username, password) => {
          await apiLogin(username, password);
          setIsAdminLoggedIn(true);
          setViewingAdminPanel(true);
          showToast('¡Bienvenido al Panel de Administración!');
          void loadCatalog(true);
        }}
      />

      {/* AI Stylist Modal */}
      <JewelryStylistAI
        isOpen={stylistOpen}
        onClose={() => setStylistOpen(false)}
        products={productsList}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setStylistOpen(false);
        }}
        currency={currency}
      />

      {/* Wishlist Quick Modal */}
      {wishlistModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#F9F7F2] border border-[#E6E2D9] text-[#4A453E] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D9]">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                <h3 className="font-serif text-lg font-bold text-[#4A453E]">
                  Tus Joyas Favoritas ({wishlistIds.length})
                </h3>
              </div>
              <button onClick={() => setWishlistModalOpen(false)} className="text-[#8C8479] hover:text-[#4A453E]">
                ✕
              </button>
            </div>

            {wishlistIds.length === 0 ? (
              <p className="text-xs text-[#8C8479] text-center py-8">
                No has guardado joyas en favoritos todavía. Haz clic en el corazón de cualquier joya para guardarla.
              </p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {productsList.filter(p => wishlistIds.includes(p.id)).map(p => (
                  <div key={p.id} className="p-3 bg-white border border-[#E6E2D9] rounded-xl flex items-center justify-between gap-3">
                    <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-serif font-semibold text-[#4A453E] truncate">{p.name}</h4>
                      <span className="text-[#4A453E] font-bold">{formatCurrency(p.price, currency)}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setWishlistModalOpen(false);
                      }}
                      className="px-3 py-1.5 bg-[#4A453E] text-[#F9F7F2] font-semibold text-xs rounded-lg hover:bg-[#36322D] transition-colors"
                    >
                      Ver producto
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Luxury Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 text-xs mt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-serif font-bold">
                G
              </div>
              <span className="font-serif text-lg text-amber-100 font-bold tracking-widest">
                GARZON JOYERÍA
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed font-light">
              Casa de alta joyería fina. Piezas artesanales concebidas con metales nobles de ley 750 (18K), plata esterlina 925 y gemas preciosas seleccionadas.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider">
              Colecciones
            </h4>
            <ul className="space-y-1.5 text-stone-300">
              {storeCategories.slice(0, 4).map((category) => (
                <li key={category.apiId}>
                  <button onClick={() => { setFilters(f => ({ ...f, category: category.slug })); setActiveTab('catalog'); setSelectedProduct(null); }} className="hover:text-amber-300 transition-colors">
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider">
              Atención al Cliente
            </h4>
            <div className="space-y-2 text-stone-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>+57 (601) 320 8900 / WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>contacto@garzonjoyeria.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Atelier: Zona Rosa, Bogotá D.C., Colombia</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold text-amber-200 uppercase tracking-wider">
              Garantía &amp; Seguridad
            </h4>
            <p className="text-stone-400 leading-relaxed font-light">
              Todas nuestras piezas incluyen Certificado Gemológico numerado de Autenticidad y estuche de regalo.
            </p>
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Garantía de Por Vida en Oro 18K
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-stone-500 text-[11px]">
          <p>© 2026 Garzon Joyería Fina. Todos los derechos reservados.</p>
          <p className="mt-2 sm:mt-0">Diseño y desarrollo de alta precisión para comercio de lujo.</p>
        </div>
      </footer>

    </div>
  );
}
