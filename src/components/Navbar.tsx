import React, { useState, useEffect } from 'react';
import { Page, CartItem } from '../types';
import { ShoppingBag, Search, Heart, User, Menu, X, ArrowUpRight } from 'lucide-react';
import { toast } from './Toast';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  cart: CartItem[];
  wishlist: number[];
  adminLoggedIn: boolean;
  onCartToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({
  currentPage,
  setCurrentPage,
  cart,
  wishlist,
  adminLoggedIn,
  onCartToggle,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setCurrentPage('shop');
      setSearchOpen(false);
    }
  };

  const navLinks: { label: string; page: Page }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Shop', page: 'shop' },
    { label: 'Bag', page: 'cart' },
    { label: 'Profile', page: 'admin' },
  ];

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 select-none ${
        scrolled
          ? 'bg-[#0A0A0F]/90 border-b border-white/5 py-4 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
          : 'bg-transparent py-5'
      }`}
    >
      {/* Scroll tracker indicator bar at top */}
      <div className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#0F3460] via-[#E94560] to-[#FFD700] transition-all duration-300" style={{
        width: scrolled ? `${Math.min(100, (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)}%` : '0%'
      }} />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        
        {/* LOGO AREA */}
        <div
          onClick={() => {
            setCurrentPage('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="relative w-8 h-8 border border-[#E94560]/40 flex items-center justify-center transition-transform duration-500 group-hover:rotate-45">
            <span className="text-white text-[10px] tracking-widest font-mono font-bold group-hover:-rotate-45 transition-transform duration-500">O</span>
          </div>
          <span className="font-serif text-white tracking-[0.2em] font-bold text-lg leading-none uppercase">
            Obsidian <span className="text-[#E94560] text-sm">Lux</span>
          </span>
        </div>

        {/* NAVIGATION LINKS (DESKTOP) */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                setCurrentPage(link.page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative font-sans text-[11px] font-bold tracking-[0.25em] uppercase pb-1 cursor-pointer select-none transition-colors duration-300 ${
                currentPage === link.page
                  ? 'text-[#E94560]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {link.label}
              {currentPage === link.page && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#E94560]" />
              )}
            </button>
          ))}
        </div>

        {/* CONTROLS (ICONS) */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick search input overlay */}
          <div className="relative flex items-center">
            <div
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center ${
                searchOpen ? 'w-48 sm:w-60 border-b border-[#E94560] mr-2' : 'w-0'
              }`}
            >
              <input
                type="text"
                placeholder="Search collection ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full bg-transparent border-none text-white font-sans text-xs py-1 px-1 focus:outline-none placeholder-stone-600 uppercase tracking-widest"
              />
            </div>
            
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-stone-300 hover:text-white transition-colors p-1.5 cursor-pointer relative"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Whislist Indicator link */}
          <button
            onClick={() => {
              setCurrentPage('shop');
              toast("Showing filtered items ...", "info");
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="text-stone-300 hover:text-white transition-colors p-1.5 cursor-pointer relative"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#E94560] rounded-full animate-ping" />
            )}
          </button>

          {/* Sliding shopping cart drawer clicker */}
          <button
            onClick={onCartToggle}
            className="text-stone-300 hover:text-white transition-colors p-1.5 cursor-pointer relative group-bounce"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-[#E94560] text-white text-[9px] font-mono font-bold flex items-center justify-center px-1 rounded-full border border-[#0A0A0F] animate-bounce">
                {totalItems}
              </span>
            )}
          </button>

          {/* User Profile shortcut / Admin entry */}
          <button
            onClick={() => setCurrentPage('admin')}
            className={`text-stone-300 hover:text-white transition-colors p-1.5 cursor-pointer hidden sm:block ${
              adminLoggedIn ? 'text-[#E94560]' : ''
            }`}
            aria-label="Admin Page"
          >
            <User className="w-5 h-5" />
          </button>

          {/* MOBILE NAVIGATION HAMBURGER */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-stone-300 hover:text-white md:hidden transition-colors p-1.5 cursor-pointer"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* FULL COVER SCREEN MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-[#0A0A0F]/98 backdrop-blur-2xl flex flex-col items-center justify-center md:hidden animate-fade-in p-6">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 text-stone-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col items-center gap-10 text-center">
            {navLinks.map((link, idx) => (
              <button
                key={link.label}
                onClick={() => {
                  setCurrentPage(link.page);
                  setMobileMenuOpen(false);
                }}
                className="group relative flex items-center gap-3 text-2xl font-serif font-medium text-white hover:text-[#E94560] tracking-widest uppercase transition-all duration-300"
                style={{
                  animation: `slide-up-item 0.5s ease-out forwards ${idx * 0.1}s`,
                  opacity: 0,
                  transform: 'translateY(20px)',
                }}
              >
                {link.label}
                <ArrowUpRight className="w-5 h-5 text-stone-700 group-hover:text-[#E94560] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </button>
            ))}
            
            <button
              onClick={() => {
                setCurrentPage('admin');
                setMobileMenuOpen(false);
              }}
              className="text-stone-500 font-sans text-xs tracking-[0.3em] font-bold uppercase mt-12 hover:text-[#E94560]"
              style={{
                animation: `slide-up-item 0.5s ease-out forwards 0.4s`,
                opacity: 0,
                transform: 'translateY(20px)',
              }}
            >
              CLIENT PROFILE & ADMIN
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
