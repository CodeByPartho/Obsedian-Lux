import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Heart, Star, Plus, Minus, ShieldCheck, Truck, RefreshCw, ShoppingCart } from 'lucide-react';
import { toast } from './Toast';

interface SingleProductViewProps {
  product: Product;
  onAddToCart: (product: Product, color: string, size: string, quantity: number, e: React.MouseEvent) => void;
  onToggleWishlist: (id: number) => void;
  isWishlisted: boolean;
  relatedProducts: Product[];
  onViewProduct: (id: number) => void;
}

export default function SingleProductView({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  relatedProducts,
  onViewProduct,
}: SingleProductViewProps) {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '#000000');
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'shipping'>('desc');
  const [mainImage, setMainImage] = useState<string>(product.image);

  // Zoom Lens variables
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    backgroundImage: `url(${product.image})`,
    backgroundPosition: '0% 0%',
    display: 'none',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = imageContainerRef.current;
    if (!container) return;

    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      backgroundImage: `url(${mainImage})`,
      backgroundPosition: `${x}% ${y}%`,
      display: 'block',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle((prev) => ({ ...prev, display: 'none' }));
  };

  const incrementQty = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    } else {
      toast("Reached limit of available warehouse stock", "info");
    }
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-28 select-none">
      
      {/* Back to shop navigation helper */}
      <div className="mb-10 flex items-center gap-3">
        <button
          onClick={() => onViewProduct(999)} // Go back to catalogue
          className="text-stone-500 hover:text-white text-xs font-mono uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>← Back to Collection</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        
        {/* GALERIE IMAGES LEFT PANEL: col-span-5 */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Display container with interactive zoom */}
          <div
            ref={imageContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-[3/4] bg-stone-900 border border-white/5 overflow-hidden group cursor-cell"
          >
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            
            {/* Magnifier Lens box overlay */}
            <div
              className="absolute inset-0 pointer-events-none border border-white/20 shadow-inner"
              style={{
                ...zoomStyle,
                backgroundSize: '200%',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>

          {/* Thumbnail list - horizontal row */}
          <div className="flex gap-3">
            {[product.image, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop", "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop"].map((thumb, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(thumb)}
                className={`relative aspect-[3/4] w-20 bg-stone-900 border overflow-hidden cursor-pointer transition-all duration-300 ${
                  mainImage === thumb ? 'border-[#E94560] scale-102 shadow-lg' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <img src={thumb} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS COLUMN RIGHT PANEL: col-span-7 */}
        <div className="lg:col-span-12 xl:col-span-7 flex flex-col justify-start">
          <div className="border-b border-white/5 pb-6 mb-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#E94560] block mb-2 font-bold">
              {product.category} COLLECTION
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h1 className="text-white font-serif text-3xl sm:text-4xl font-semibold tracking-wide uppercase leading-tight select-text">
                {product.name}
              </h1>
              
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white bg-white/5 hover:bg-[#E94560] hover:border-transparent transition-all shrink-0 active:scale-90"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white stroke-white' : 'stroke-white'}`} />
              </button>
            </div>

            {/* Ratings and Reviews count */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0.5 text-[#FFD700]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-stone-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-stone-500 font-mono text-xs uppercase tracking-wider">
                {product.rating} Rating / {product.reviews} Certified reviews
              </span>
            </div>
          </div>

          {/* Pricing indicator block */}
          <div className="flex items-end gap-4 mb-8">
            <span className="text-white font-mono text-3xl font-extrabold leading-none">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-stone-500 line-through font-mono text-base mb-1">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-[11px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-mono tracking-widest uppercase px-2 py-0.5 ml-2 font-bold select-none">
              In Stock &amp; Ships Free
            </span>
          </div>

          <div className="space-y-6 pb-8 border-b border-white/5 mb-8">
            {/* Color Swatches selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">
                Aesthetic Color Tone
              </span>
              <div className="flex items-center gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                      selectedColor === color
                        ? 'border-[#E94560] scale-110 shadow-[0_0_15px_rgba(233,69,96,0.3)]'
                        : 'border-white/15'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select Color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">
                Spec Size Fits
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 h-10 px-3 font-mono text-xs font-bold uppercase transition-all flex items-center justify-center border ${
                      selectedSize === size
                        ? 'bg-[#E94560] text-white border-transparent scale-102 shadow-md shadow-[#E94560]/25'
                        : 'border-white/10 text-stone-300 hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper + checkout launch actions */}
            <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-4">
              {/* Stepper block */}
              <div className="flex items-center justify-between border border-white/10 px-5 py-4 w-full sm:w-44 shrink-0 bg-[#11111A]/30">
                <button
                  onClick={decrementQty}
                  className="text-stone-400 hover:text-white transition-colors p-1"
                  aria-label="Reduce"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-white text-sm font-bold">{quantity}</span>
                <button
                  onClick={incrementQty}
                  className="text-stone-400 hover:text-white transition-colors p-1"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Central Main Add To Cart */}
              <button
                onClick={(e) => onAddToCart(product, selectedColor, selectedSize, quantity, e)}
                className="flex-grow py-4 bg-white text-black font-sans text-xs tracking-[0.25em] font-extrabold uppercase hover:bg-[#E94560] hover:text-white hover:shadow-[0_0_30px_rgba(233,69,96,0.4)] transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 select-none shadow-xl cursor-target-buy cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Luxury Bag
              </button>
            </div>
          </div>

          {/* Guarantees icons info layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3.5 bg-[#11111A]/30 border border-white/5">
              <Truck className="w-5 h-5 text-[#E94560] shrink-0" />
              <div>
                <span className="block text-white text-[11px] font-bold uppercase tracking-wider mb-0.5">Complimentary Delivery</span>
                <span className="text-[10px] text-stone-500 block">Calculated at dispatch</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-[#11111A]/30 border border-white/5">
              <ShieldCheck className="w-5 h-5 text-[#E94560] shrink-0" />
              <div>
                <span className="block text-white text-[11px] font-bold uppercase tracking-wider mb-0.5">Premium Guarantee</span>
                <span className="text-[10px] text-stone-500 block">100% Genuine selection</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-[#11111A]/30 border border-white/5">
              <RefreshCw className="w-5 h-5 text-[#E94560] shrink-0" />
              <div>
                <span className="block text-white text-[11px] font-bold uppercase tracking-wider mb-0.5">Humble Returns</span>
                <span className="text-[10px] text-stone-500 block">30 days convenient policy</span>
              </div>
            </div>
          </div>

          {/* Tab descriptions panel */}
          <div className="space-y-4">
            <div className="flex border-b border-white/5">
              {[
                { id: 'desc', label: 'Item Details' },
                { id: 'reviews', label: 'Specifications & Fit' },
                { id: 'shipping', label: 'Complimentary Shipping' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 font-sans text-[10px] tracking-widest uppercase font-bold transition-all relative cursor-pointer ${
                    activeTab === tab.id ? 'text-[#E94560]' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#E94560]" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#11111A]/20 text-stone-400 font-sans text-xs leading-relaxed tracking-wide space-y-2 uppercase">
              {activeTab === 'desc' && (
                <p>
                  A signature statement piece engineered for ultimate drape and structure. Crafted from custom high-density organic combed combed combed yarns in small batches and pre-washed to avoid shrink. Embellished with fine tailoring seams and local finishes.
                </p>
              )}
              {activeTab === 'reviews' && (
                <ul className="space-y-1.5 list-disc list-inside uppercase text-stone-400">
                  <li>Regular structured drape fit with slightly relaxed shoulders</li>
                  <li>Incredibly high-density combed combed luxury textile</li>
                  <li>Double reinforced high stitch rate seams</li>
                  <li>Engineered specifically for Obsidian Lux catalog series</li>
                </ul>
              )}
              {activeTab === 'shipping' && (
                <p>
                  Each order is securely prepared and packed inside obsidian signature magnetic boxes with satin lining overlays and complimentary scenting tags. Delivery dispatches within 24 hours of purchase, with instant tracking provided directly via email notifications.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-white/5 pt-12">
          <h3 className="text-white font-serif text-2xl font-semibold tracking-wide uppercase mb-8 ml-1">
            Related Aesthetic Pieces
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.slice(0, 3).map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onViewProduct(prod.id);
                  setMainImage(prod.image);
                  setQuantity(1);
                  setSelectedColor(prod.colors[0]);
                  setSelectedSize(prod.sizes[0]);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-[#11111A]/40 border border-white/5 p-4 flex flex-col hover:border-[#E94560]/30 transition-all cursor-pointer group"
              >
                <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-black">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-sans text-[10px] tracking-[0.3em] font-bold uppercase border border-white/20 px-3.5 py-2">
                      Inspect Item
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-white text-xs font-semibold uppercase tracking-wider">{prod.name}</span>
                  <span className="text-stone-400 font-mono text-xs font-bold">${prod.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
