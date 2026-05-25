export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  rating: number;
  reviews: number;
  colors: string[];
  sizes: string[];
  stock: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  cardName: string;
  cardNumber: string; // Formatted
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  active: boolean;
}

export type Page = 'home' | 'shop' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'admin';

export interface StoreState {
  cart: CartItem[];
  wishlist: number[]; // Product ids
  currentPage: Page;
  selectedProductId: number | null;
  adminLoggedIn: boolean;
  searchQuery: string;
  filters: {
    category: string;
    sort: string;
    priceMax: number;
    ratingMin: number;
  };
  checkout: {
    step: number;
    shippingName: string;
    shippingEmail: string;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingZip: string;
    cardName: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
  };
  couponCode: string;
  appliedDiscount: number; // Percentage
  adminTab: 'dashboard' | 'products' | 'orders' | 'settings';
  storeSettings: {
    storeName: string;
    currency: string;
    taxRate: number;
    maintenanceMode: boolean;
    allowGuestCheckout: boolean;
    emailNotifications: boolean;
  };
}
