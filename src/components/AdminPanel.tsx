import React, { useState, useEffect } from 'react';
import { Product, Order, Page } from '../types';
import { 
  Lock, LogOut, Check, X, ShieldAlert, BarChart3, Package, ShoppingCart, 
  Settings, ArrowRight, Trash2, Edit3, Plus, RefreshCw, 
  User, Mail, MapPin, ClipboardList, ShoppingBag, 
  ChevronDown, ChevronUp, Key, ShieldCheck, Fingerprint, Smartphone, Shield, Clock
} from 'lucide-react';
import { toast } from './Toast';

interface AdminPanelProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  adminLoggedIn: boolean;
  setAdminLoggedIn: (val: boolean) => void;
  setCurrentPage: (page: Page) => void;
}

export default function AdminPanel({
  products,
  setProducts,
  orders,
  setOrders,
  adminLoggedIn,
  setAdminLoggedIn,
  setCurrentPage,
}: AdminPanelProps) {
  // Login Panel State
  const [password, setPassword] = useState('');
  const [shaking, setShaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'kpi' | 'products' | 'orders' | 'settings'>('kpi');

  // Unified User Portal Tab Segment (Customer Profile or Admin Vault Log)
  const [portalMode, setPortalMode] = useState<'customer' | 'admin'>('customer');

  // Custom Authentication Modes
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Multi-Factor Authentication States
  const [pendingMfaUser, setPendingMfaUser] = useState<{ email: string; name: string; isAdmin: boolean; requiresTotp?: boolean; requiresPasskey?: boolean } | null>(null);
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
  const [inputEmailOtp, setInputEmailOtp] = useState('');
  const [currentTotpCode, setCurrentTotpCode] = useState('583 910');
  const [inputTotp, setInputTotp] = useState('');
  const [passkeyStatus, setPasskeyStatus] = useState<'none' | 'scanning' | 'verified'>('none');
  const [totpCountdown, setTotpCountdown] = useState(30);

  // Google OIDC States
  const [showGoogleOidcPopup, setShowGoogleOidcPopup] = useState(false);
  const [oidcLoading, setOidcLoading] = useState(false);

  // Authenticator Setup Modal State
  const [showTotpSetupModal, setShowTotpSetupModal] = useState(false);
  const [setupTotpCode, setSetupTotpCode] = useState('483 912');
  const [confirmSetupTotpInput, setConfirmSetupTotpInput] = useState('');

  // Security Suggestion Notice Dismissed
  const [dismissSecurityNotice, setDismissSecurityNotice] = useState(() => {
    return localStorage.getItem('obsidian_dismiss_security_notice') === 'true';
  });

  const [clientTotpEnabled, setClientTotpEnabled] = useState(false);
  const [clientPasskeyEnabled, setClientPasskeyEnabled] = useState(false);

  // Customer Profile State
  const [customerEmail, setCustomerEmail] = useState(() => {
    return localStorage.getItem('obsidian_customer_email') || 'kmoon5330@gmail.com';
  });
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('obsidian_customer_name') || 'Karl Moon';
  });
  const [customerAddress, setCustomerAddress] = useState(() => {
    return localStorage.getItem('obsidian_customer_address') || '88 Galaxy Way, Suite-B';
  });
  const [customerCity, setCustomerCity] = useState(() => {
    return localStorage.getItem('obsidian_customer_city') || 'Seoul';
  });
  const [customerCountry, setCustomerCountry] = useState(() => {
    return localStorage.getItem('obsidian_customer_country') || 'South Korea';
  });
  const [customerZip, setCustomerZip] = useState(() => {
    return localStorage.getItem('obsidian_customer_zip') || '06120';
  });
  const [customerLoggedIn, setCustomerLoggedIn] = useState(() => {
    return localStorage.getItem('obsidian_customer_logged_in') !== 'false';
  });

  // Track expanded order in history list
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Sign In values state
  const [inputEmail, setInputEmail] = useState('');

  // Local Accounts Database helper
  const getRegisteredUsers = (): Array<{email: string; password: string; name: string}> => {
    const raw = localStorage.getItem('obsidian_registered_users');
    if (!raw) {
      const defaultUsers = [
        { email: 'kmoon5330@gmail.com', password: 'mypassword', name: 'Karl Moon' },
        { email: 'sherlock@scotlandyard.gov', password: 'mypassword', name: 'Sherlock Holmes' }
      ];
      localStorage.setItem('obsidian_registered_users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  // Synchronize dynamic status of security options based on the active session email
  useEffect(() => {
    if (customerEmail) {
      setClientTotpEnabled(localStorage.getItem(`obsidian_totp_enabled_${customerEmail.toLowerCase()}`) === 'true');
      setClientPasskeyEnabled(localStorage.getItem(`obsidian_passkey_enabled_${customerEmail.toLowerCase()}`) === 'true');
    }
  }, [customerEmail, customerLoggedIn]);

  // Keep Authenticator TOTP refreshed & dynamic
  useEffect(() => {
    if (!pendingMfaUser) return;

    const interval = setInterval(() => {
      setTotpCountdown((prev) => {
        if (prev <= 1) {
          const part1 = Math.floor(100 + Math.random() * 900).toString();
          const part2 = Math.floor(100 + Math.random() * 900).toString();
          setCurrentTotpCode(`${part1} ${part2}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingMfaUser]);

  // Keep setup TOTP seed updated
  useEffect(() => {
    if (!showTotpSetupModal) return;
    const interval = setInterval(() => {
      const part1 = Math.floor(100 + Math.random() * 900).toString();
      const part2 = Math.floor(100 + Math.random() * 900).toString();
      setSetupTotpCode(`${part1} ${part2}`);
    }, 10000);
    return () => clearInterval(interval);
  }, [showTotpSetupModal]);

  const handleGoogleOidcLogin = () => {
    setShowGoogleOidcPopup(true);
    setOidcLoading(false);
  };

  const handleUnifiedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail) return;

    const emailToUse = inputEmail.trim();
    const emailToCompare = emailToUse.toLowerCase();
    const passedKey = password.trim();

    // Check Admin Credentials
    const isAdminId = emailToCompare === 'admin' || emailToCompare === 'admin@obsidian.com';

    if (isAdminId) {
      const isAdminKey = passedKey === 'admin123';
      if (isAdminKey) {
        // Direct Login without multi-factor authentication requirements
        setAdminLoggedIn(true);
        setInputEmail('');
        setPassword('');
        toast("Access Granted. Authorized Workspace opened.", "success");
        return;
      } else {
        setShaking(true);
        toast("Invalid administrator security key.", "error");
        setTimeout(() => setShaking(false), 500);
        return;
      }
    }

    // Customer Authentication Flow
    const registeredUsers = getRegisteredUsers();

    if (isRegistering) {
      if (passedKey !== confirmPassword.trim()) {
        setShaking(true);
        toast("Passwords do not match.", "error");
        setTimeout(() => setShaking(false), 500);
        return;
      }
      if (passedKey.length < 4) {
        toast("Password must be at least 4 characters long.", "error");
        return;
      }
      if (registeredUsers.some(u => u.email.toLowerCase() === emailToCompare)) {
        toast("This email is already registered.", "error");
        return;
      }

      const defaultName = emailToUse.split('@')[0];
      const newAccount = { email: emailToUse, password: passedKey, name: defaultName };
      const updatedList = [...registeredUsers, newAccount];
      localStorage.setItem('obsidian_registered_users', JSON.stringify(updatedList));

      // Query security levels configured on this brand new customer profile (default: only email OTP required)
      const userTotpActive = localStorage.getItem(`obsidian_totp_enabled_${emailToCompare}`) === 'true';
      const userPasskeyActive = localStorage.getItem(`obsidian_passkey_enabled_${emailToCompare}`) === 'true';

      // Trigger MFA immediately after registering
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(token);
      setPendingMfaUser({ 
        email: emailToUse, 
        name: defaultName, 
        isAdmin: false,
        requiresTotp: userTotpActive,
        requiresPasskey: userPasskeyActive
      });
      
      setInputEmailOtp('');
      setInputTotp('');
      setPasskeyStatus('none');
      setIsRegistering(false); // Reset mode

      toast(`🔐 [REGISTRATION DISPATCHED] Profile registered! Confirming secure delivery. Verification OTP: ${token}`, "success");
    } else {
      // Login mode
      const foundUser = registeredUsers.find(u => u.email.toLowerCase() === emailToCompare);
      if (!foundUser) {
        setShaking(true);
        toast("Credential verification failed. No candidate profile found.", "error");
        setTimeout(() => setShaking(false), 500);
        return;
      }

      if (foundUser.password !== passedKey) {
        setShaking(true);
        toast("Invalid password credentials.", "error");
        setTimeout(() => setShaking(false), 500);
        return;
      }

      // Query user-specific optional security variables
      const userTotpActive = localStorage.getItem(`obsidian_totp_enabled_${emailToCompare}`) === 'true';
      const userPasskeyActive = localStorage.getItem(`obsidian_passkey_enabled_${emailToCompare}`) === 'true';

      // Password matches! Launch MFA
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(token);
      setPendingMfaUser({ 
        email: foundUser.email, 
        name: foundUser.name, 
        isAdmin: false,
        requiresTotp: userTotpActive,
        requiresPasskey: userPasskeyActive
      });
      
      setInputEmailOtp('');
      setInputTotp('');
      setPasskeyStatus('none');

      toast(`🔐 [DISPATCHED] Secure OIDC-linked Email OTP transmitted. Code is: ${token}`, "success");
    }
  };

  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingMfaUser) return;

    // Validate Email OTP Code (Always required for profile security)
    if (inputEmailOtp.trim() !== generatedEmailOtp && inputEmailOtp.trim() !== '123456') {
      setShaking(true);
      toast("Incorrect email security verification code token.", "error");
      setTimeout(() => setShaking(false), 500);
      return;
    }

    // Validate Google Authenticator TOTP ONLY if explicitly required on profile settings
    if (pendingMfaUser.requiresTotp) {
      const cleanInputTotp = inputTotp.trim().replace(/\s+/g, '');
      const cleanExpectedTotp = currentTotpCode.replace(/\s+/g, '');
      if (cleanInputTotp !== cleanExpectedTotp && cleanInputTotp !== '123456') {
        setShaking(true);
        toast("Incorrect entry key for Google Authenticator TOTP synchronization.", "error");
        setTimeout(() => setShaking(false), 500);
        return;
      }
    }

    // Validate Biometric Passkey ONLY if explicitly required on profile settings
    if (pendingMfaUser.requiresPasskey) {
      if (passkeyStatus !== 'verified') {
        setShaking(true);
        toast("Ensure your hardware biometric Passkey verification is certified.", "error");
        setTimeout(() => setShaking(false), 500);
        return;
      }
    }

    // All Secure Factors Cleared! Complete Sign-in Session
    const verifiedUser = pendingMfaUser;
    setPendingMfaUser(null);

    if (verifiedUser.isAdmin) {
      setAdminLoggedIn(true);
      toast("Access Granted. Authorized Workspace opened.", "success");
    } else {
      setCustomerEmail(verifiedUser.email);
      setCustomerName(verifiedUser.name);
      setCustomerLoggedIn(true);

      localStorage.setItem('obsidian_customer_email', verifiedUser.email);
      localStorage.setItem('obsidian_customer_name', verifiedUser.name);
      localStorage.setItem('obsidian_customer_logged_in', 'true');

      toast(`Access Granted. Welcome back, ${verifiedUser.name}.`, "success");
    }

    // Clear main inputs
    setInputEmail('');
    setPassword('');
  };

  const handleBiometricHandshake = () => {
    if (passkeyStatus === 'verified') return;
    setPasskeyStatus('scanning');
    toast("Establishing hardware biometric security handshake...", "info");
    
    setTimeout(() => {
      setPasskeyStatus('verified');
      toast("Device biometric passkey verified. Cryptographic signature verified.", "success");
    }, 1500);
  };

  const handleCustomerLogout = () => {
    setCustomerLoggedIn(false);
    localStorage.setItem('obsidian_customer_logged_in', 'false');
    toast("Logged out of customer profile", "info");
  };

  const handleSaveCustomerProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('obsidian_customer_name', customerName);
    localStorage.setItem('obsidian_customer_email', customerEmail);
    localStorage.setItem('obsidian_customer_address', customerAddress);
    localStorage.setItem('obsidian_customer_city', customerCity);
    localStorage.setItem('obsidian_customer_country', customerCountry);
    localStorage.setItem('obsidian_customer_zip', customerZip);
    toast("Profile delivery address files successfully encrypted & saved.", "success");
  };

  // Product actions State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(55);
  const [newProdCategory, setNewProdCategory] = useState('Tops');
  const [newProdStock, setNewProdStock] = useState<number>(50);

  // Store setting controls State
  const [storeName, setStoreName] = useState('Obsidian Lux Store');
  const [taxRate, setTaxRate] = useState<number>(8);
  const [maintenance, setMaintenance] = useState(false);
  const [guestCheckout, setGuestCheckout] = useState(true);

  const handleLogout = () => {
    setAdminLoggedIn(false);
    setPassword('');
    toast("Session closed. Vault secured.", "info");
  };

  const deleteProduct = (id: number) => {
    if (confirm("Permanently archive this product category?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast("Product removed from index", "success");
    }
  };

  const updateStock = (id: number, val: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, val) } : p))
    );
    toast("Warehouse stock modified", "success");
  };

  const updateOrderStatus = (id: string, status: 'Pending' | 'Shipped' | 'Delivered') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    toast(`Order ${id} is now ${status}`, "success");
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newPr: Product = {
      id: Date.now(),
      name: newProdName,
      price: newProdPrice,
      originalPrice: newProdPrice + 20,
      category: newProdCategory,
      rating: 4.8,
      reviews: 1,
      colors: ["#000000", "#FFFFFF"],
      sizes: ["S", "M", "L", "XL"],
      stock: newProdStock,
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&auto=format&fit=crop",
    };

    setProducts((prev) => [newPr, ...prev]);
    setShowAddModal(false);
    setNewProdName('');
    toast("Catalog expanded successfully", "success");
  };

  // KPI calculations
  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const lowStockCount = products.filter((p) => p.stock <= 15).length;

  const customerOrders = orders.filter(
    (o) => o.customerEmail.trim().toLowerCase() === customerEmail.trim().toLowerCase()
  );

  if (!adminLoggedIn) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 select-none bg-[#09090D] relative overflow-hidden flex flex-col justify-start items-center">
        {/* Abstract vector backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[140px] -z-10 animate-pulse duration-5000" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0F3460]/10 rounded-full blur-[140px] -z-10 animate-pulse duration-5000" />

        <div className="w-full max-w-4xl z-20 flex justify-center">
          {customerLoggedIn ? (
            /* --- CUSTOMER PORTAL --- */
            <div className="w-full bg-[#11111A]/95 border border-white/5 p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative">
              
              {/* Logo & Welcome Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono tracking-widest text-[#E94560] font-bold">CLIENT ACCESS DESK</span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  </div>
                  <h2 className="text-white font-serif text-3xl font-extrabold tracking-wide">
                    Welcome Back, <span className="text-[#E94560]">{customerName}</span>
                  </h2>
                  <p className="text-stone-500 font-mono text-[10px] tracking-widest uppercase mt-0.5">
                    Client ID: {customerEmail} • OBSIDIAN VIP STATUS Verified
                  </p>
                </div>
                
                <button
                  onClick={handleCustomerLogout}
                  className="px-4 py-2 border border-white/10 hover:border-rose-500/40 text-stone-400 hover:text-rose-400 text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Delivery Address Dossier Form & Dynamic Security Suite */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                  
                  {/* Google OIDC Security Recommendation Notice Banner */}
                  {!dismissSecurityNotice && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 font-mono text-[9px] relative select-text">
                      <button
                        onClick={() => {
                          setDismissSecurityNotice(true);
                          localStorage.setItem('obsidian_dismiss_security_notice', 'true');
                        }}
                        className="absolute top-2.5 right-2.5 text-stone-500 hover:text-white cursor-pointer"
                        title="Dismiss Security Recommendation"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex gap-2 items-start uppercase pr-4 text-amber-500">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
                        <div>
                          <span className="font-bold block">RECOMMENDED CLIENT TELEMETRY:</span>
                          <p className="text-stone-400 mt-1.5 lowercase leading-normal font-sans">
                            For enhanced account vault security, pair your profile using <strong className="text-white font-mono font-bold text-[9px]">Google OIDC Federated login</strong> or enable <strong className="text-white font-mono font-bold text-[9px]">Google Authenticator (TOTP)</strong> below to fully guarantee secure checkout access with zero shared passwords.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Info */}
                  <div className="bg-black/40 border border-white/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-[#E94560]" />
                      <h3 className="text-white text-xs font-mono uppercase tracking-widest font-bold">Shipping Address Dossier</h3>
                    </div>
                    
                    <form onSubmit={handleSaveCustomerProfile} className="space-y-4 font-sans text-xs">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-stone-500 font-mono tracking-wider block font-bold">Full Destination Name</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#E94560]/40 uppercase"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-stone-500 font-mono tracking-wider block font-bold">Register Email Address</label>
                        <input
                          type="email"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#E94560]/40"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-stone-500 font-mono tracking-wider block font-bold">Street Address & Suite</label>
                        <input
                          type="text"
                          required
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#E94560]/40 uppercase"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-stone-500 font-mono tracking-wider block font-bold">City Location</label>
                          <input
                            type="text"
                            required
                            value={customerCity}
                            onChange={(e) => setCustomerCity(e.target.value)}
                            className="w-full bg-[#121220] border border-white/10 text-stone-200 text-xs px-3 py-2.5 focus:outline-none focus:border-[#E94560]/40 uppercase"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-stone-500 font-mono tracking-wider block font-bold">Zip Code</label>
                          <input
                            type="text"
                            required
                            value={customerZip}
                            onChange={(e) => setCustomerZip(e.target.value)}
                            className="w-full bg-[#121220] border border-white/10 text-stone-200 text-xs px-3 py-2.5 focus:outline-none focus:border-[#E94560]/40 uppercase font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-stone-500 font-mono tracking-wider block font-bold">State / Country</label>
                        <input
                          type="text"
                          required
                          value={customerCountry}
                          onChange={(e) => setCustomerCountry(e.target.value)}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-3.5 py-2.5 focus:outline-none focus:border-[#E94560]/40 uppercase"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 mt-2 bg-white hover:bg-[#E94560] hover:text-white text-black font-sans text-[10px] tracking-widest font-bold uppercase transition-all duration-300 cursor-pointer shadow-md"
                      >
                        Lock Delivery Details
                      </button>
                    </form>
                  </div>

                  {/* Client Vault Security Settings Card */}
                  <div className="bg-black/40 border border-white/5 p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                      <Shield className="w-4 h-4 text-[#E94560]" />
                      <h3 className="text-white text-xs font-mono uppercase tracking-widest font-bold">Profile Vault & Security</h3>
                    </div>

                    <div className="space-y-4 select-text">
                      {/* Setting 1: Google Authenticator */}
                      <div className="flex items-start justify-between gap-3 font-sans text-xs">
                        <div className="space-y-1 pr-2">
                          <span className="font-bold text-stone-300 block uppercase tracking-wide">Google Authenticator (TOTP)</span>
                          <span className="text-[9px] text-stone-500 block font-mono">Requires dynamic 6-digit verification code token at next sign-in.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-1">
                          <input 
                            type="checkbox" 
                            checked={clientTotpEnabled} 
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                // Open Setup Wizard
                                setShowTotpSetupModal(true);
                              } else {
                                setClientTotpEnabled(false);
                                localStorage.setItem(`obsidian_totp_enabled_${customerEmail.toLowerCase()}`, 'false');
                                toast("Google Authenticator requirements deactivated.", "info");
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-500 peer-checked:after:bg-white after:border-stone-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E94560]" />
                        </label>
                      </div>

                      {/* Setting 2: Biometric Passkey */}
                      <div className="flex items-start justify-between gap-3 font-sans text-xs pt-3.5 border-t border-white/5">
                        <div className="space-y-1 pr-2">
                          <span className="font-bold text-stone-300 block uppercase tracking-wide">WebAuthn Biometric Passkey</span>
                          <span className="text-[9px] text-stone-500 block font-mono">Secures the vault through biometric hardware scanning handshakes.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-1">
                          <input 
                            type="checkbox" 
                            checked={clientPasskeyEnabled} 
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                // Simulated Scan Setup
                                toast("Establishing hardware biometric security handshake setup...", "info");
                                setTimeout(() => {
                                  setClientPasskeyEnabled(true);
                                  localStorage.setItem(`obsidian_passkey_enabled_${customerEmail.toLowerCase()}`, 'true');
                                  toast("WebAuthn Cryptographic profile registered as active login rule!", "success");
                                }, 1200);
                              } else {
                                setClientPasskeyEnabled(false);
                                localStorage.setItem(`obsidian_passkey_enabled_${customerEmail.toLowerCase()}`, 'false');
                                toast("Biometric Passkey requirements deactivated.", "info");
                              }
                            }}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-stone-500 peer-checked:after:bg-white after:border-stone-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E94560]" />
                        </label>
                      </div>

                      {/* Setting 3: Google Federated Identity Link Status */}
                      <div className="pt-3.5 border-t border-white/5 font-mono text-[10px] space-y-2">
                        <div className="flex justify-between items-center text-stone-500">
                          <span>OIDC CLOUD IDENTITY LINK:</span>
                          <span className="text-white bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[8px]">ACTIVE ACCREDITATION</span>
                        </div>
                        <div className="text-[9px] text-stone-400 font-sans">
                          Session verified via <span className="text-[#E94560] font-mono">accounts.google.com</span>. Passwordless login link active.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Column: Order History & Visual Tracking Progress */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-[#E94560]" />
                      <h3 className="text-white text-xs font-mono uppercase tracking-widest font-bold">Order History Ledger ({customerOrders.length})</h3>
                    </div>
                    <span className="text-[9px] font-mono text-stone-500 uppercase">realtime tracking synced</span>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 select-text custom-scrollbar">
                    {customerOrders.length === 0 ? (
                      <div className="text-center py-16 border border-white/5 bg-black/30 p-8">
                        <ShoppingBag className="w-10 h-10 text-stone-700 mx-auto mb-3.5" />
                        <p className="text-white font-serif text-sm uppercase tracking-wider">No Orders Logs Listed</p>
                        <p className="text-stone-500 text-[10px] font-mono uppercase mt-1.5 leading-relaxed max-w-sm mx-auto">
                          No recorded transactions registered under <span className="text-[#E94560] font-bold">{customerEmail}</span>.
                        </p>
                        
                        <button
                          onClick={() => setCurrentPage('shop')}
                          className="mt-6 px-4 py-2 border border-[#E94560] text-white hover:bg-[#E94560] font-mono text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Explore Noir Shop
                        </button>
                      </div>
                    ) : (
                      customerOrders.map((ord) => {
                        const isExpanded = expandedOrderId === ord.id;
                        return (
                          <div key={ord.id} className="border border-white/5 bg-stone-900/30 font-mono text-xs overflow-hidden">
                            {/* Order click bar */}
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                            >
                              <div>
                                <span className="text-[#E94560] font-bold text-sm block">{ord.id}</span>
                                <span className="text-[10px] text-stone-500 block mt-0.5">{ord.date}</span>
                              </div>
                              <div className="text-right flex items-center gap-4">
                                <div>
                                  <span className="text-white font-bold block">${ord.total.toFixed(2)}</span>
                                  <span className={`inline-block px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide mt-1 ${
                                    ord.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    ord.status === 'Shipped' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                              </div>
                            </div>

                            {/* Progress shipment Stepper Indicator */}
                            <div className="px-5 pb-5 pt-3 border-t border-white/5 bg-black/20 select-none">
                              <div className="relative flex justify-between items-center max-w-md mx-auto py-5">
                                {/* Line background */}
                                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-stone-800 -translate-y-1/2 z-0" />
                                
                                {/* Line active fill */}
                                <div className="absolute top-1/2 left-0 h-[2px] bg-[#E94560] -translate-y-1/2 z-0 transition-all duration-1000" style={{
                                  width: ord.status === 'Delivered' ? '100%' : ord.status === 'Shipped' ? '50%' : '5%'
                                }} />

                                {/* Process Step 1: Pending */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold tracking-widest transition-all bg-[#E94560] border-transparent text-white shadow-[0_0_10px_rgba(233,69,96,0.5)]">
                                    1
                                  </div>
                                  <span className="text-[8px] mt-1.5 uppercase font-bold text-stone-400 tracking-wider">Accepted</span>
                                </div>

                                {/* Process Step 2: Shipped */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold tracking-widest transition-all ${
                                    ord.status === 'Shipped' || ord.status === 'Delivered'
                                      ? 'bg-[#E94560] border-transparent text-white shadow-[0_0_10px_rgba(233,69,96,0.5)]'
                                      : 'bg-stone-900 border-white/10 text-stone-600'
                                  }`}>
                                    {ord.status === 'Shipped' || ord.status === 'Delivered' ? <Check className="w-3.5 h-3.5" /> : '2'}
                                  </div>
                                  <span className={`text-[8px] mt-1.5 uppercase font-bold tracking-wider ${
                                    ord.status === 'Shipped' || ord.status === 'Delivered' ? 'text-stone-300' : 'text-stone-600'
                                  }`}>In Transit</span>
                                </div>

                                {/* Process Step 3: Delivered */}
                                <div className="relative z-10 flex flex-col items-center">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] font-bold tracking-widest transition-all ${
                                    ord.status === 'Delivered'
                                      ? 'bg-emerald-500 border-transparent text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                      : 'bg-stone-900 border-white/10 text-stone-600'
                                  }`}>
                                    {ord.status === 'Delivered' ? <Check className="w-3.5 h-3.5" /> : '3'}
                                  </div>
                                  <span className={`text-[8px] mt-1.5 uppercase font-bold tracking-wider ${
                                    ord.status === 'Delivered' ? 'text-emerald-400' : 'text-stone-600'
                                  }`}>Delivered</span>
                                </div>
                              </div>
                            </div>

                            {/* Products list inside Order (collapsible content) */}
                            {isExpanded && (
                              <div className="p-4 border-t border-white/5 bg-black/40 font-sans space-y-4">
                                <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Manifest item details</span>
                                
                                <div className="space-y-3">
                                  {ord.items.map((item, idX) => (
                                    <div key={idX} className="flex items-center gap-3.5 py-2 border-b border-white/5 last:border-0">
                                      <img src={item.product.image} className="w-10 h-12 object-cover bg-stone-900 border border-white/10 shrink-0" alt="" />
                                      <div className="flex-grow min-w-0">
                                        <p className="text-white text-xs font-semibold uppercase tracking-wider truncate">{item.product.name}</p>
                                        <p className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-2">
                                          <span>SIZE: <strong className="text-stone-300">{item.selectedSize}</strong></span>
                                          <span>•</span>
                                          <span className="flex items-center gap-1">
                                            COLOR: 
                                            <span className="w-2.5 h-2.5 rounded-full inline-block border border-white/10 shadow-sm" style={{ backgroundColor: item.selectedColor }} />
                                          </span>
                                        </p>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-white text-xs font-mono font-bold">${item.product.price}</p>
                                        <p className="text-[10px] text-stone-500 mt-0.5 font-mono">QTY {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2 border-t border-white/5 font-mono text-[10px] text-stone-400 flex flex-col gap-1 text-right max-w-xs ml-auto">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>${ord.subtotal.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Courier Freight</span>
                                    <span>{ord.shipping === 0 ? 'FREE' : `$${ord.shipping.toFixed(2)}`}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-white/5 pb-1 mb-1 font-sans">
                                    <span>Settle Tax</span>
                                    <span>${ord.tax.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs font-bold text-[#E94560]">
                                    <span>Invoice Total</span>
                                    <span>${ord.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-full max-w-xl bg-[#11111A]/95 p-8 border border-white/5 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-md relative ${
              shaking ? 'animate-shake' : ''
            }`}>
              {pendingMfaUser ? (
                /* --- MULTI-FACTOR SECURITY AUTHORIZATION PANEL --- */
                <div className="space-y-6">
                  <div className="text-center space-y-3 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 border border-[#E94560]/30 bg-[#E94560]/10 rounded-full flex items-center justify-center mx-auto text-[#E94560]">
                      <Shield className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-white font-serif text-xl font-bold uppercase tracking-widest">
                        SECURE MFA ACCESS
                      </h2>
                      <p className="text-stone-500 font-mono text-[9px] tracking-wider uppercase mt-1">
                        Verifying credentials for <span className="text-white font-bold">{pendingMfaUser.email}</span>
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleVerifyMfa} className="space-y-6 font-mono text-xs select-text">
                    
                    {/* FACTOR 1: EMAIL OTP AUTH */}
                    <div className="p-4 border border-white/5 bg-black/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-[#E94560]" />
                          Level 1: Email OTP Verification
                        </span>
                        <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 uppercase tracking-wider">
                          Token Required
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          required
                          placeholder="ENTER 6-DIGIT CODE..."
                          value={inputEmailOtp}
                          onChange={(e) => setInputEmailOtp(e.target.value)}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-center text-sm px-4 py-3 focus:outline-none focus:border-[#E94560]/50 tracking-[0.25em]"
                        />
                        <div className="flex justify-between items-center text-[9px] text-stone-500 font-sans">
                          <span>Check your simulated notification</span>
                          <button
                            type="button"
                            onClick={() => {
                              const token = Math.floor(100000 + Math.random() * 900000).toString();
                              setGeneratedEmailOtp(token);
                              toast(`[SECURITY OTP] Transmission updated: ${token}`, "success");
                            }}
                            className="text-[#E94560] hover:underline cursor-pointer"
                          >
                            Re-send Code
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* FACTOR 2: GOOGLE AUTHENTICATOR TOTP */}
                    {pendingMfaUser.requiresTotp && (
                      <div className="p-4 border border-white/5 bg-black/30 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-2">
                            <Smartphone className="w-3.5 h-3.5 text-[#E94560]" />
                            Level 2: Google Authenticator (TOTP)
                          </span>
                          <span className="text-[8px] bg-[#E94560]/15 text-[#E94560] border border-[#E94560]/20 px-1.5 py-0.5 uppercase tracking-wider">
                            Active Sync Required
                          </span>
                        </div>

                        <div className="space-y-2">
                          <input
                            type="text"
                            required
                            placeholder="CODE OR '123456'"
                            value={inputTotp}
                            onChange={(e) => setInputTotp(e.target.value)}
                            className="w-full bg-[#151525] border border-white/10 text-stone-200 text-center text-sm px-4 py-3 focus:outline-none focus:border-[#E94560]/50 tracking-[0.25em]"
                          />
                          <p className="text-[8px] text-stone-500 font-sans leading-normal">
                            Synchronize your authenticator keys to ensure dynamic credential verification.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* FACTOR 3: WEB-AUTHN PASSKEY BIOMETRICS */}
                    {pendingMfaUser.requiresPasskey && (
                      <div className="p-4 border border-white/5 bg-black/30 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-2">
                            <Fingerprint className="w-3.5 h-3.5 text-[#E94560]" />
                            Level 3: Device Passkey (WebAuthn)
                          </span>
                          <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase ${
                            passkeyStatus === 'verified' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-stone-500/10 text-stone-400 border border-white/5'
                          }`}>
                            {passkeyStatus === 'verified' ? 'Handshake Granted' : 'Scan Required'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleBiometricHandshake}
                          className={`w-full py-4 border text-[10px] uppercase font-mono tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                            passkeyStatus === 'verified'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                              : passkeyStatus === 'scanning'
                              ? 'bg-[#E94560]/10 border-[#E94560]/40 text-[#E94560] animate-pulse'
                              : 'bg-[#151525] border-white/10 text-stone-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {passkeyStatus === 'scanning' ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-[#E94560]" />
                              <span>SCANNING REGISTERED DEVICE SENSORS...</span>
                            </>
                          ) : passkeyStatus === 'verified' ? (
                            <>
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              <span>WebAuthn Passkey Verified</span>
                            </>
                          ) : (
                            <>
                              <Fingerprint className="w-4 h-4 text-[#E94560]" />
                              <span>TOUCH / FACE SCAN SECURE PASSKEY</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="space-y-3 pt-2">
                      <button
                        type="submit"
                        className="w-full py-4 bg-white hover:bg-[#E94560] hover:text-white hover:shadow-[0_0_20px_rgba(233,69,96,0.3)] text-black font-sans text-xs tracking-[0.25em] font-bold uppercase transition-all cursor-pointer shadow-lg"
                      >
                        Authorize & Grant access
                      </button>

                      <div className="flex justify-between items-center text-[9px] text-stone-600 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setPendingMfaUser(null);
                            setPassword('');
                          }}
                          className="hover:text-white hover:underline cursor-pointer"
                        >
                          ← Abort Verification Session
                        </button>
                      </div>
                    </div>

                  </form>
                </div>
              ) : (
                /* --- UNIFIED SECURE CREDENTIAL ENTRY FORM --- */
                <div>
                  <div className="text-center space-y-4 mb-4">
                    <div className="w-14 h-14 border border-rose-500/30 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-[#E94560]">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-white font-serif text-2xl font-bold uppercase tracking-wider">
                        {isRegistering ? 'Create Account' : 'Profile Portal'}
                      </h2>
                      <p className="text-stone-500 font-mono text-[10px] tracking-widest uppercase mt-1">
                        Secure Client Identification Mode
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUnifiedLogin} className="space-y-5 select-text font-sans">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                        Email Address
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ENTER REGISTERED EMAIL ADDRESS..."
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="w-full bg-[#151525] border border-white/10 text-stone-200 text-sm px-4 py-3 focus:outline-none focus:border-rose-500/50 font-mono placeholder-stone-700"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                          Password passcode
                        </label>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#151525] border border-white/10 text-stone-200 text-sm px-4 py-3 focus:outline-none focus:border-[#E94560]/50 text-center font-mono placeholder-stone-700 uppercase tracking-widest"
                      />
                    </div>

                    {isRegistering && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">
                            Confirm Password passcode
                          </label>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-sm px-4 py-3 focus:outline-none focus:border-[#E94560]/50 text-center font-mono placeholder-stone-700 uppercase tracking-widest"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-4 mt-2 bg-white hover:bg-[#E94560] hover:text-white hover:shadow-[0_0_20px_rgba(233,69,96,0.3)] text-black font-sans text-xs tracking-[0.25em] font-bold uppercase transition-all cursor-pointer shadow-lg"
                    >
                      {isRegistering ? 'Register Client File' : 'Verify Session'}
                    </button>

                    <div className="relative flex py-1 items-center justify-center">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-3 text-stone-600 text-[8px] tracking-widest font-mono uppercase">OR SECURE OIDC ACCESS</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleOidcLogin}
                      className="w-full py-3.5 border border-white/10 hover:border-white/30 bg-black/40 text-stone-200 font-sans text-[11px] tracking-widest font-medium uppercase transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md select-none"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.357-2.847-6.357-6.357 0-3.51 2.847-6.357 6.357-6.357 1.517 0 2.898.544 3.974 1.442l3.153-3.153C19.123 2.115 15.866 1 12.24 1s-6.9 2.628-9.04 6.84C1 10.285 1 13.715 3.2 16.16c2.14 4.212 5.414 6.84 9.04 6.84 5.863 0 10.56-4.148 10.56-10.56 0-.743-.08-1.428-.24-2.155H12.24z"
                        />
                      </svg>
                      <span>Sign In with Google</span>
                    </button>
                    <p className="text-[8px] text-stone-600 font-sans text-center leading-normal">
                      Google authentication securely verifies identities via OpenID Connect (OIDC) without sharing sensitive passwords with third-party applications.
                    </p>
                  </form>

                  <div className="mt-5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-stone-400 hover:text-white font-mono text-[10px] tracking-widest uppercase transition-colors uppercase underline cursor-pointer"
                    >
                      {isRegistering 
                        ? 'Already have an account? Sign In' 
                        : 'Need an account? Create a new account'
                      }
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentPage('home')}
                    className="w-full text-center text-stone-500 hover:text-white font-mono text-[10px] tracking-widest uppercase mt-6 block cursor-pointer"
                  >
                    ← Return to Storefront
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 font-sans text-stone-300 md:flex select-none">
      
      {/* SIDE NAVIGATION BAR */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-[#0E0E14] shrink-0 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#E94560] block font-bold">ADMIN VAULT</span>
            <h2 className="text-white font-serif text-xl font-bold uppercase tracking-wide mt-1">
              Store Control
            </h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { id: 'kpi', label: 'Monitor Desk', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'products', label: 'Catalog Index', icon: <Package className="w-4 h-4" /> },
              { id: 'orders', label: 'Invoices Desk', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'settings', label: 'Config Panel', icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3.5 text-xs font-mono uppercase tracking-widest border transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#E94560] border-transparent text-white shadow-md'
                    : 'bg-transparent border-transparent text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 mt-8 border border-white/10 hover:border-rose-500/40 text-stone-400 hover:text-rose-400 text-xs font-mono uppercase tracking-widest cursor-pointer transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Close Session</span>
        </button>
      </aside>

      {/* CORE WORK AREA CONTROLLER */}
      <main className="flex-grow p-6 sm:p-10 overflow-x-hidden">
        
        {/* MONITOR DESK / KPI GRID */}
        {activeTab === 'kpi' && (
          <div className="space-y-10 animate-fade-in text-stone-300">
            <div className="flex justify-between items-center border-b border-white/5 pb-5">
              <div>
                <h3 className="text-white font-serif text-2xl font-bold uppercase tracking-wide">
                  Monitor Desk
                </h3>
                <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest mt-1">
                  REAL-TIME OVERVIEW METRICS INDEX
                </p>
              </div>
            </div>

            {/* KPI 4 CARDS MATRIX */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Gross Revenue', value: `$${totalRevenue.toFixed(2)}`, trend: 'M+ 18.2%', graph: 'M10,40 Q25,10 40,30 T70,10 t30,25' },
                { label: 'Active Invoices', value: orders.length, trend: 'L+ 4.1%', graph: 'M10,25 Q25,45 40,20 T70,35 t30,5' },
                { label: 'Products In Store', value: products.length, trend: 'Catalog items', graph: 'M10,35 Q25,20 40,35 T70,25 t30,10' },
                { label: 'Stock Alerts', value: lowStockCount, trend: 'Low item warning', graph: 'M10,12 Q25,35 40,15 T70,40 t30,22' },
              ].map((card, idx) => (
                <div key={idx} className="bg-[#11111A]/60 border border-white/5 p-5 relative overflow-hidden backdrop-blur-md">
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest block mb-2">{card.label}</span>
                  <p className="text-white font-mono text-2xl font-extrabold leading-tight mb-2 select-text">{card.value}</p>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">{card.trend}</span>
                  
                  {/* BEAUTIFUL SPARKLINE EMBED (SVG Vector math line) */}
                  <div className="absolute right-4 bottom-2.5 w-24 h-12 opacity-60">
                    <svg className="w-full h-full stroke-[#E94560] fill-none" viewBox="0 0 120 50">
                      <path d={card.graph} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* EXPANDED INVOICES RECORD LISTING */}
            <div className="space-y-4">
              <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">Recent Registered Transactions</span>
              <div className="overflow-x-auto border border-white/5 bg-[#0E0E14]/40 custom-scrollbar">
                <table className="w-full text-left font-mono text-xs text-stone-400">
                  <thead className="bg-[#11111A] text-white uppercase text-[10px] tracking-wider border-b border-white/5">
                    <tr>
                      <th className="p-4">Invoice Code</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Sum Paid</th>
                      <th className="p-4">Courier Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-stone-600 uppercase font-mono">No invoice logs registered yet</td>
                      </tr>
                    ) : (
                      orders.slice(0, 5).map((ord) => (
                        <tr key={ord.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="p-4 text-[#E94560] font-bold">{ord.id}</td>
                          <td className="p-4">{ord.date}</td>
                          <td className="p-4 font-sans text-white font-medium">{ord.customerName}</td>
                          <td className="p-4 text-white">${ord.total.toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              ord.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              ord.status === 'Shipped' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATALOG INDEX / CRUD PANEL */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in text-stone-300">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
              <div>
                <h3 className="text-white font-serif text-2xl font-bold uppercase tracking-wide">
                  Catalog Index
                </h3>
                <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest mt-1">
                  OVERSEE AND EXPAND APPAREL SELECTION
                </p>
              </div>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[#E94560] text-white font-sans text-xs tracking-widest uppercase font-bold cursor-pointer hover:bg-[#ff5674] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {/* ADD PRODUCT MODAL INJECTOR */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
                <div className="w-full max-w-md bg-[#11111A] border border-white/10 p-6 flex flex-col uppercase relative animate-scale-up">
                  <button onClick={() => setShowAddModal(false)} className="absolute top-5 right-5 text-stone-500 hover:text-white">
                    <X className="w-5.5 h-5.5" />
                  </button>
                  <h4 className="font-serif text-white font-bold text-lg mb-6 tracking-wide pb-3 border-b border-white/5">Expand Store Collection</h4>
                  
                  <form onSubmit={handleAddProduct} className="space-y-5 font-sans text-stone-300">
                    <div className="space-y-2">
                      <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">Apparel Name</label>
                      <input
                        type="text"
                        required
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 uppercase focus:outline-none focus:border-[#E94560]/50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">Price Code ($)</label>
                        <input
                          type="number"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Number(e.target.value))}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">Initial Stock</label>
                        <input
                          type="number"
                          required
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(Number(e.target.value))}
                          className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest font-bold">Category Line</label>
                      <select
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="w-full bg-[#151525] border border-white/10 text-stone-300 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50 outline-none cursor-pointer"
                      >
                        <option value="Tops">Tops</option>
                        <option value="Bottoms">Bottoms</option>
                        <option value="Outerwear">Outerwear</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Footwear">Footwear</option>
                      </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-5 py-3 border border-white/10 text-stone-400 hover:text-white transition-colors text-xs font-mono"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-[#E94560] text-white text-xs font-bold tracking-widest"
                      >
                        Create Item
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* PRODUCTS TABULAR INDEX LIST */}
            <div className="overflow-x-auto border border-white/5 bg-[#0E0E14]/40 custom-scrollbar">
              <table className="w-full text-left font-mono text-xs text-stone-400">
                <thead className="bg-[#11111A] text-white uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4">Apparel Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price Base</th>
                    <th className="p-4">Stock Value</th>
                    <th className="p-4">Actions Toggle</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.image} className="w-8 h-10 object-cover bg-stone-900 border" alt="" />
                        <span className="font-sans text-white font-medium">{p.name}</span>
                      </td>
                      <td className="p-4 uppercase">{p.category}</td>
                      <td className="p-4 text-white font-bold">${p.price}</td>
                      <td className="p-4 select-text">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateStock(p.id, p.stock - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold border border-white/5 hover:border-white/10 transition-colors cursor-pointer text-sm shrink-0"
                            title="Decrease stock by 1"
                          >
                            -
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            value={p.stock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              updateStock(p.id, isNaN(val) ? 0 : val);
                            }}
                            className={`w-14 bg-[#151525] border border-white/10 text-center font-bold font-mono text-xs py-1 px-1 focus:outline-none focus:border-[#E94560]/50 shrink-0 ${
                              p.stock <= 15 ? 'text-amber-500' : 'text-white'
                            }`}
                            title="Directly enter stock quantity"
                          />
                          
                          <button
                            onClick={() => updateStock(p.id, p.stock + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-bold border border-white/5 hover:border-white/10 transition-colors cursor-pointer text-sm shrink-0"
                            title="Increase stock by 1"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-4 select-none">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="text-stone-500 hover:text-rose-400 font-sans tracking-widest uppercase transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in text-stone-300">
            <div>
              <h3 className="text-white font-serif text-2xl font-bold uppercase tracking-wide">
                Recent Orders Ledger
              </h3>
              <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest mt-1">
                OVERSEE DISPATCH AND UPDATE SHIPPING TRACKING STATUSES
              </p>
            </div>

            <div className="overflow-x-auto border border-white/5 bg-[#0E0E14]/40 custom-scrollbar">
              <table className="w-full text-left font-mono text-xs text-stone-400">
                <thead className="bg-[#11111A] text-white uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-4">Invoice Code</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Total Paid</th>
                    <th className="p-4">Progress State</th>
                    <th className="p-4">Modify Tracker</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-stone-600 uppercase">No active invoices</td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <span className="text-[#E94560] font-bold block">{ord.id}</span>
                          <span className="text-[10px] text-stone-500 block">{ord.date}</span>
                        </td>
                        <td className="p-4 font-sans text-stone-300">
                          <p className="text-white font-medium">{ord.customerName}</p>
                          <p className="text-xs text-stone-500 truncate max-w-44 leading-tight">{ord.address}, {ord.city}</p>
                        </td>
                        <td className="p-4 text-white font-bold">${ord.total.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            ord.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            ord.status === 'Shipped' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 select-none">
                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                            className="bg-[#151525] border border-white/10 text-stone-300 font-sans text-[10px] py-1.5 px-2 uppercase outline-none cursor-pointer focus:border-[#E94560]/40"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS PANEL TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in text-stone-300 max-w-2xl">
            <div>
              <h3 className="text-white font-serif text-2xl font-bold uppercase tracking-wide">
                Config Panel
              </h3>
              <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest mt-1">
                OVERWRITE BRANDING PREFERENCES AND METRIC MODIFIERS
              </p>
            </div>

            <div className="space-y-6 bg-[#11111A]/40 border border-white/5 p-6 backdrop-blur-md font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">Store Headline Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] text-stone-500 font-mono uppercase tracking-widest block font-bold">Global Settle Tax Code (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full bg-[#151525] border border-white/10 text-stone-200 text-xs px-4 py-3 focus:outline-none focus:border-[#E94560]/50"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-white/5 text-xs text-stone-300">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block font-bold text-white uppercase tracking-wider mb-0.5">Under Construction Overlay</span>
                    <span className="text-[10px] text-stone-500 uppercase font-mono tracking-wide">Secure landing screen bypass activation</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={() => setMaintenance(!maintenance)}
                    className="w-4 h-4 accent-[#E94560] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <span className="block font-bold text-white uppercase tracking-wider mb-0.5">Allow Guest Checkout</span>
                    <span className="text-[10px] text-stone-500 uppercase font-mono tracking-wide">Require customer accounts registration verification</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={guestCheckout}
                    onChange={() => setGuestCheckout(!guestCheckout)}
                    className="w-4 h-4 accent-[#E94560] cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-white/5">
                <button
                  type="button"
                  onClick={() => toast("Branding preferences updated", "success")}
                  className="px-8 py-3.5 bg-white text-black font-sans text-xs tracking-widest uppercase font-bold hover:bg-[#E94560] hover:text-white transition-all cursor-pointer"
                >
                  Save Tweak Configurations
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* GOOGLE INTEGRATION ONE-CLICK OIDC POPUP DIALOG */}
      {showGoogleOidcPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-[#0E0E14] border border-white/10 p-6 space-y-6 shadow-[0_0_80px_rgba(0,0,0,0.95)] relative text-stone-200">
            <button
              onClick={() => {
                setShowGoogleOidcPopup(false);
                setOidcLoading(false);
              }}
              className="absolute top-4.5 right-4.5 text-stone-550 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              {/* Google Brand Color Dots */}
              <div className="flex justify-center gap-1.5 pt-2">
                <span className="w-2.5 h-2.5 bg-[#4285F4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-[#EA4335] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-[#FBBC05] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-2.5 h-2.5 bg-[#34A853] rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
              </div>
              <h4 className="text-white text-base font-serif font-bold uppercase tracking-widest pt-1">
                Google OIDC Vault Link
              </h4>
              <p className="text-[9px] text-[#E94560] font-mono uppercase tracking-widest">
                accounts.google.com authentication
              </p>
            </div>

            {oidcLoading ? (
              <div className="py-8 text-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#E94560] mx-auto" />
                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest animate-pulse">
                  Exchanging federated OIDC assertion tokens...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] text-stone-400 leading-relaxed text-center font-sans font-medium">
                  Select a Google account credential below to synchronize with Obsidian Couture passwordless authentication.
                </p>

                {/* Candidate Credential list */}
                <div className="space-y-2.5">
                  {[
                    { email: 'kmoon5330@gmail.com', name: 'Karl Moon' },
                    { email: 'sherlock@scotlandyard.gov', name: 'Sherlock Holmes' }
                  ].map((cand) => (
                    <button
                      key={cand.email}
                      type="button"
                      onClick={() => {
                        setOidcLoading(true);
                        setTimeout(() => {
                          setCustomerEmail(cand.email);
                          setCustomerName(cand.name);
                          setCustomerLoggedIn(true);

                          localStorage.setItem('obsidian_customer_email', cand.email);
                          localStorage.setItem('obsidian_customer_name', cand.name);
                          localStorage.setItem('obsidian_customer_logged_in', 'true');

                          toast(`Session authenticated securely via OIDC Federated profile for ${cand.name}!`, "success");
                          setOidcLoading(false);
                          setShowGoogleOidcPopup(false);
                        }, 1300);
                      }}
                      className="w-full flex items-center justify-between p-3.5 border border-white/5 bg-black/40 hover:bg-[#E94560]/10 hover:border-[#E94560]/35 transition-all text-left group cursor-pointer"
                    >
                      <div className="min-w-0">
                        <span className="text-xs text-white uppercase font-bold block">{cand.name}</span>
                        <span className="text-[9px] text-stone-500 font-mono block truncate">{cand.email}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-[#E94560] transition-colors" />
                    </button>
                  ))}
                </div>

                <div className="text-[8px] text-stone-600 font-sans text-center leading-normal pt-2 border-t border-white/5 select-none">
                  By completing federated assertion, Google authorizes sharing your certified profile with this merchant vault. No credentials are leaked or stored.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE AUTHENTICATOR SETUP MODAL DIALOG */}
      {showTotpSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-sm bg-[#0E0E14] border border-white/10 p-6 space-y-5 rounded-none shadow-[0_0_80px_rgba(0,0,0,0.95)] relative text-stone-200">
            <button 
              onClick={() => setShowTotpSetupModal(false)}
              className="absolute top-4.5 right-4.5 text-stone-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1 pb-3 border-b border-white/5">
              <h4 className="text-white text-base font-serif font-bold uppercase tracking-wider">Setup Authenticator Key</h4>
              <p className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Enroll Profile Factor Level 2</p>
            </div>

            <div className="space-y-4 text-stone-300">
              <p className="text-[10px] text-stone-400 leading-relaxed text-center font-sans font-medium">
                Open your Authenticator application (e.g. Google Authenticator) on your mobile device and scan the unique QR barcode below.
              </p>

              {/* Dynamic QR Barcode Simulator */}
              <div className="w-32 h-32 bg-stone-950 border border-white/10 mx-auto flex items-center justify-center relative p-3">
                <div className="w-full h-full relative" style={{
                  backgroundImage: "radial-gradient(#FFF 2px, transparent 2px), radial-gradient(#FFF 2px, transparent 2px)",
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 4px 4px"
                }}>
                  <div className="absolute top-1 left-1 w-6 h-6 border-2 border-white bg-black flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white" />
                  </div>
                  <div className="absolute top-1 right-1 w-6 h-6 border-2 border-white bg-black flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white" />
                  </div>
                  <div className="absolute bottom-1 left-1 w-6 h-6 border-2 border-white bg-black flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-white" />
                  </div>
                  <div className="absolute inset-0 bg-[#E94560]/5 animate-pulse" />
                </div>
              </div>

              {/* Manual Seed */}
              <div className="text-center space-y-1">
                <span className="text-[8px] text-stone-600 font-mono uppercase tracking-widest block font-bold">manual configuration seed key</span>
                <span className="font-mono text-[11px] text-stone-300 tracking-wider font-extrabold select-all select-none">
                  JBSW Y3DP EHPK 3PXP
                </span>
              </div>

              {/* Verification input */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex justify-between items-center text-[9px] font-mono text-stone-500">
                  <span>VERIFICATION CODE SEED VALUE:</span>
                  <span className="animate-pulse text-[#E94560] font-bold">ACTIVE: {setupTotpCode}</span>
                </div>
                <input
                  type="text"
                  placeholder="ENTER THE ABOVE ACTIVE CODE..."
                  value={confirmSetupTotpInput}
                  onChange={(e) => setConfirmSetupTotpInput(e.target.value)}
                  className="w-full bg-[#151525] border border-white/10 text-stone-200 text-center font-mono text-xs px-3 py-2.5 focus:outline-none focus:border-[#E94560]/50 tracking-[0.2em] outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTotpSetupModal(false);
                  setConfirmSetupTotpInput('');
                }}
                className="w-1/2 py-2.5 border border-white/10 hover:bg-white/5 text-stone-400 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const cleanedInput = confirmSetupTotpInput.trim().replace(/\s+/g, '');
                  const cleanedExpected = setupTotpCode.replace(/\s+/g, '');
                  if (cleanedInput === cleanedExpected || cleanedInput === '123456') {
                    setClientTotpEnabled(true);
                    localStorage.setItem(`obsidian_totp_enabled_${customerEmail.toLowerCase()}`, 'true');
                    setShowTotpSetupModal(false);
                    setConfirmSetupTotpInput('');
                    toast("Google Authenticator sync handshake certified successfully!", "success");
                  } else {
                    toast("Incorrect setup verification code. Please enter the active ticker code.", "error");
                  }
                }}
                className="w-1/2 py-2.5 bg-white text-black font-sans hover:bg-[#E94560] hover:text-white text-[10px] tracking-wider font-bold uppercase transition-all cursor-pointer shadow-md"
              >
                Save Factor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
