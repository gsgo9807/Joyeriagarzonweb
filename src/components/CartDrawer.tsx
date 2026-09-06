import React from 'react';
import { X, Trash2, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout?: () => void;
  appliedPromo?: string | null;
  onApplyPromo?: (code: string) => boolean;
  currency: 'COP' | 'USD';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  currency
}) => {
  if (!isOpen) return null;

  // Calculate cart subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  // Free shipping threshold in COP
  const freeShippingThreshold = 150000;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 12000;
  const grandTotal = Math.max(0, subtotal + shippingFee);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F9F7F2] text-[#4A453E] shadow-2xl border-l border-[#E6E2D9] flex flex-col font-sans">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E6E2D9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-lg font-normal text-[#4A453E]">Tu Carrito de Joyas</h2>
              <span className="bg-[#EAE7E0] text-[#4A453E] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#D9D5CD]">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8C8479] hover:text-[#4A453E] hover:bg-[#EAE7E0] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="px-5 py-3 bg-[#EAE7E0] border-b border-[#D9D5CD] text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[#6B6459]">
                  Agrega <strong className="text-[#4A453E]">{formatCurrency(remainingForFreeShipping, currency)}</strong> más para <span className="text-[#4A453E] font-semibold">Envío Gratis</span>
                </p>
                <div className="w-full h-1.5 bg-[#D9D5CD] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A453E] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[#4A453E] font-medium">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                ¡Felicidades! Tienes <strong className="underline">ENVÍO GRATIS</strong> asegurado.
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#EAE7E0] flex items-center justify-center text-[#8C8479]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-base font-normal text-[#4A453E]">Tu carrito está vacío</h3>
                <p className="text-xs text-[#8C8479] font-light max-w-xs mx-auto">
                  Descubre nuestras piezas de lujo en Oro 18K, Plata 925 y Gemas preciosas.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 rounded-full bg-[#4A453E] text-[#F9F7F2] text-xs font-semibold hover:bg-[#36322D] transition-colors"
                >
                  Explorar Joyas
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.cartItemId}
                  className="bg-white border border-[#E6E2D9] rounded-2xl p-3 flex gap-3.5 relative group hover:border-[#D9D5CD] transition-colors shadow-2xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-xl object-cover bg-[#EAE7E0] border border-[#E6E2D9] flex-shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-semibold text-[#4A453E] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.cartItemId)}
                          className="text-[#8C8479] hover:text-rose-600 p-1 transition-colors"
                          title="Eliminar ítem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Specs */}
                      <div className="text-[11px] text-[#6B6459] font-light mt-0.5 space-y-0.5">
                        <span>{item.selectedMetal}</span>
                        {item.selectedSize && <span> • Talla {item.selectedSize}</span>}
                        {item.selectedLength && <span> • Largo {item.selectedLength}</span>}
                      </div>

                      {item.customEngraving && (
                        <div className="text-[10px] text-[#6B6459] bg-[#EAE7E0] px-2 py-0.5 rounded border border-[#D9D5CD] mt-1 inline-block">
                          Grabado: &quot;{item.customEngraving}&quot;
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center bg-[#F9F7F2] border border-[#E6E2D9] rounded-full">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#4A453E] hover:text-black font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-[#4A453E]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#4A453E] hover:text-black font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#4A453E]">
                        {formatCurrency(item.product.price * item.quantity, currency)}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-white border-t border-[#E6E2D9] space-y-4">
              
              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#6B6459]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-[#4A453E]">{formatCurrency(subtotal, currency)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#4A453E]">GRATIS</strong> : formatCurrency(shippingFee, currency)}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#4A453E] pt-2 border-t border-[#E6E2D9]">
                  <span>Total a pagar:</span>
                  <span className="text-base text-[#4A453E]">{formatCurrency(grandTotal, currency)}</span>
                </div>
              </div>

              {/* WhatsApp Only Order Button */}
              <div>
                <a
                  href={`https://wa.me/573506471972?text=${encodeURIComponent(
                    `*GARZON JOYERÍA FINA - Pedido por WhatsApp* 💎\n\n` +
                    `*Items en Carrito:*\n` +
                    cartItems.map(i => `• ${i.quantity}x ${i.product.name} (${i.selectedMetal}${i.selectedSize ? `, Talla ${i.selectedSize}` : ''}) - ${formatCurrency(i.product.price * i.quantity, currency)}`).join('\n') +
                    `\n\n*Total:* ${formatCurrency(grandTotal, currency)}\n\n` +
                    `Hola Garzon Joyería, quiero pedir y pagar directamente por WhatsApp.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  💬 Pedir y Pagar Directo por WhatsApp
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C8479] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                Atención directa personalizada | Empaque para regalo incluido
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
