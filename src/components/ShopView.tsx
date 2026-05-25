import React, { useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { Grid, List, SlidersHorizontal, ArrowUpDown, RefreshCw, X } from 'lucide-react';

interface ShopViewProps {
  products: Product[];
  onViewDetails: (id: number) => void;
  onAddToCart: (product: Product, color: string, size: string, quantity: number, e?: React.MouseEvent) => void;
  onToggleWishlist: (id: number) => void;
  wishlist: number[];
  onQuickAdd: (product: Product, e: React.MouseEvent) => void;
}

export default function ShopView({
  products,
  onViewDetails,
  onAddToCart,
  onToggleWishlist,
  wishlist,
  onQuickAdd,
}: ShopViewProps) {
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(200);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  const categories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Footwear'];

  // Clear filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setPriceRange(200);
    setMinRating(0);
    setSortBy('featured');
    setSearchQuery('');
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchPrice = p.price <= priceRange;
      const matchRating = p.rating >= minRating;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchPrice && matchRating && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default / Featured
      return a.id - b.id;
    });

  const isFilterActive = selectedCategory !== 'All' || priceRange < 200 || minRating > 0 || searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-28 select-none">
      
      {/* Search and view toggle row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5 mb-8">
        <div>
          <h2 className="text-white font-serif text-3xl sm:text-4xl font-semibold tracking-wide uppercase mb-1">
            Collection Shop
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-sans tracking-widest uppercase">
            EXPLORE THE FULL RANGE OF DESIGN STATEMENTS
          </p>
        </div>

        {/* Filters Top Bar */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Custom Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filter catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#11111A] border border-white/5 text-white placeholder-stone-600 font-sans text-xs uppercase tracking-widest px-4 py-3.5 focus:outline-none focus:border-[#E94560]/40 w-52 sm:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`flex items-center gap-2 px-4 py-3.5 border transition-all duration-300 text-xs font-mono uppercase tracking-widest cursor-pointer ${
              sidebarOpen 
                ? 'bg-[#E94560] text-white border-transparent' 
                : 'bg-[#11111A] text-[#E94560] border-white/5 hover:border-[#E94560]/40'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Layout buttons */}
          <div className="border border-white/5 flex items-center bg-[#11111A]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3.5 cursor-pointer border-r border-white/5 transition-colors ${
                viewMode === 'grid' ? 'text-[#E94560]' : 'text-stone-500 hover:text-stone-300'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3.5 cursor-pointer transition-colors ${
                viewMode === 'list' ? 'text-[#E94560]' : 'text-stone-500 hover:text-stone-300'
              }`}
              aria-label="List view"
            >
              <List className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* SIDEBAR FILTERS (Left on large screen, collapsible) */}
        {sidebarOpen && (
          <div className="lg:col-span-1 space-y-7 bg-[#11111A]/40 border border-white/5 p-6 backdrop-blur-md animate-fade-in text-stone-300">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="font-serif text-white font-bold tracking-wide text-sm uppercase">
                Refine Search
              </span>
              {isFilterActive && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-[#E94560] transition-colors uppercase font-mono tracking-wider cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category selection */}
            <div className="space-y-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">
                Category
              </span>
              <div className="flex flex-col gap-2.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left text-xs uppercase tracking-widest transition-colors font-medium cursor-pointer ${
                      selectedCategory === cat
                        ? 'text-[#E94560] font-bold pb-0.5'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-stone-500 tracking-widest">
                <span>Max Price</span>
                <span className="text-[#E94560] font-bold">${priceRange}</span>
              </div>
              <input
                type="range"
                min="35"
                max="200"
                step="5"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#E94560] cursor-pointer bg-stone-900 h-1.5 rounded-lg outline-none"
              />
            </div>

            {/* Ratings Radio Section */}
            <div className="space-y-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">
                Minimum Rating
              </span>
              <div className="flex flex-col gap-2">
                {[4.6, 4.7, 4.8, 4.9].map((rating) => (
                  <label key={rating} className="flex items-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider text-stone-400 hover:text-white">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === rating}
                      onChange={() => setMinRating(rating)}
                      className="accent-[#E94560] w-3.5 h-3.5"
                    />
                    <span>{rating}+ Star Rating</span>
                  </label>
                ))}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs uppercase tracking-wider text-stone-400 hover:text-white">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === 0}
                    onChange={() => setMinRating(0)}
                    className="accent-[#E94560] w-3.5 h-3.5"
                  />
                  <span>Show All Star Tiers</span>
                </label>
              </div>
            </div>

            {/* Sort Sorter */}
            <div className="space-y-3">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">
                Sorting
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#1A1A2E] border border-white/10 text-stone-300 font-sans text-xs uppercase tracking-widest py-3 px-4 outline-none focus:border-[#E94560]/40 cursor-pointer"
                >
                  <option value="featured">Featured Picks</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: Highest Reviews</option>
                </select>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-none text-stone-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS STREAM VIEWPORT */}
        <div className={`col-span-1 ${sidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {/* Active chips display and count */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <span className="text-stone-500 font-sans text-[11px] uppercase tracking-widest">
              Showing <span className="text-white font-bold">{filteredProducts.length}</span> results found
            </span>

            {/* Filter chips list */}
            {isFilterActive && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] font-sans text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory('All')} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {priceRange < 200 && (
                  <span className="inline-flex items-center gap-1 bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] font-sans text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                    &lt; ${priceRange}
                    <button onClick={() => setPriceRange(200)} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] font-sans text-[10px] uppercase font-bold tracking-wider px-2.5 py-1">
                    {minRating}+ Stars
                    <button onClick={() => setMinRating(0)} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Core listing */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 border border-dashed border-white/5 flex flex-col items-center justify-center text-center">
              <span className="text-stone-600 font-mono text-xs uppercase tracking-widest mb-2">
                Zero matching apparel found
              </span>
              <p className="text-stone-500 text-sm max-w-sm mb-6 leading-relaxed">
                Adjust the active price slider or categories selection filters to expand your search matching.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-[#E94560] text-[#E94560] font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#E94560] hover:text-white transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onViewDetails={onViewDetails}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(prod.id)}
                  onQuickAdd={onQuickAdd}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col sm:flex-row gap-6 p-5 bg-[#11111A]/60 border border-white/5 backdrop-blur-md hover:border-[#E94560]/30 transition-all duration-300"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full sm:w-44 h-56 object-cover bg-stone-900 border border-white/5"
                  />
                  <div className="flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#E94560]">
                        {prod.category}
                      </span>
                      <div className="text-[#FFD700] text-xs flex items-center gap-1.5">
                        <span>★</span>
                        <span className="font-mono text-stone-300">{prod.rating}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onViewDetails(prod.id)}
                      className="text-white hover:text-[#E94560] font-serif text-xl font-medium tracking-wide mb-3 transition-colors cursor-pointer"
                    >
                      {prod.name}
                    </h3>

                    <p className="text-stone-500 text-xs tracking-wider max-w-lg mb-6 leading-relaxed">
                      Designed with a dark obsidian aesthetic focusing on silhouette lines, structured collars, and elegant local tailoring. Perfect statement piece.
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-4">
                      <div className="flex items-end gap-2.5">
                        <span className="text-white font-mono text-lg font-bold">
                          ${prod.price.toFixed(2)}
                        </span>
                        {prod.originalPrice > prod.price && (
                          <span className="text-stone-600 line-through font-mono text-xs mb-0.5">
                            ${prod.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => onViewDetails(prod.id)}
                          className="px-5 py-3 border border-white/10 text-white font-sans text-[10px] tracking-[0.2em] font-semibold uppercase hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => onQuickAdd(prod, e)}
                          className="px-5 py-3 bg-[#E94560] text-white font-sans text-[10px] tracking-[0.2em] font-semibold uppercase hover:bg-[#ff5674] active:scale-95 transition-all cursor-pointer"
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
