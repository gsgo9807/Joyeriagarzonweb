import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Gem, Award, Gift, Truck } from 'lucide-react';
import { CategoryId } from '../types';

interface HeroBannerProps {
  onExplore: () => void;
  onSelectCategory: (cat: CategoryId) => void;
  openStylistAI: () => void;
  categories?: { id: string; name: string; imageUrl: string }[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onSelectCategory,
  openStylistAI,
  categories = [],
}) => {
  const featuredCats = categories.slice(0, 2);
  return (
    <div className="space-y-10">
      
      {/* Hero Visual Section */}
      <div className="relative rounded-3xl overflow-hidden bg-[#EAE7E0] border border-[#D9D5CD] p-8 sm:p-12 lg:p-16 text-[#4A453E] shadow-sm">
        
        {/* Background Decorative Soft Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C5BBAE]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#D9D5CD] text-[#8C8479] text-xs font-sans font-semibold uppercase tracking-[0.2em]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              Joyería Fina Artesanal • Colección 2026
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-[#4A453E] leading-tight">
              Resplandor que <br />
              <span className="italic font-normal text-[#9A8E79]">Trasciende Historias</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6B6459] font-sans font-light max-w-xl leading-relaxed">
              Descubre piezas exclusivas forjadas en Oro macizo 18K, Plata Esterlina 925, Esmeraldas Colombianas y Diamantes certificados. Cada joya lleva la promesa de perfección atemporal.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="https://wa.me/573506471972?text=Hola%20Garzon%20Joyer%C3%ADa%2C%20quisiera%20recibir%20asesor%C3%ADa%20personalizada%20sobre%20sus%20joyas."
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-4 rounded-full bg-white/90 hover:bg-white text-[#4A453E] border border-[#D9D5CD] text-xs font-sans font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                Asesor Personal
              </a>
            </div>
          </div>

          {/* Hero Feature Visual Grid */}
          {featuredCats.length > 0 && (
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {featuredCats.map((category, index) => (
            <div 
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`relative aspect-square rounded-2xl overflow-hidden border border-[#D9D5CD] group cursor-pointer shadow-xs bg-white ${index === 1 ? 'mt-4' : ''}`}
            >
              {category.imageUrl ? (
              <img
                src={category.imageUrl}
                alt={category.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
              />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#4A453E]/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                <span className="font-serif text-sm font-semibold text-white">{category.name}</span>
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#EAE7E0]">Ver categoría →</span>
              </div>
            </div>
            ))}
          </div>
          )}

        </div>
      </div>
    </div>
  );
};
