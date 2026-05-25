import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, Page } from './types';
import { products as initialProducts } from './data';
import ToastContainer, { toast } from './components/Toast';

// Subcomponents
import ThreeCanvas from './components/ThreeCanvas';
import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Hero from './components/Hero';
import ShopView from './components/ShopView';
import SingleProductView from './components/SingleProductView';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrderConfirmationView from './components/OrderConfirmationView';
import AdminPanel from './components/AdminPanel';

import { Star, ArrowUp, Mail, Instagram, Twitter, ShieldCheck } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(true);

  // States
  const [products, setProducts] = useState<Product[]>(() => {
    const local = localStorage.getItem('obsidian_products');
    return local ? JSON.parse(local) : initialProducts;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const local = localStorage.getItem('obsidian_cart');
    return local ? JSON.parse(local) : [];
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    const local = localStorage.getItem('obsidian_wishlist');
    return local ? JSON.parse(local) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('obsidian_orders');
    if (local) return JSON.parse(local);

    // High quality initial seeds
    return [
      {
        id: 'INV-2026-0041',
        customerName: 'James Moriarty',
        customerEmail: 'moriarty@london.net',
        address: '221B Baker St',
        city: 'London',
        country: 'United Kingdom',
        postalCode: 'NW1 6XE',
        cardName: 'JAMES MORIARTY',
        cardNumber: '•••• •••• •••• 1042',
        items: [
          {
            product: initialProducts[0], // Obsidian Tee
            quantity: 2,
            selectedColor: '#000000',
            selectedSize: 'L'
          },
          {
            product: initialProducts[3], // Eclipse Jacket
            quantity: 1,
            selectedColor: '#0A0A0F',
            selectedSize: 'XL'
          }
        ],
        subtotal: 247.00,
        shipping: 0,
        tax: 19.76,
        total: 266.76,
        status: 'Pending',
        date: '2026-05-24'
      },
      {
        id: 'INV-2026-0092',
        customerName: 'Sherlock Holmes',
        customerEmail: 'sherlock@scotlandyard.gov',
        address: '10 Downing St',
        city: 'London',
        country: 'United Kingdom',
        postalCode: 'SW1A 2AA',
        cardName: 'SHERLOCK HOLMES',
        cardNumber: '•••• •••• •••• 8841',
        items: [
          {
            product: initialProducts[1], // Midnight Hoodie
            quantity: 1,
            selectedColor: '#1A1A2E',
            selectedSize: 'M'
          }
        ],
        subtotal: 89.00,
        shipping: 15,
        tax: 7.12,
        total: 111.12,
        status: 'Shipped',
        date: '2026-05-23'
      }
    ];
  });

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // Percent
  const [cartOpen, setCartOpen] = useState(false);
  const [confirmedOrderCode, setConfirmedOrderCode] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Synchronizers
  useEffect(() => {
    localStorage.setItem('obsidian_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('obsidian_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('obsidian_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('obsidian_orders', JSON.stringify(orders));
  }, [orders]);

  // Read hash routing on load
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '');
      if (['home', 'shop', 'cart', 'admin'].includes(hash)) {
        setCurrentPage(hash as Page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Update hash dynamically
  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.location.hash = `#/${page}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shopping handlers
  const handleAddToCart = (product: Product, color: string, size: string, quantity = 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check inventory ceiling
    const existingIdx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
    );

    if (existingIdx > -1) {
      const updated = [...cart];
      const newQty = updated[existingIdx].quantity + quantity;
      if (newQty > product.stock) {
        toast("Cannot exceed available warehouse stock limit", "error");
        return;
      }
      updated[existingIdx].quantity = newQty;
      setCart(updated);
    } else {
      if (quantity > product.stock) {
        toast("Cannot exceed available warehouse stock limit", "error");
        return;
      }
      setCart((prev) => [...prev, { product, quantity, selectedColor: color, selectedSize: size }]);
    }

    toast(`Added "${product.name}" (${size}) to your Bag!`, "success");
    setCartOpen(true);
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    handleAddToCart(product, product.colors[0], product.sizes[1] || 'M', 1, e);
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const item = updated[index];
    const targetQty = item.quantity + delta;

    if (targetQty <= 0) {
      handleRemoveItem(index);
      return;
    }

    if (targetQty > item.product.stock) {
      toast("Unavailable warehouse stock limit reached", "info");
      return;
    }

    item.quantity = targetQty;
    setCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    const deletedName = cart[index].product.name;
    setCart((prev) => prev.filter((_, idx) => idx !== index));
    toast(`Archived "${deletedName}" from your Bag`, "info");
  };

  const handleToggleWishlist = (id: number) => {
    const isPresent = wishlist.includes(id);
    if (isPresent) {
      setWishlist((prev) => prev.filter((item) => item !== id));
      toast("Removed item from wishlists", "info");
    } else {
      setWishlist((prev) => [...prev, id]);
      toast("Added item to wishlists", "success");
    }
  };

  // Checkout handler
  const handlePlaceOrder = (customerDetails: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
    zip: string;
    cardName: string;
    cardNumber: string;
  }) => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discountAmount = subtotal * (appliedDiscount / 100);
    const finalSubtotal = subtotal - discountAmount;
    const tax = finalSubtotal * 0.08;
    const shipping = finalSubtotal >= 150 ? 0 : 15;
    const total = finalSubtotal + tax + shipping;

    const orderCode = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderCode,
      customerName: customerDetails.name,
      customerEmail: customerDetails.email,
      address: customerDetails.address,
      city: customerDetails.city,
      country: customerDetails.country,
      postalCode: customerDetails.zip,
      cardName: customerDetails.cardName,
      cardNumber: `•••• •••• •••• ${customerDetails.cardNumber.slice(-4)}`,
      items: cart,
      subtotal,
      shipping,
      tax,
      total,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };

    // Deduct database stock levels
    setProducts((prev) =>
      prev.map((p) => {
        const bought = cart.find((item) => item.product.id === p.id);
        if (bought) {
          return { ...p, stock: Math.max(0, p.stock - bought.quantity) };
        }
        return p;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setConfirmedOrderCode(orderCode);
    setCart([]); // Clear cart
    navigateTo('confirmation');
  };

  const handleInspectProduct = (id: number) => {
    if (id === 999) {
      navigateTo('shop');
      setSelectedProductId(null);
    } else {
      setSelectedProductId(id);
      navigateTo('product');
    }
  };

  // Testimonials slide State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonials = [
    {
      name: 'Elena Rostova',
      role: 'Fashion Curator, Paris',
      quote: 'Obsidian Co. captures of high tailoring silhouettes perfectly. The fabrics drape like liquid night.',
      rating: 5,
    },
    {
      name: 'Marcus Vane',
      role: 'Creative Director',
      quote: 'The Shadow Shorts and Eclipse Windbreaker represent unmatched structural beauty in streetwear.',
      rating: 5,
    },
    {
      name: 'Sora Takahashi',
      role: 'Tokyo Design Archivist',
      quote: 'Exceptional details. Minimalist closures, heavy organic combed yarns, absolute noir luxury.',
      rating: 5,
    },
  ];

  // Newsletters form
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterSubmitting(true);
    setTimeout(() => {
      setNewsletterSubmitting(false);
      setNewsletterSuccess(true);
      toast("Branding newsletter verified. Discount Code: WELCOME10 dispatched.", "success");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen selection:bg-[#E94560] selection:text-white pb-0">
      
      {/* 1. INITIAL LOADING BANNER PRELOADER */}
      <Preloader onComplete={() => setLoading(false)} />

      {!loading && (
        <>
          {/* Background Decorative Elements for Sophisticated Dark Theme */}
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#E94560]/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
          <div className="absolute bottom-[-50px] left-[10%] w-[350px] h-[350px] bg-[#0F3460]/25 rounded-full blur-[100px] pointer-events-none z-0"></div>

          {/* Custom trailing cursor feedback */}
          <CustomCursor />

          {/* Interactive mathematical particle vector background */}
          <ThreeCanvas currentPage={currentPage} />

          {/* Core notification list stacked */}
          <ToastContainer />

          {/* Sliding Cart tray overlay */}
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={() => {
              setCartOpen(false);
              navigateTo('checkout');
            }}
          />

          {/* Fixed Head Navigation */}
          <Navbar
            currentPage={currentPage}
            setCurrentPage={navigateTo}
            cart={cart}
            wishlist={wishlist}
            adminLoggedIn={adminLoggedIn}
            onCartToggle={() => setCartOpen(!cartOpen)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* MAIN PAGE ROUTER FRAME */}
          <div className="relative min-h-screen text-white flex flex-col pt-0">
            {currentPage === 'home' && (
              <div className="flex flex-col">
                <Hero
                  onShopClick={() => navigateTo('shop')}
                  onExploreClick={() => {
                    const el = document.getElementById('featured-lookbook');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                />

                {/* MARQUEE TICKER ROW 1 - FORWARD LOOP */}
                <div className="relative w-full overflow-hidden bg-[#0A0A0F] border-t border-b border-white/5 py-5 select-none z-10">
                  <div className="flex whitespace-nowrap animate-marquee hover-pause uppercase">
                    {[...Array(6)].map((_, i) => (
                      <span key={i} className="text-[11px] font-mono tracking-[0.3em] text-[#E94560] font-bold mx-8">
                        ★ FREE COMPLIMENTARY COURIER OVER $150 • NEW DROP DISPATCHED WEEKLY • EXTRAORDINARY TAILORING COLLECTION •
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2x2 FEATURED CATEGORIES Bento-Grid */}
                <section id="featured-lookbook" className="max-w-7xl mx-auto px-6 sm:px-8 py-24 w-full z-15">
                  <div className="text-center mb-16 uppercase">
                    <span className="text-[10px] text-[#E94560] font-mono tracking-widest font-bold block mb-1">
                      CHOOSE PATHS
                    </span>
                    <h2 className="text-white font-serif text-3xl sm:text-5xl font-semibold tracking-wide">
                      Featured Silhouettes
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      {
                        title: 'Tops Catalogue',
                        subtitle: 'Draped luxury basics engineered for weight.',
                        tag: 'Tops',
                        image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600&auto=format&fit=crop'
                      },
                      {
                        title: 'Bottoms Series',
                        subtitle: 'Constructed silhouettes capturing motion line.',
                        tag: 'Bottoms',
                        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'
                      },
                      {
                        title: 'Outerwear Shields',
                        subtitle: 'Pre-washed structural windbreakers and layers.',
                        tag: 'Outerwear',
                        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop'
                      },
                      {
                        title: 'Fine Ornaments',
                        subtitle: 'Cured full leather wallet folders and gear.',
                        tag: 'Accessories',
                        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop'
                      }
                    ].map((idx) => (
                      <div
                        key={idx.title}
                        onClick={() => {
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                          navigateTo('shop');
                        }}
                        className="relative aspect-video sm:aspect-square md:aspect-video w-full border border-white/5 bg-[#11111A] overflow-hidden group cursor-pointer shadow-lg"
                      >
                        <img
                          src={idx.image}
                          alt={idx.title}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-6 select-none uppercase">
                          <span className="text-[10px] font-mono text-[#E94560] font-bold tracking-widest block mb-1">{idx.tag} Collection</span>
                          <h3 className="text-white font-serif text-xl sm:text-2xl font-bold tracking-wide mb-1 transition-colors group-hover:text-[#E94560]">
                            {idx.title}
                          </h3>
                          <p className="text-stone-500 text-[10px] sm:text-xs tracking-wider max-w-sm line-clamp-1">{idx.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* BEST SELLERS HIGHLIGHTS ROW */}
                <section className="max-w-7xl mx-auto px-6 sm:px-8 py-16 w-full border-t border-white/5 z-15">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16 uppercase">
                    <div>
                      <span className="text-[10px] text-[#E94560] font-mono tracking-widest font-bold block mb-1">BEST SELLERS CATALOGUE</span>
                      <h2 className="text-white font-serif text-3xl sm:text-4xl font-semibold tracking-wide">
                        High Demand Highlight
                      </h2>
                    </div>
                    <button
                      onClick={() => navigateTo('shop')}
                      className="text-white hover:text-[#E94560] font-mono text-xs uppercase tracking-[0.25em] transition-all font-bold flex items-center gap-2 cursor-pointer pb-1 border-b"
                    >
                      <span>Explore catalogue</span>
                    </button>
                  </div>

                  {/* Stagger list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleInspectProduct(item.id)}
                        className="bg-[#11111A]/60 border border-white/5 p-4 flex flex-col hover:border-[#E94560]/30 transition-all cursor-pointer group hover:shadow-[0_15px_30px_rgba(233,69,96,0.12)] max-w-sm w-full mx-auto"
                      >
                        <div className="aspect-[3/4] overflow-hidden relative bg-black">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                          />
                          <div className="absolute top-3 left-3 bg-[#E94560] text-white text-[9px] font-mono tracking-widest font-bold uppercase px-2 py-0.5">
                            BEST
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2.5 mt-4">
                          <div>
                            <span className="text-[10px] text-stone-500 font-mono uppercase block">{item.category}</span>
                            <span className="text-white hover:text-[#E94560] text-sm uppercase tracking-wider font-semibold truncate max-w-36 block mt-0.5">{item.name}</span>
                          </div>
                          <span className="text-[#FFD700] font-mono text-xs font-bold shrink-0">${item.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* MARQUEE REVERSE BLOCK */}
                <div className="relative w-full overflow-hidden bg-[#0A0A0F] border-t border-b border-white/5 py-5 select-none z-10">
                  <div className="flex whitespace-nowrap animate-marquee-reverse hover-pause uppercase">
                    {[...Array(6)].map((_, i) => (
                      <span key={i} className="text-[11px] font-mono tracking-[0.3em] text-[#E94560] font-bold mx-8">
                        ★ EXCLUSIVE DROPS • VOID TEXTURES COMPILER • HANDMADE WORKMANSHIP IN SMALL BATCHES •
                      </span>
                    ))}
                  </div>
                </div>

                {/* CLIENT SLIDING TESTIMONIALS */}
                <section className="max-w-5xl mx-auto px-6 py-24 text-center z-15 w-full select-none">
                  <div className="space-y-8 max-w-2xl mx-auto relative px-4">
                    <div className="flex justify-center items-center gap-0.5 text-[#FFD700]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current stroke-current" />
                      ))}
                    </div>

                    <blockquote className="text-white font-serif text-xl sm:text-2xl lg:text-3xl tracking-wide leading-relaxed uppercase">
                      &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                    </blockquote>

                    <div className="space-y-1">
                      <cite className="text-white font-sans text-xs sm:text-sm font-semibold tracking-wider not-italic uppercase block">
                        {testimonials[activeTestimonial].name}
                      </cite>
                      <span className="text-stone-500 font-mono text-[10px] sm:text-xs tracking-widest uppercase block">
                        {testimonials[activeTestimonial].role}
                      </span>
                    </div>

                    {/* Manual bullet dots layout */}
                    <div className="flex justify-center items-center gap-3 pt-6 select-none">
                      {testimonials.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTestimonial(idx)}
                          className={`w-2.5 h-2.5 rounded-full border transition-all cursor-pointer ${
                            activeTestimonial === idx
                              ? 'bg-[#E94560] border-transparent scale-115 shadow-[0_0_8px_rgba(233,69,96,0.4)]'
                              : 'bg-transparent border-white/20'
                          }`}
                          aria-label={`Testimonial slide ${idx}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* FLOATING TEXT LABELS NEWSLETTER */}
                <section className="bg-stone-900/40 border-t border-b border-white/5 py-24 select-none w-full z-15 relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="max-w-2xl mx-auto px-6 text-center space-y-6">
                    <span className="text-[10px] text-[#E94560] font-mono tracking-widest font-bold block uppercase">OBSIDIAN ENVOY LIST</span>
                    <h2 className="text-white font-serif text-3xl sm:text-4xl font-semibold uppercase tracking-wide leading-tight">
                      Acquire Preferred Access
                    </h2>
                    
                    <p className="text-stone-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed uppercase tracking-wider">
                      Join the Obsidian Courier network to receive advance listings of forthcoming design drops and get a 10% discount code code directly.
                    </p>

                    {newsletterSuccess ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-widest">
                        ✓ Dispatched preferred access clearance codes to your inbox inbox. Use code <span className="text-white font-bold underline">WELCOME10</span>.
                      </div>
                    ) : (
                      <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 pt-4 max-w-md mx-auto">
                        <input
                          type="email"
                          required
                          placeholder="ENTER SECURE EMAIL ADDRESS..."
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="flex-grow bg-black/50 border border-white/10 text-white placeholder-stone-600 font-mono text-xs uppercase tracking-widest px-4 py-3.5 focus:outline-none focus:border-[#E94560]/50"
                        />
                        <button
                          type="submit"
                          disabled={newsletterSubmitting}
                          className="px-8 py-3.5 sm:py-0 bg-white text-black font-sans text-xs tracking-[0.2em] font-bold uppercase hover:bg-[#E94560] hover:text-white transition-all select-none cursor-pointer flex items-center justify-center gap-2"
                        >
                          {newsletterSubmitting ? 'Verifying...' : 'Acquire Codename'}
                        </button>
                      </form>
                    )}
                  </div>
                </section>
              </div>
            )}

            {currentPage === 'shop' && (
              <ShopView
                products={products}
                onViewDetails={handleInspectProduct}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                wishlist={wishlist}
                onQuickAdd={handleQuickAdd}
              />
            )}

            {currentPage === 'product' && selectedProductId !== null && (
              (() => {
                const targetProd = products.find((p) => p.id === selectedProductId);
                if (!targetProd) return <div className="py-24 text-center">Apparel Code Stale.</div>;
                const related = products.filter((p) => p.category === targetProd.category && p.id !== targetProd.id);
                
                return (
                  <SingleProductView
                    product={targetProd}
                    onAddToCart={(p, c, s, qty, e) => handleAddToCart(p, c, s, qty, e)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.includes(targetProd.id)}
                    relatedProducts={related}
                    onViewProduct={handleInspectProduct}
                  />
                );
              })()
            )}

            {currentPage === 'cart' && (
              <CartView
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onProceedToCheckout={() => navigateTo('checkout')}
                appliedDiscount={appliedDiscount}
                setAppliedDiscount={setAppliedDiscount}
                onContinueShopping={() => navigateTo('shop')}
              />
            )}

            {currentPage === 'checkout' && (
              <CheckoutView
                cart={cart}
                appliedDiscount={appliedDiscount}
                onPlaceOrder={handlePlaceOrder}
                onCancel={() => navigateTo('cart')}
              />
            )}

            {currentPage === 'confirmation' && (
              <OrderConfirmationView
                onContinueShopping={() => navigateTo('shop')}
                orderNumber={confirmedOrderCode}
              />
            )}

            {currentPage === 'admin' && (
              <AdminPanel
                products={products}
                setProducts={setProducts}
                orders={orders}
                setOrders={setOrders}
                adminLoggedIn={adminLoggedIn}
                setAdminLoggedIn={setAdminLoggedIn}
                setCurrentPage={navigateTo}
              />
            )}
          </div>

          {/* GLOBAL STYLIZED CARD FOOTER SECTION */}
          <footer className="bg-[#07070B] border-t border-white/5 py-16 text-stone-400 font-sans tracking-wide text-xs select-none">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left select-none pb-12 border-b border-white/5">
              
              {/* Box 1 Description */}
              <div className="space-y-4">
                <div onClick={() => navigateTo('home')} className="flex items-center justify-center md:justify-start gap-2 cursor-pointer group">
                  <div className="w-6 h-6 border border-[#E94560]/40 flex items-center justify-center rotate-45 group-hover:rotate-90 transition-transform">
                    <span className="text-white text-[8px] tracking-widest font-mono font-bold -rotate-45">O</span>
                  </div>
                  <span className="text-white font-serif tracking-widest font-semibold uppercase">Obsidian Lux</span>
                </div>
                <p className="text-stone-500 uppercase text-[10px] leading-relaxed">
                  Advanced geometric tailored garments born out of the void. Curated in small batches with strict focus lines.
                </p>
              </div>

              {/* Box 2 links Quick */}
              <div className="space-y-4 uppercase">
                <span className="text-white font-bold tracking-widest block font-mono text-[10px]">Quick Indices</span>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigateTo('home')} className="hover:text-white text-left text-[11px] block text-stone-500 uppercase cursor-pointer">Catalog Home</button>
                  <button onClick={() => navigateTo('shop')} className="hover:text-white text-left text-[11px] block text-stone-500 uppercase cursor-pointer">Launch Shop</button>
                  <button onClick={() => navigateTo('cart')} className="hover:text-white text-left text-[11px] block text-stone-500 uppercase cursor-pointer">Shopping Bag</button>
                </div>
              </div>

              {/* Box 3 client services info */}
              <div className="space-y-4 uppercase">
                <span className="text-white font-bold tracking-widest block font-mono text-[10px]">Client Services</span>
                <div className="flex flex-col gap-2">
                  <span className="text-stone-500 text-[11px] block">Vault Shipments policy</span>
                  <span className="text-stone-500 text-[11px] block">Settle Returns guidelines</span>
                  <span className="text-stone-500 text-[11px] block">Authentic product guarantee</span>
                </div>
              </div>

              {/* Box 4 social links */}
              <div className="space-y-4 uppercase">
                <span className="text-white font-bold tracking-widest block font-mono text-[10px]">Social Channels</span>
                <div className="flex justify-center md:justify-start items-center gap-4">
                  <a href="https://instagram.com" className="p-2 border border-white/10 text-stone-500 hover:text-white hover:border-[#E94560] hover:scale-105 transition-all">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="https://twitter.com" className="p-2 border border-white/10 text-stone-500 hover:text-white hover:border-[#E94560] hover:scale-105 transition-all">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="https://gmail.com" className="p-2 border border-white/10 text-stone-500 hover:text-white hover:border-[#E94560] hover:scale-105 transition-all">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar copyright & Admin */}
            <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 uppercase font-mono text-[10px] text-stone-600 text-center sm:text-left select-none">
              <div>
                © {new Date().getFullYear()} OBSIDIAN COUTURE INC. COMPLETED DISPATCH RIGHTS RESERVED.
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateTo('admin')}
                  className="hover:text-[#E94560] transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Account Portal & Vault</span>
                </button>
              </div>
            </div>
          </footer>

          {/* SCROLL-TO-TOP TRIGGER */}
          {showScrollTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-stone-900 border border-white/10 text-[#E94560] flex items-center justify-center hover:bg-[#E94560] hover:text-white transition-all scale-100 hover:scale-105 hover:rotate-12 cursor-pointer duration-300"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4.5 h-4.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
