import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { Eye, ShoppingCart, Heart, Star } from 'lucide-react';

interface ProductCardProps {
  key?: any;
  product: Product;
  onViewDetails: (id: number) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity: number, e?: React.MouseEvent) => void;
  onToggleWishlist: (id: number) => void;
  isWishlisted: boolean;
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onQuickAdd,
}: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate normalized point values: from -0.5 to +0.5
    const px = (e.clientX - rect.left) / width - 0.5;
    const py = (e.clientY - rect.top) / height - 0.5;

    // Direct degrees of rotation (max 15 degrees)
    setTilt({
      x: -py * 20, // Rotate around horizontal axis
      y: px * 20,  // Rotate around vertical axis
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col bg-[#11111A]/60 border border-white/5 overflow-hidden group select-none transition-all duration-300 ease-out hover:border-[#E94560]/30 hover:shadow-[0_15px_35px_rgba(233,69,96,0.15)] filter backdrop-blur-md"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${isHovered ? '8px' : '0px'})`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Aspect crop area for image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
        {/* Promo Badge */}
        {product.originalPrice > product.price && (
          <div className="absolute top-4 left-4 z-10 bg-[#E94560] text-white text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 font-bold shadow-lg">
            SALE -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white backdrop-blur-md transition-all duration-300 hover:bg-[#E94560] hover:border-transparent hover:scale-110 active:scale-95"
          aria-label="Wishlist"
        >
          <Heart
            className={`w-4.5 h-4.5 transition-colors duration-300 ${
              isWishlisted ? 'fill-white stroke-white' : 'stroke-white group-hover:stroke-stone-200'
            }`}
          />
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 bg-stone-900"
          loading="lazy"
        />

        {/* Dark subtle overlay on hover to bring actions to front */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Slide-Up Hover Interactivity Container */}
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
          <button
            onClick={() => onViewDetails(product.id)}
            className="w-full py-3 bg-white text-black font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-white/95 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
          >
            <Eye className="w-4 h-4" />
            Quick Inspect
          </button>
          
          <button
            onClick={(e) => onQuickAdd(product, e)}
            className="w-full py-3 bg-[#E94560] text-white font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#ff5674] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-target-add"
          >
            <ShoppingCart className="w-4 h-4" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Item info deck */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] text-stone-500 font-mono uppercase tracking-widest">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5 text-[#FFD700]">
            <Star className="w-3 h-3 fill-current stroke-current" />
            <span className="text-[11px] font-mono tracking-wider text-stone-300">{product.rating}</span>
          </div>
        </div>

        <h3
          onClick={() => onViewDetails(product.id)}
          className="text-white hover:text-[#E94560] font-sans text-base font-medium tracking-wide mb-3 transition-colors duration-200 cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-white font-mono text-base font-bold">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-stone-500 line-through font-mono text-xs">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-mono uppercase tracking-wider ${
            product.stock <= 15 ? 'text-amber-500 animate-pulse' : 'text-stone-500'
          }`}>
            {product.stock <= 15 ? `Only ${product.stock} Left` : 'In Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}
