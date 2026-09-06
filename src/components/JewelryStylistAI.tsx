import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, Gem } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface JewelryStylistAIProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
  currency: 'COP' | 'USD';
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  recommendedProducts?: Product[];
}

export const JewelryStylistAI: React.FC<JewelryStylistAIProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  currency
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: '¡Hola! Soy tu Asesor Personal de Joyería Garzon. ¿Buscas un regalo especial, una joya de compromiso o ayuda para combinar con un vestido específico? Cuéntame lo que tienes en mente.',
      recommendedProducts: products.filter(p => p.isFeatured).slice(0, 2)
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Anillo de compromiso con diamante de menos de $1.000.000',
    'Regalo de aniversario en oro 18K',
    '¿Qué joya combina con un vestido verde esmeralda?',
    'Cadena de plata para llevar a diario'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Call backend AI API endpoint
      const response = await fetch('/api/ai-stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, products })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Find matching products from IDs returned or client fallback
        const recProducts = data.productIds
          ? products.filter(p => data.productIds.includes(p.id))
          : products.filter(p => query.toLowerCase().includes(p.category) || (p.materials || []).some(m => query.toLowerCase().includes(m.toLowerCase()))).slice(0, 2);

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.text || 'Basado en tus preferencias, aquí tienes mis mejores recomendaciones:',
          recommendedProducts: recProducts.length > 0 ? recProducts : products.filter(p => p.isFeatured).slice(0, 2)
        };

        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error('Fallback to local assistant');
      }
    } catch {
      // Local smart matching fallback
      const qLower = query.toLowerCase();
      let matched = products.filter((p) => {
        return (
          qLower.includes(p.category) ||
          (p.materials || []).some((m) => qLower.includes(m.toLowerCase())) ||
          (qLower.includes('oro') && (p.materials || []).some(m => m.includes('Oro'))) ||
          (qLower.includes('plata') && (p.materials || []).some(m => m.includes('Plata'))) ||
          (qLower.includes('compromiso') && p.category === 'anillos') ||
          (qLower.includes('regalo') && p.isFeatured)
        );
      });

      if (matched.length === 0) {
        matched = products.filter(p => p.isFeatured).slice(0, 3);
      } else {
        matched = matched.slice(0, 3);
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Excelente elección. Para ${query}, te sugiero joyas en metales nobles como ${matched[0]?.materials[0] || 'Oro 18K'}, diseñadas para resaltar con elegancia y elegancia:`,
        recommendedProducts: matched
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F9F7F2] border border-[#E6E2D9] text-[#4A453E] rounded-3xl max-w-xl w-full h-[600px] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E6E2D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAE7E0] text-[#4A453E] border border-[#D9D5CD] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-base font-normal text-[#4A453E]">Asesor Personal de Joyas</h3>
              <p className="text-[11px] text-[#8C8479] font-light">Asistente experto en estilo &amp; gemas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8C8479] hover:text-[#4A453E] hover:bg-[#EAE7E0] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompts bar */}
        <div className="p-3 bg-[#EAE7E0] border-b border-[#D9D5CD] flex gap-2 overflow-x-auto text-[11px]">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F9F7F2] text-[#6B6459] hover:text-[#4A453E] whitespace-nowrap border border-[#E6E2D9] transition-colors flex items-center gap-1.5"
            >
              <Gem className="w-3 h-3 text-[#D4AF37]" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-[#EAE7E0] border border-[#D9D5CD] text-[#4A453E] flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-[#D4AF37]" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-3 ${
                msg.sender === 'user' 
                  ? 'bg-[#4A453E] text-[#F9F7F2] font-medium p-3.5 rounded-2xl rounded-tr-none text-xs shadow-xs'
                  : 'bg-white border border-[#E6E2D9] p-4 rounded-2xl rounded-tl-none text-xs text-[#4A453E] shadow-2xs'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Recommended Products grid */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#E6E2D9]">
                    <span className="text-[10px] uppercase font-semibold text-[#8C8479] tracking-wider block">
                      Joyas recomendadas:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="bg-[#F9F7F2] border border-[#E6E2D9] hover:border-[#D9D5CD] p-2 rounded-xl flex gap-2 items-center cursor-pointer transition-all group"
                          onClick={() => {
                            onClose();
                            onSelectProduct(p);
                          }}
                        >
                          <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-serif text-[11px] font-normal text-[#4A453E] group-hover:underline truncate">
                              {p.name}
                            </h5>
                            <span className="text-[10px] font-bold text-[#4A453E]">
                              {formatCurrency(p.price, currency)}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-[#8C8479] group-hover:text-[#4A453E] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-[#EAE7E0] text-[#4A453E] flex items-center justify-center flex-shrink-0 mt-1 border border-[#D9D5CD]">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#8C8479] p-2 font-sans">
              <Sparkles className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span>El Asesor está consultando la colección...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E6E2D9]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Escribe qué joya o regalo buscas..."
              className="flex-1 bg-[#F9F7F2] border border-[#E6E2D9] rounded-xl px-4 py-2.5 text-xs text-[#4A453E] placeholder-[#8C8479] focus:outline-none focus:border-[#4A453E] font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-semibold text-xs rounded-xl disabled:opacity-50 transition-all flex items-center justify-center shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
