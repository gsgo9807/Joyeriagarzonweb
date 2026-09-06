import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, Sparkles, Gem, Menu, X, ShieldCheck, Truck, User, Lock } from 'lucide-react';
import { CategoryId } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCategory: CategoryId;
  setSelectedCategory: (cat: CategoryId) => void;
  navCategories?: { id: string; name: string }[];
  cartCount: number;
  cartTotal: number;
  openCart: () => void;
  wishlistCount: number;
  openWishlist: () => void;
  openStylistAI: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currency: 'COP' | 'USD';
  setCurrency: (c: 'COP' | 'USD') => void;
  isAdminLoggedIn?: boolean;
  onOpenLogin?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCategory,
  setSelectedCategory,
  cartCount,
  cartTotal,
  openCart,
  wishlistCount,
  openWishlist,
  openStylistAI,
  searchTerm,
  setSearchTerm,
  currency,
  setCurrency,
  isAdminLoggedIn = false,
  onOpenLogin,
  onOpenAdminPanel,
  navCategories = [],
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const categories = [
    { id: 'todos', label: 'Catálogo Completo' },
    ...navCategories.map((cat) => ({ id: cat.id, label: cat.name })),
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2] text-[#4A453E] border-b border-[#E6E2D9] shadow-xs">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Mobile Menu Trigger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#4A453E] hover:bg-[#EAE7E0] focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none text-center lg:text-left">
            <button 
              onClick={() => { setActiveTab('home'); }}
              className="inline-flex items-center gap-2.5 group text-left"
            >
              <div className="w-9 h-9 rounded-full bg-[#4A453E] text-[#F9F7F2] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-300">
                <Gem className="w-4 h-4 text-[#D4AF37] stroke-[2.2]" />
              </div>
              <div>
                <span className="block font-serif text-2xl tracking-[0.15em] text-[#4A453E] font-medium group-hover:text-[#8C8479] transition-colors">
                  GARZON
                </span>
                <span className="block text-[9px] tracking-[0.25em] text-[#8C8479] uppercase font-sans font-semibold -mt-1">
                  Joyería Fina
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <button
              onClick={() => { setActiveTab('home'); }}
              className={`px-3.5 py-2 text-xs uppercase tracking-widest font-sans font-medium rounded-full transition-colors ${
                activeTab === 'home' 
                  ? 'text-[#4A453E] bg-[#EAE7E0] font-semibold' 
                  : 'text-[#6B6459] hover:text-[#4A453E] hover:bg-[#F0EEE9]'
              }`}
            >
              Inicio
            </button>
            <button
              onClick={() => { setSelectedCategory('todos'); setActiveTab('catalog'); }}
              className={`px-3.5 py-2 text-xs uppercase tracking-widest font-sans font-medium rounded-full transition-colors ${
                activeTab === 'catalog' && selectedCategory === 'todos'
                  ? 'text-[#4A453E] bg-[#EAE7E0] font-semibold' 
                  : 'text-[#6B6459] hover:text-[#4A453E] hover:bg-[#F0EEE9]'
              }`}
            >
              Catálogo Completo
            </button>

            {/* Quick Category dropdown */}
            <div className="relative group">
              <button className="px-3.5 py-2 text-xs uppercase tracking-widest font-sans font-medium text-[#6B6459] hover:text-[#4A453E] hover:bg-[#F0EEE9] rounded-full inline-flex items-center gap-1">
                Colecciones
              </button>
              <div className="absolute left-0 w-56 rounded-2xl bg-[#F9F7F2] border border-[#E6E2D9] shadow-lg py-2 hidden group-hover:block z-50">
                {categories.slice(1).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id as CategoryId);
                      setActiveTab('catalog');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-sans text-[#6B6459] hover:text-[#4A453E] hover:bg-[#EAE7E0] transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Search Input toggle */}
            <div className="relative">
              {searchBarOpen ? (
                <div className="flex items-center bg-white border border-[#D9D5CD] rounded-full px-3 py-1 text-sm shadow-xs">
                  <Search className="w-4 h-4 text-[#8C8479] mr-2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar joyas..."
                    className="bg-transparent text-[#4A453E] placeholder-[#8C8479] focus:outline-none w-32 sm:w-48 text-xs font-sans"
                    autoFocus
                  />
                  <button 
                    onClick={() => { setSearchBarOpen(false); setSearchTerm(''); }}
                    className="text-[#8C8479] hover:text-[#4A453E] ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setSearchBarOpen(true); setActiveTab('catalog'); }}
                  className="p-2 text-[#4A453E] hover:bg-[#EAE7E0] rounded-full transition-colors"
                  title="Buscar joyas"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Currency selector */}
            <button
              onClick={() => setCurrency(currency === 'COP' ? 'USD' : 'COP')}
              className="text-xs font-sans font-semibold px-2.5 py-1 bg-[#EAE7E0] text-[#4A453E] hover:bg-[#D9D5CD] rounded-full border border-[#D9D5CD] transition-colors"
              title="Cambiar Moneda"
            >
              {currency}
            </button>

            {/* Login / Admin Button */}
            {isAdminLoggedIn ? (
              <button
                onClick={onOpenAdminPanel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4A453E] text-[#F9F7F2] hover:bg-[#36322D] text-xs font-semibold font-sans transition-all border border-[#D4AF37]/50 shadow-xs"
                title="Panel de Administración"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden md:inline">Panel Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#EAE7E0] text-[#4A453E] border border-[#D9D5CD] text-xs font-semibold font-sans transition-colors shadow-2xs"
                title="Iniciar sesión de Administrador"
              >
                <User className="w-3.5 h-3.5 text-[#8C8479]" />
                <span className="hidden sm:inline">Iniciar sesión</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={openWishlist}
              className="p-2 text-[#4A453E] hover:text-rose-600 hover:bg-[#EAE7E0] rounded-full transition-colors relative"
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4A453E] text-white text-[10px] font-sans font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-sans font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full shadow-xs transition-all group"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 text-[#F9F7F2]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-[#D4AF37] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block">
                Carrito
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#F9F7F2] border-t border-[#E6E2D9] px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs uppercase tracking-widest font-sans font-semibold text-[#4A453E] hover:bg-[#EAE7E0] rounded-lg"
          >
            Inicio
          </button>
          <button
            onClick={() => { setSelectedCategory('todos'); setActiveTab('catalog'); setMobileMenuOpen(false); }}
            className="block w-full text-left px-3 py-2 text-xs uppercase tracking-widest font-sans font-semibold text-[#4A453E] hover:bg-[#EAE7E0] rounded-lg"
          >
            Catálogo Completo
          </button>
          <div className="pt-2 border-t border-[#E6E2D9]">
            <span className="block px-3 py-1 text-[10px] font-semibold text-[#8C8479] uppercase tracking-widest font-sans">
              Categorías
            </span>
            {categories.slice(1).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id as CategoryId);
                  setActiveTab('catalog');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-xs text-[#6B6459] hover:text-[#4A453E] hover:bg-[#EAE7E0] rounded-lg"
              >
                {cat.label}
              </button>
            ))}
          </div>
          {isAdminLoggedIn ? (
            <button
              onClick={() => { if (onOpenAdminPanel) onOpenAdminPanel(); setMobileMenuOpen(false); }}
              className="w-full mt-2 px-4 py-2.5 rounded-full bg-[#4A453E] text-[#F9F7F2] font-sans font-semibold text-xs flex items-center justify-center gap-2 shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              Abrir Panel de Administrador
            </button>
          ) : (
            <button
              onClick={() => { if (onOpenLogin) onOpenLogin(); setMobileMenuOpen(false); }}
              className="w-full mt-2 px-4 py-2.5 rounded-full bg-white border border-[#D9D5CD] text-[#4A453E] font-sans font-semibold text-xs flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-[#8C8479]" />
              Iniciar Sesión (Administrador)
            </button>
          )}
          <a
            href="https://wa.me/573506471972?text=Hola%20Garzon%20Joyer%C3%ADa%2C%20quisiera%20recibir%20asesor%C3%ADa%20personalizada%20sobre%20sus%20joyas."
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full mt-1 px-4 py-2.5 rounded-full bg-[#EAE7E0] border border-[#D9D5CD] text-[#4A453E] font-sans font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            Consultar con Asesor Personal por WhatsApp
          </a>
        </div>
      )}
    </header>
  );
};
