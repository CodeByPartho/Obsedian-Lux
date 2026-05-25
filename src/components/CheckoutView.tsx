import React, { useState } from 'react';
import { StoreState, CartItem } from '../types';
import { toast } from './Toast';
import { ShieldCheck, Truck, CreditCard, ShoppingBag, CheckCircle } from 'lucide-react';

interface CheckoutViewProps {
  cart: CartItem[];
  appliedDiscount: number;
  onPlaceOrder: (customerDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
    zip: string;
    cardName: string;
    cardNumber: string;
  }) => void;
  onCancel: () => void;
}

export default function CheckoutView({
  cart,
  appliedDiscount,
  onPlaceOrder,
  onCancel,
}: CheckoutViewProps) {
  const [step, setStep] = useState<number>(1);

  // Form states
  const [shippingName, setShippingName] = useState('');
  const [shippingEmail, setShippingEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingCountry, setShippingCountry] = useState('United States');
  const [shippingZip, setShippingZip] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Handle formatted card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Add spaces every 4 digits
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  // Handle Expiry Month/Year format (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  // Handle CVV input
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardCvv(value);
  };

  // Navigations validation
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingName || !shippingEmail || !shippingAddress || !shippingCity || !shippingZip) {
      toast("Please populate all shipping records", "error");
      return;
    }
    // Simple email regex check
    if (!/\S+@\S+\.\S+/.test(shippingEmail)) {
      toast("Invalid email address format", "error");
      return;
    }
    setStep(2);
    toast("Address saved successfully", "success");
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || cardNumber.length < 19 || cardExpiry.length < 5 || cardCvv.length < 3) {
      toast("Please complete all payment records", "error");
      return;
    }
    setStep(3);
    toast("Credit Card verification completed", "success");
  };

  const handleFinalSubmit = () => {
    onPlaceOrder({
      name: shippingName,
      email: shippingEmail,
      address: shippingAddress,
      city: shippingCity,
      country: shippingCountry,
      zip: shippingZip,
      cardName,
      cardNumber,
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (appliedDiscount / 100);
  const finalSubtotal = subtotal - discountAmount;
  const tax = finalSubtotal * 0.08;
  const shipping = finalSubtotal >= 150 ? 0 : 15;
  const total = finalSubtotal + tax + shipping;

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-28 select-none">
      
      {/* Title Header */}
      <div className="text-center mb-12">
        <h2 className="text-white font-serif text-3xl sm:text-4xl font-semibold tracking-wide uppercase mb-1.5">
          Dispatch Terminal
        </h2>
        <p className="text-stone-500 text-xs font-sans tracking-[0.2em] uppercase">
          Step {step} of 3 / Secure Vault Session
        </p>

        {/* STEPPER STATUS BAR TIMELINE */}
        <div className="flex items-center justify-center gap-4 mt-8 max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-stone-900 -z-10" />
          <div
            className="absolute top-1/2 left-0 h-[2px] bg-[#E94560] -z-10 transition-all duration-500"
            style={{ width: step === 1 ? '15%' : step === 2 ? '50%' : '100%' }}
          />

          {[
            { tag: 1, label: 'Shipping', icon: <Truck className="w-4 h-4" /> },
            { tag: 2, label: 'Vault', icon: <CreditCard className="w-4 h-4" /> },
            { tag: 3, label: 'Finalize', icon: <CheckCircle className="w-4 h-4" /> },
          ].map((s) => (
            <div key={s.tag} className="flex flex-col items-center bg-[#0A0A0F] px-4">
              <div
                className={`w-9 h-9 border rounded-full flex items-center justify-center transition-all duration-300 ${
                  step >= s.tag
                    ? 'bg-[#E94560] border-transparent text-white shadow-[0_0_12px_rgba(233,69,96,0.4)]'
                    : 'border-white/10 text-stone-600'
                }`}
              >
                {s.icon}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-widest mt-2 ${
                step >= s.tag ? 'text-white font-bold' : 'text-stone-600'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* VIEW STEP CONTAINERS: col-span-7 */}
        <div className="lg:col-span-7 bg-[#11111A]/40 border border-white/5 p-6 backdrop-blur-md text-stone-300">
          
          {/* STEP 1: SHIPPING DETAILS */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6 animate-slide-in-right">
              <h3 className="font-serif text-white font-bold tracking-wide text-base uppercase border-b border-white/5 pb-3">
                Shipping Dispatch Registry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={shippingEmail}
                    onChange={(e) => setShippingEmail(e.target.value)}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    City / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    Postal Code / Zip
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingZip}
                    onChange={(e) => setShippingZip(e.target.value)}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between gap-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 border border-white/10 text-stone-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-white text-black font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#E94560] hover:text-white transition-all cursor-pointer"
                >
                  Save &amp; Proceed
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VAULT PAYMENT */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-in-right">
              <h3 className="font-serif text-white font-bold tracking-wide text-base uppercase border-b border-white/5 pb-3">
                Secure PCI Vault Entry
              </h3>

              {/* STUNNING INTERACTIVE VIRTUAL CREDIT CARD */}
              <div className="relative aspect-[1.586/1] w-full max-w-sm mx-auto bg-gradient-to-br from-[#1A1A2E]/90 to-[#0F3460]/90 border border-white/10 rounded-2xl p-6 flex flex-col justify-between text-white shadow-2xl overflow-hidden backdrop-blur-md select-none">
                <div className="absolute top-0 right-0 w-44 h-44 bg-[#E94560]/15 rounded-full blur-2xl -z-10" />
                
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#E94560] font-mono tracking-widest font-bold block uppercase">Obsidian Ledger</span>
                    <span className="text-[8px] text-stone-500 font-mono uppercase block">SECURE ENDPOINT</span>
                  </div>
                  {/* Glowing micro-chip icon */}
                  <div className="w-10 h-7 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-md relative flex items-center justify-center">
                    <div className="w-5 h-3.5 border border-[#FFD700]/20 rounded-sm" />
                  </div>
                </div>

                <div className="py-2">
                  <p className="text-stone-400 text-[10px] font-mono uppercase tracking-widest mb-1.5">CARD NUMBER</p>
                  <p className="text-xl sm:text-2xl font-mono tracking-[0.15em] font-semibold text-white drop-shadow-md">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>

                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="text-stone-500 text-[8px] font-mono uppercase block">CARDHOLDER</span>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#EAEAEA] font-bold block">
                      {cardName || 'OBSIDIAN ENVOY'}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-0.5">
                      <span className="text-stone-500 text-[8px] font-mono uppercase block">EXPIRES</span>
                      <span className="text-xs font-mono text-white font-bold block">{cardExpiry || 'MM/YY'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-stone-500 text-[8px] font-mono uppercase block">CVV</span>
                      <span className="text-xs font-mono text-white font-bold block">{cardCvv || '•••'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* INPUT FORM ITEMS */}
              <form onSubmit={handleStep2Submit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans pt-4 border-t border-white/5">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JAMES MORIARTY"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 uppercase focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50 font-mono text-center"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                      CVV Code
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="•••"
                      maxLength={3}
                      value={cardCvv}
                      onChange={handleCvvChange}
                      className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50 font-mono text-center"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 pt-4 flex justify-between gap-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-white/10 text-stone-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-white text-black font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#E94560] hover:text-white transition-all cursor-pointer"
                  >
                    Verify &amp; Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: FINALIZE & REVIEW */}
          {step === 3 && (
            <div className="space-y-6 animate-slide-in-right">
              <h3 className="font-serif text-white font-bold tracking-wide text-base uppercase border-b border-white/5 pb-3">
                Final Review Verification
              </h3>

              {/* Summarize shipping and payment inputs in neat layouts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-2 uppercase">
                <div className="p-4 bg-[#11111A]/60 border border-white/5">
                  <p className="text-[10px] text-stone-500 font-mono tracking-widest mb-1.5 font-bold">SHIPMENT ADDRESS</p>
                  <div className="text-xs text-stone-300 font-sans space-y-1">
                    <p className="text-white font-bold">{shippingName}</p>
                    <p>{shippingEmail}</p>
                    <p className="line-clamp-1">{shippingAddress}</p>
                    <p>{shippingCity}, {shippingZip}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#11111A]/60 border border-white/5">
                  <p className="text-[10px] text-stone-500 font-mono tracking-widest mb-1.5 font-bold">METHOD OF SETTLEMENT</p>
                  <div className="text-xs text-stone-300 font-sans space-y-1">
                    <p className="text-white font-bold">{cardName}</p>
                    <p className="font-mono">Card: •••• •••• •••• {cardNumber.slice(-4)}</p>
                    <p className="font-mono">Expiry: {cardExpiry}</p>
                  </div>
                </div>
              </div>

              {/* Detailed item summaries inline list */}
              <div className="space-y-3.5 border-t border-b border-white/5 py-5">
                <p className="text-[10px] text-stone-500 font-mono tracking-widest font-bold">BAG PACK LIST</p>
                <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center text-xs font-mono pr-2">
                      <span className="text-stone-400 font-sans uppercase">
                        {item.product.name} ({item.selectedSize}) <span className="text-[#E94560] font-bold">x{item.quantity}</span>
                      </span>
                      <span className="text-white font-bold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-white/10 text-stone-400 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="px-8 py-3.5 bg-[#E94560] text-white font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#ff5674] hover:shadow-[0_0_20px_rgba(233,69,96,0.3)] transition-all cursor-pointer"
                >
                  Authorize Payment &amp; Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PRICE SUMMARY TRAY RIGHT: col-span-5 */}
        <div className="lg:col-span-12 xl:col-span-5 bg-[#11111A]/40 border border-white/5 p-6 backdrop-blur-md text-stone-300">
          <h3 className="font-serif text-white font-bold tracking-wide text-sm uppercase border-b border-white/5 pb-4 mb-5 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#E94560]" />
            Order Settle Breakdown
          </h3>

          <div className="space-y-3.5 border-b border-white/5 pb-5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-stone-500 uppercase">Subtotal</span>
              <span className="text-white font-bold">${subtotal.toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span className="uppercase">Coupon code (-{appliedDiscount}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500 uppercase">Sales tax (8%)</span>
              <span className="text-white font-bold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 uppercase">Settle Courier</span>
              <span className="text-white font-bold">
                {shipping === 0 ? 'COMPLIMENTARY' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-5 font-mono">
            <span className="text-stone-400 text-xs uppercase tracking-widest">Grand Total</span>
            <span className="text-white text-lg font-bold tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>

          <div className="p-4 bg-black/10 flex gap-3.5 items-start text-stone-500 border-t border-white/5">
            <ShieldCheck className="w-5 h-5 text-[#E94560] shrink-0" />
            <p className="text-[10px] uppercase leading-relaxed font-sans">
              Purchases are cleared instantly by the ledger. Every order is prepared custom and comes with automated real-time tracking metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
