import { Product, Coupon } from './types';

export const products: Product[] = [
  {
    id: 1,
    name: "Obsidian Tee",
    price: 49,
    originalPrice: 79,
    category: "Tops",
    rating: 4.8,
    reviews: 124,
    colors: ["#000000", "#FFFFFF", "#E94560"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 45,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Midnight Hoodie",
    price: 89,
    originalPrice: 129,
    category: "Outerwear",
    rating: 4.9,
    reviews: 89,
    colors: ["#1A1A2E", "#333333", "#8B0000"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 23,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Carbon Joggers",
    price: 69,
    originalPrice: 99,
    category: "Bottoms",
    rating: 4.7,
    reviews: 201,
    colors: ["#222222", "#555555", "#2C3E50"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 67,
    image: "https://images.unsplash.com/photo-1551854838-212c50b4c184?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Eclipse Jacket",
    price: 149,
    originalPrice: 199,
    category: "Outerwear",
    rating: 4.9,
    reviews: 56,
    colors: ["#0A0A0F", "#1C1C1C", "#2E4057"],
    sizes: ["S", "M", "L", "XL"],
    stock: 12,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Shadow Shorts",
    price: 45,
    originalPrice: 65,
    category: "Bottoms",
    rating: 4.6,
    reviews: 178,
    colors: ["#2C2C2C", "#4A4A4A", "#1A237E"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    stock: 89,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Void Longsleeve",
    price: 59,
    originalPrice: 85,
    category: "Tops",
    rating: 4.8,
    reviews: 93,
    colors: ["#000000", "#212121", "#880E4F"],
    sizes: ["S", "M", "L", "XL"],
    stock: 34,
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Phantom Cap",
    price: 35,
    originalPrice: 55,
    category: "Accessories",
    rating: 4.7,
    reviews: 267,
    colors: ["#000000", "#1B1B1B", "#BF360C"],
    sizes: ["One Size"],
    stock: 156,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Stealth Sneakers",
    price: 129,
    originalPrice: 179,
    category: "Footwear",
    rating: 4.9,
    reviews: 412,
    colors: ["#FFFFFF", "#000000", "#E94560"],
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    stock: 28,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 9,
    name: "Noir Windbreaker",
    price: 119,
    originalPrice: 169,
    category: "Outerwear",
    rating: 4.8,
    reviews: 71,
    colors: ["#263238", "#000000", "#1A237E"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 19,
    image: "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 10,
    name: "Abyss Crewneck",
    price: 79,
    originalPrice: 109,
    category: "Tops",
    rating: 4.7,
    reviews: 145,
    colors: ["#212121", "#37474F", "#4A148C"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 52,
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 11,
    name: "Dusk Cargo Pants",
    price: 99,
    originalPrice: 139,
    category: "Bottoms",
    rating: 4.8,
    reviews: 88,
    colors: ["#3E2723", "#1B1B1B", "#1A2F1A"],
    sizes: ["28", "30", "32", "34", "36"],
    stock: 41,
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 12,
    name: "Eclipse Wallet",
    price: 55,
    originalPrice: 85,
    category: "Accessories",
    rating: 4.9,
    reviews: 334,
    colors: ["#000000", "#1C1C1C", "#B71C1C"],
    sizes: ["One Size"],
    stock: 200,
    image: "https://images.unsplash.com/photo-1627124712831-f72455b23d53?q=80&w=600&auto=format&fit=crop"
  }
];

export const coupons: Coupon[] = [
  { code: 'SUMMER20', discountPercent: 20, active: true },
  { code: 'LUX50', discountPercent: 50, active: true },
  { code: 'WELCOME10', discountPercent: 10, active: true }
];

export const categories = ["All", "Tops", "Bottoms", "Outerwear", "Accessories", "Footwear"];
