export type Fabric = "merino" | "lyocell";
export type Tier = "luxury-comfort" | "everyday-value";
export type FulfilmentMode = "buy-at-brand" | "order-via-butterfly";
export type Category =
  | "shirts"
  | "pants"
  | "t-shirts"
  | "hoodies"
  | "shorts"
  | "joggers"
  | "accessories"
  | "other";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  kind: "partner" | "own-label";
  country: string;
  website: string;
  logoMark: string;
  story: string;
  founded?: string;
  fabrics: Fabric[];
  indiaDelivery: "direct" | "marketplace" | "none";
  indiaNote: string;
  fulfilment: FulfilmentMode;
  affiliateDisclosure: string;
  termsNote: string;
  featured: boolean;
  tone: string;
}

export interface Feed {
  id: string;
  brandId: string;
  adapter: "json" | "csv" | "affiliate" | "api";
  label: string;
  endpoint: string;
  enabled: boolean;
  lastRunAt: string | null;
  importedCount: number;
  credentialEnvVars: string[];
}

export interface ProductImage {
  kind: "feed" | "owned-mockup" | "placeholder" | "brand-reference";
  url: string | null;
  credit: string;
  allowedForTryOn: boolean;
}

export interface Product {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  category: Category;
  fabric: Fabric;
  fabricPercent: number;
  composition: string;
  gsm?: number;
  tier: Tier;
  priceINR: number;
  sourcePrice: number;
  sourceCurrency: string;
  fxRateUsed: number;
  sizes: string[];
  colours: { name: string; hex: string }[];
  images: ProductImage[];
  sourceUrl: string;
  availability: "in-stock" | "low-stock" | "sold-out";
  lastSyncedAt: string;
  status: "pending" | "approved" | "rejected";
  fabricVerified: boolean;
  compositionSource: string;
  isNew: boolean;
  butterflyPick: boolean;
  easyCare: boolean;
  tryOnEligible: boolean;
  customisable: boolean;
  styleWith: string[];
  care: string;
  description: string;
  fit: string;
}

export interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "customer" | "admin";
  wishlist: string[];
  addresses: Address[];
  createdAt: string;
}

export interface CustomDesign {
  id: string;
  garmentProductId: string;
  fabric: Fabric;
  colour: string;
  text: string;
  artworkFile: string | null;
  transform: { scale: number; rotation: number; x: number; y: number };
  price: number;
  status: "approved" | "pending-review" | "rejected";
  moderationNote: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  brandId: string;
  brandName: string;
  fabric: Fabric;
  composition: string;
  size: string;
  colour: string;
  qty: number;
  unitPrice: number;
  fulfilment: FulfilmentMode;
  customDesignId?: string;
  customSummary?: string;
}

export interface Order {
  code: string;
  userId: string | null;
  email: string;
  name: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Address;
  payment: { method: "upi" | "card" | "cod"; status: "paid" | "pending" | "failed"; providerRef: string; mode: "test" | "live" };
  status: "placed" | "confirmed" | "forwarded" | "shipped" | "delivered" | "cancelled";
  timeline: { at: string; label: string }[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  name: string;
  rating: number;
  body: string;
  photo: string | null;
  verified: boolean;
  featured: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  photo: string | null;
  featured: boolean;
  createdAt: string;
}

export interface Look {
  id: string;
  userId: string | null;
  imageFile: string;
  garmentProductId: string;
  createdAt: string;
}

export interface Database {
  brands: Brand[];
  feeds: Feed[];
  products: Product[];
  users: User[];
  sessions: { token: string; userId: string; createdAt: string }[];
  orders: Order[];
  reviews: Review[];
  feedback: Feedback[];
  designs: CustomDesign[];
  looks: Look[];
  settings: { tiers: Record<Tier, { min: number; max: number; label: string; note: string }> };
}
