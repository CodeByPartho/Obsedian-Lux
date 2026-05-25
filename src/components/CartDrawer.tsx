import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 select-none">
      {/* Dark backdrop blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
      />

      {/* Slide-out side tray (width 450px max) */}
      <div className="absolute top-0 right-0 bottom-0 max-w-md w-full bg-[#0E0E14] border-l border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col pt-6 animate-slide-in-right">
        
        {/* Draw Header Banner */}
        <div className="px-6 pb-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#E94560]" />
            <span className="font-serif text-white font-bold text-lg uppercase tracking-wide">
              Shopping Bag
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* List scroll section */}
        <div className="flex-grow overflow-y-auto custom-scrollbar p-6 space-y-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 border border-white/5 rounded-full flex items-center justify-center mb-4 text-stone-600">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-white font-sans text-sm tracking-widest uppercase font-semibold mb-1">
                Your bag is empty
              </p>
              <p className="text-stone-500 text-xs tracking-wider max-w-xs leading-relaxed">
                Add premium selections from our collection to begin styling your aesthetic.
              </p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                className="flex gap-4 p-4 bg-[#14141F]/40 border border-white/5 rounded-none animate-slide-up hover:border-white/10 transition-colors"
              >
                {/* Product Thumbnail image */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-20 object-cover bg-stone-900 border border-white/5 shrink-0"
                />

                {/* Details info and Controls */}
                <div className="flex-grow flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-white text-xs font-semibold uppercase tracking-wider leading-snug truncate max-w-36">
                      {item.product.name}
                    </h4>
                    <span className="text-white font-mono text-xs font-bold leading-normal">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Selected Specs parameters */}
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1 mb-2">
                    <div className="flex items-center gap-1.5 align-middle">
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Color:</span>
                      <span
                        className="w-2.5 h-2.5 border border-white/20"
                        style={{ backgroundColor: item.selectedColor }}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">Size: </span>
                      <span className="text-[9px] text-[#E94560] font-bold font-mono uppercase">{item.selectedSize}</span>
                    </div>
                  </div>

                  {/* Quantity and Delete buttons */}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-white/10">
                      <button
                        onClick={() => onUpdateQuantity(index, -1)}
                        className="px-2 py-1 text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Decrease Quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-white text-xs font-mono select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(index, 1)}
                        className="px-2 py-1 text-stone-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        aria-label="Increase Quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(index)}
                      className="text-stone-500 hover:text-white p-1 transition-colors cursor-pointer group"
                      aria-label="Remove Item"
                    >
                      <Trash2 className="w-4 h-4 group-hover:text-rose-400 group-hover:scale-110" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Draw Footer Area */}
        {cart.length > 0 && (
          <div className="p-6 bg-[#0B0B10] border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 text-xs font-mono uppercase tracking-widest">
                Subtotal
              </span>
              <span className="text-white text-lg font-mono font-bold">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            
            <p className="text-[10px] text-stone-500 tracking-wide font-sans leading-normal">
              Tax calculation and exclusive codes are applied at checkout.
            </p>

            <button
              onClick={onCheckout}
              className="w-full py-4 bg-[#E94560] text-white font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#ff5674] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              Secure Checkout
              <ArrowRight className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
