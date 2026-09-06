export type MetalType = string;

export type CategoryId = string;

export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface ProductSpecs {
  metal: string;
  karatOrPurity: string;
  weightGrams?: number;
  gemstone?: string;
  dimensions?: string;
  warranty: string;
  certificate: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: CategoryId;
  categoryId?: string;
  price: number; // in COP
  originalPrice?: number;
  isActive?: boolean;
  description: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  stockCount: number;
  sku: string;
  images: string[];
  materials: string[];
  metalTypes: MetalType[];
  sizes?: number[]; // Ring sizes e.g. 5, 6, 7, 8, 9
  chainLengths?: string[]; // Chain lengths e.g. '40 cm', '45 cm', '50 cm'
  specs: ProductSpecs;
  reviews: Review[];
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedMetal: MetalType;
  selectedSize?: number;
  selectedLength?: string;
  customEngraving?: string;
}

export interface FilterState {
  search: string;
  category: CategoryId;
  minPrice: number;
  maxPrice: number;
  material: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStockOnly: boolean;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  giftWrap: boolean;
  giftMessage?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}
