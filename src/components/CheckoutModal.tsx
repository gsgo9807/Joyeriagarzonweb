import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Gift, ArrowRight, Download, Package } from 'lucide-react';
import { CartItem, ShippingInfo, Order } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onClearCart: () => void;
  currency: 'COP' | 'USD';
  discountAmount?: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onClearCart,
  currency,
  discountAmount = 0
}) => {
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  
  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: 'Gonzalo Garzón',
    email: 'gonzalo@ejemplo.com',
    phone: '310 555 8920',
    address: 'Calle 127 # 19A-45, Apt 502',
    city: 'Bogotá D.C.',
    postalCode: '110111',
    giftWrap: true,
    giftMessage: '¡Feliz Aniversario, con todo mi amor!'
  });

  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'card' | 'pse' | 'cod'>('whatsapp');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 150000;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 12000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const getWhatsappUrl = (orderObj?: Order | null) => {
    const phone = '573506471972';
    const itemsList = (orderObj?.items || cartItems).map(item => 
      `• ${item.quantity}x ${item.product.name} (${item.selectedMetal}${item.selectedSize ? `, Talla ${item.selectedSize}` : ''}) - ${formatCurrency(item.product.price * item.quantity, currency)}`
    ).join('\n');

    const message = `*GARZON JOYERÍA FINA - Pedido & Pago por WhatsApp* 💎\n\n` +
      `*Cliente:* ${orderObj?.shippingInfo.fullName || shippingInfo.fullName}\n` +
      `*Teléfono:* ${orderObj?.shippingInfo.phone || shippingInfo.phone}\n` +
      `*Dirección:* ${orderObj?.shippingInfo.address || shippingInfo.address}, ${orderObj?.shippingInfo.city || shippingInfo.city}\n\n` +
      `*Detalle del Pedido (${orderObj ? `Orden #${orderObj.id}` : 'Cotización'}):*\n${itemsList}\n\n` +
      `*Total a Pagar:* ${formatCurrency(orderObj ? orderObj.total : total, currency)}\n` +
      `*Método:* Pago directo Asistido por WhatsApp\n\n` +
      `Hola Garzon Joyería, quiero confirmar mi pedido y recibir los datos bancarios (Nequi/Bancolombia/Daviplata/Datafono) para realizar el pago. ¡Muchas gracias!`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderNumber = `GARZ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderNumber,
      date: new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
      items: [...cartItems],
      shippingInfo,
      paymentMethod: paymentMethod === 'whatsapp' ? 'Pago Asistido vía WhatsApp' : paymentMethod === 'card' ? 'Tarjeta de Crédito / Débito' : paymentMethod === 'pse' ? 'PSE / Transferencia Nequi' : 'Pago Contra Entrega',
      subtotal,
      discount: discountAmount,
      shippingFee,
      total
    };

    setCompletedOrder(newOrder);
    setStep('confirmation');
    onClearCart();

    // If user chose WhatsApp payment, automatically open WhatsApp chat with order details
    if (paymentMethod === 'whatsapp') {
      window.open(getWhatsappUrl(newOrder), '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#F9F7F2] border border-[#E6E2D9] text-[#4A453E] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-8 relative">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E6E2D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EAE7E0] text-[#4A453E] border border-[#D9D5CD] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-normal text-[#4A453E]">Proceso de Pago Seguro</h3>
              <p className="text-xs text-[#8C8479]">Garzon Joyería Fina • Cifrado SSL de 256 bits</p>
            </div>
          </div>
          {step !== 'confirmation' && (
            <button onClick={onClose} className="p-1.5 text-[#8C8479] hover:text-[#4A453E] hover:bg-[#EAE7E0] rounded-full">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Bar */}
        {step !== 'confirmation' && (
          <div className="flex border-b border-[#E6E2D9] bg-[#EAE7E0] text-xs font-semibold">
            <div className={`flex-1 py-3 text-center border-b-2 ${step === 'shipping' ? 'border-[#4A453E] text-[#4A453E] bg-white' : 'border-transparent text-[#8C8479]'}`}>
              1. Datos de Envío
            </div>
            <div className={`flex-1 py-3 text-center border-b-2 ${step === 'payment' ? 'border-[#4A453E] text-[#4A453E] bg-white' : 'border-transparent text-[#8C8479]'}`}>
              2. Método de Pago
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-8">
          
          {/* Step 1: Shipping Information */}
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <h4 className="text-xs font-semibold text-[#4A453E] uppercase tracking-wider mb-2">
                Dirección de Destino
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B6459] mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.fullName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#4A453E] focus:outline-none focus:border-[#4A453E]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6459] mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#4A453E] focus:outline-none focus:border-[#4A453E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#6B6459] mb-1">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#4A453E] focus:outline-none focus:border-[#4A453E]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6B6459] mb-1">Ciudad y Departamento *</label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#4A453E] focus:outline-none focus:border-[#4A453E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#6B6459] mb-1">Dirección de Entrega Exacta *</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  placeholder="Ej: Carrera 15 # 85-30 Apt 402"
                  className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3.5 py-2 text-xs text-[#4A453E] focus:outline-none focus:border-[#4A453E]"
                />
              </div>

              {/* Gift Wrap Box */}
              <div className="p-3.5 bg-[#EAE7E0] border border-[#D9D5CD] rounded-2xl space-y-2 mt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#4A453E]">
                  <input
                    type="checkbox"
                    checked={shippingInfo.giftWrap}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, giftWrap: e.target.checked })}
                    className="rounded border-[#D9D5CD] text-[#4A453E] focus:ring-[#4A453E]"
                  />
                  <Gift className="w-4 h-4 text-[#D4AF37]" />
                  Incluir Empaque Especial de Regalo con Cinta y Tarjeta Personalizada (GRATIS)
                </label>
                {shippingInfo.giftWrap && (
                  <input
                    type="text"
                    value={shippingInfo.giftMessage || ''}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, giftMessage: e.target.value })}
                    placeholder="Mensaje impreso para la tarjeta de regalo..."
                    className="w-full bg-white border border-[#E6E2D9] rounded-xl px-3 py-1.5 text-xs text-[#4A453E] focus:outline-none focus:border-[#4A453E]"
                  />
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[#4A453E]">
                  Total a pagar: {formatCurrency(total, currency)}
                </span>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2] font-semibold text-xs uppercase tracking-wider rounded-full flex items-center gap-2 transition-all shadow-md"
                >
                  Continuar al Pago
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Payment Method */}
          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <h4 className="text-xs font-semibold text-[#4A453E] uppercase tracking-wider mb-2">
                Selecciona tu Forma de Pago
              </h4>

              <div className="space-y-2.5">
                <label
                  onClick={() => setPaymentMethod('whatsapp')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'whatsapp'
                      ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 shadow-sm'
                      : 'bg-[#F9F7F2] border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      💬
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="block text-xs font-bold text-emerald-900">Pago Directo vía WhatsApp (Asesor en Vivo)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase">Recomendado</span>
                      </div>
                      <span className="block text-[10px] text-emerald-700/90 mt-0.5">
                        Transfiere por Nequi, Daviplata, Bancolombia o tarjeta chateando directamente con nuestro asesor de joyería
                      </span>
                    </div>
                  </div>
                  <input type="radio" name="pay" checked={paymentMethod === 'whatsapp'} onChange={() => {}} />
                </label>

                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-white border-[#4A453E] text-[#4A453E] shadow-xs'
                      : 'bg-[#F9F7F2] border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <span className="block text-xs font-bold">Tarjeta de Crédito / Débito / Cuotas Addi</span>
                      <span className="block text-[10px] text-[#8C8479]">Visa, Mastercard, American Express o hasta 3 cuotas sin interés</span>
                    </div>
                  </div>
                  <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => {}} />
                </label>

                <label
                  onClick={() => setPaymentMethod('pse')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'pse'
                      ? 'bg-white border-[#4A453E] text-[#4A453E] shadow-xs'
                      : 'bg-[#F9F7F2] border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <span className="block text-xs font-bold">PSE / Transferencia Bancaria</span>
                      <span className="block text-[10px] text-[#8C8479]">Debitado de tu cuenta bancaria o Nequi</span>
                    </div>
                  </div>
                  <input type="radio" name="pay" checked={paymentMethod === 'pse'} onChange={() => {}} />
                </label>

                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-white border-[#4A453E] text-[#4A453E] shadow-xs'
                      : 'bg-[#F9F7F2] border-[#E6E2D9] text-[#6B6459] hover:bg-[#EAE7E0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <span className="block text-xs font-bold">Pago Contra Entrega</span>
                      <span className="block text-[10px] text-[#8C8479]">Pagas en efectivo o datáfono al recibir la joya en tu puerta</span>
                    </div>
                  </div>
                  <input type="radio" name="pay" checked={paymentMethod === 'cod'} onChange={() => {}} />
                </label>
              </div>

              {/* Order Summary Recap */}
              <div className="p-4 bg-white border border-[#E6E2D9] rounded-2xl text-xs space-y-1.5 mt-4">
                <div className="flex justify-between text-[#6B6459]">
                  <span>Items en pedido ({cartItems.length}):</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#4A453E] font-medium">
                    <span>Descuento aplicado:</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B6459]">
                  <span>Envío asegurado:</span>
                  <span>{shippingFee === 0 ? 'GRATIS' : formatCurrency(shippingFee, currency)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#4A453E] text-sm pt-2 border-t border-[#E6E2D9]">
                  <span>Total Final:</span>
                  <span>{formatCurrency(total, currency)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs text-[#8C8479] hover:text-[#4A453E] underline"
                >
                  Volver a Dirección
                </button>
                <button
                  type="submit"
                  className={`px-8 py-3.5 font-semibold text-xs uppercase tracking-wider rounded-full flex items-center gap-2 transition-all shadow-md ${
                    paymentMethod === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-[#4A453E] hover:bg-[#36322D] text-[#F9F7F2]'
                  }`}
                >
                  {paymentMethod === 'whatsapp' ? (
                    <>
                      <span>💬 Continuar a WhatsApp ({formatCurrency(total, currency)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    `Confirmar y Pagar ${formatCurrency(total, currency)}`
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Order Confirmation */}
          {step === 'confirmation' && completedOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-[#EAE7E0] text-[#4A453E] border border-[#D9D5CD] rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37]" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-normal text-[#4A453E]">
                  ¡Orden Registrada con Éxito!
                </h3>
                <p className="text-xs text-[#6B6459] mt-1">
                  Número de Pedido: <strong className="text-[#4A453E] font-mono text-sm">{completedOrder.id}</strong>
                </p>
                <p className="text-xs text-[#8C8479] mt-0.5">
                  Confirmación de pedido enviada a <strong className="text-[#4A453E]">{completedOrder.shippingInfo.email}</strong>
                </p>
              </div>

              {/* Order Receipt Box */}
              <div className="p-4 bg-white border border-[#E6E2D9] rounded-2xl text-left text-xs space-y-3">
                <div className="flex justify-between pb-2 border-b border-[#E6E2D9] text-[#4A453E] font-bold">
                  <span>Resumen del Pedido</span>
                  <span>{completedOrder.date}</span>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {completedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[#6B6459]">
                      <div>
                        <span className="font-semibold text-[#4A453E]">{item.quantity}x {item.product.name}</span>
                        <span className="block text-[10px] text-[#8C8479]">{item.selectedMetal} {item.selectedSize ? `(Talla ${item.selectedSize})` : ''}</span>
                      </div>
                      <span className="font-mono text-[#4A453E]">{formatCurrency(item.product.price * item.quantity, currency)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E6E2D9] space-y-1">
                  <div className="flex justify-between text-[#8C8479]">
                    <span>Destinatario:</span>
                    <span className="text-[#4A453E]">{completedOrder.shippingInfo.fullName}</span>
                  </div>
                  <div className="flex justify-between text-[#8C8479]">
                    <span>Dirección:</span>
                    <span className="text-[#4A453E]">{completedOrder.shippingInfo.address}, {completedOrder.shippingInfo.city}</span>
                  </div>
                  <div className="flex justify-between text-[#8C8479]">
                    <span>Método de Pago:</span>
                    <span className="text-[#4A453E]">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-[#4A453E] font-bold text-sm pt-2 border-t border-[#E6E2D9]">
                    <span>Total Pedido:</span>
                    <span className="text-[#4A453E]">{formatCurrency(completedOrder.total, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={getWhatsappUrl(completedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>💬 Confirmar y Pagar por WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-full bg-[#4A453E] text-[#F9F7F2] font-semibold text-xs hover:bg-[#36322D] transition-all shadow-md"
                >
                  Seguir Comprando Joyas
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
