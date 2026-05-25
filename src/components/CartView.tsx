import React, { useState } from 'react';
import { CartItem } from '../types';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { toast } from './Toast';
import { coupons } from '../data';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  appliedDiscount: number;
  setAppliedDiscount: (discount: number) => void;
  onContinueShopping: () => void;
}

export default function CartView({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  appliedDiscount,
  setAppliedDiscount,
  onContinueShopping,
}: CartViewProps) {
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const match = coupons.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
    
    if (match) {
      setAppliedDiscount(match.discountPercent);
      toast(`Promotional Coupon applied: ${match.discountPercent}% Discount!`, "success");
    } else {
      toast("Invalid coupon combination", "error");
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (appliedDiscount / 100);
  const finalSubtotal = subtotal - discountAmount;
  const tax = finalSubtotal * 0.08; // 8% Tax rate
  const shipping = finalSubtotal >= 150 ? 0 : 15;
  const total = finalSubtotal + tax + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-36 text-center select-none">
        <div className="w-20 h-20 border border-white/5 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 text-stone-500 animate-pulse">
          <ShoppingBag className="w-8 h-8 text-[#E94560]" />
        </div>
        <h2 className="text-white font-serif text-3xl font-bold uppercase tracking-wide mb-3">
          Your Bag is Empty
        </h2>
        <p className="text-stone-500 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          It looks like you haven&rsquo;t added any luxury pieces from our catalogue yet. Let&rsquo;s find your signature layout style!
        </p>
        <button
          onClick={onContinueShopping}
          className="px-10 py-4 bg-white text-black font-sans text-xs tracking-[0.25em] font-bold uppercase hover:bg-[#E94560] hover:text-white hover:shadow-[0_0_20px_rgba(233,69,96,0.3)] transition-all cursor-pointer shadow-lg"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-28 select-none">
      <h2 className="text-white font-serif text-3xl sm:text-4xl font-semibold tracking-wide uppercase mb-1.5">
        Checkout Bag
      </h2>
      <p className="text-stone-500 text-xs sm:text-sm font-sans tracking-widest uppercase mb-10 pb-4 border-b border-white/5">
        REVIEW YOUR SELECTED ITEMS BEFORE COMPLETING DISPATCH
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SHOPPING TABLE: col-span-8 */}
        <div className="lg:col-span-8 space-y-5">
          {cart.map((item, index) => (
            <div
              key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
              className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-[#11111A]/60 border border-white/5 backdrop-blur-md hover:border-white/10 transition-colors"
            >
              {/* Image thumbnail */}
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-32 object-cover bg-stone-900 border border-white/5 shrink-0"
              />

              {/* Specs & description */}
              <div className="flex-grow flex flex-col items-center sm:items-start text-center sm:text-left">
                <h3 className="text-white text-base font-medium tracking-wide uppercase mb-1.5">
                  {item.product.name}
                </h3>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Tone:</span>
                    <span
                      className="w-3 h-3 border border-white/15"
                      style={{ backgroundColor: item.selectedColor }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Size Matrix: </span>
                    <span className="text-[10px] text-[#E94560] font-bold font-mono">{item.selectedSize}</span>
                  </div>
                </div>

                {/* Stepper controls */}
                <div className="flex items-center border border-white/10 bg-black/20">
                  <button
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="px-3 py-1.5 text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Reduce"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-white font-mono text-xs font-bold leading-normal select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="px-3 py-1.5 text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Price calculations and trash delete action */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-right w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                <span className="text-white font-mono text-base font-bold mb-1.5 block">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
                <span className="text-stone-500 font-mono text-[10px] uppercase block mb-4">
                  ${item.product.price} Each
                </span>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="flex items-center gap-1.5 text-stone-500 hover:text-rose-400 font-sans text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Item
                </button>
              </div>
            </div>
          ))}

          {/* Settle quick buttons links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              onClick={onContinueShopping}
              className="text-[#E94560] hover:text-white font-sans text-xs tracking-widest uppercase font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>← Continue Selected Shopping</span>
            </button>
            <span className="text-stone-500 font-sans text-xs uppercase tracking-wider">
              Secure TLS 256-Bit Encrypted Link
            </span>
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR: col-span-4 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#11111A]/40 border border-white/5 p-6 backdrop-blur-md text-stone-300">
            <h3 className="font-serif text-white font-bold tracking-wide text-sm uppercase border-b border-white/5 pb-4 mb-5">
              Bag Summary
            </h3>

            {/* Standard pricing specs */}
            <div className="space-y-3.5 border-b border-white/5 pb-5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500 uppercase">Subtotal</span>
                <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
              </div>
              
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span className="uppercase">Discount (-{appliedDiscount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-stone-500 uppercase">Sales Tax (8%)</span>
                <span className="text-white font-bold">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500 uppercase">Premium Courier</span>
                <span className="text-white font-bold">
                  {shipping === 0 ? 'COMPLIMENTARY' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              
              {shipping > 0 && (
                <p className="text-[10px] font-sans text-stone-500 leading-normal uppercase">
                  Tip: Get <span className="text-[#E94560] font-bold">Complimentary Shipping</span> by adding <span className="text-white font-bold">${(150 - finalSubtotal).toFixed(2)}</span> more to your bag.
                </p>
              )}
            </div>

            {/* GRAND TOTAL */}
            <div className="flex justify-between items-center py-5 border-b border-white/5 mb-5 font-mono">
              <span className="text-stone-400 text-xs uppercase tracking-widest">Grand Total</span>
              <span className="text-white text-xl font-bold font-mono tracking-tight glow-text-white">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* PROMO COUPON FORM */}
            <form onSubmit={handleApplyCoupon} className="space-y-3 pb-2 border-b border-white/5 mb-5">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                Apply Promo Code
              </span>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  placeholder="e.g. SUMMER20, LUX50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow bg-[#151525] border border-white/10 text-white font-sans text-xs uppercase tracking-widest px-3 py-3 outline-none focus:border-[#E94560]/40"
                />
                <button
                  type="submit"
                  className="px-4 bg-white text-black font-sans text-[11px] font-bold uppercase hover:bg-[#E94560] hover:text-white transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {appliedDiscount > 0 && (
                <span className="text-[10px] text-emerald-400 font-mono block uppercase">
                  ✓ Code accepted. Applied {appliedDiscount}% savings.
                </span>
              )}
            </form>

            {/* PROCEED TO CHECKOUT BUTTON */}
            <button
              onClick={onProceedToCheckout}
              className="w-full py-4 bg-[#E94560] text-white font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#ff5674] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#E94560]/10"
            >
              <span>Validate &amp; Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-[#11111A]/20 border border-white/5 flex gap-3 items-start text-stone-500">
            <ShieldCheck className="w-5 h-5 text-[#E94560] shrink-0 mt-0.5" />
            <p className="text-[10px] uppercase leading-relaxed font-sans tracking-wide">
              Every checkout occurs through our fully audited vault ledger. Stock statuses are held for 15 minutes upon continuing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
