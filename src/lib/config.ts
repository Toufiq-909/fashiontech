import type { Brand, Category, Fabric, Tier } from "./types";

export const site = {
  name: "Butterfly",
  tagline: "Live to Love",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Butterfly curates Merino wool and Lyocell clothing from brands that share our idea of comfort and freedom. Relaxed fits, easy care, everyday movement for 16–30.",
  instagram: "https://www.instagram.com/",
  email: "hello@butterfly.example",
  phone: "+91 90000 00000",
  address: "Indiranagar, Bengaluru 560038, India",
};

export const palette = {
  cream: "#FEFBF6",
  sky: "#A6D1E6",
  plum: "#7F5283",
  ink: "#3D3C42",
  flame: "#FB6C00",
  orange: "#FB6C00",
  amber: "#F9B637",
  peach: "#FFDD9C",
  ember: "#E73F1E",
  brick: "#BD4444",
  sand: "#F1DEC4",
  sage: "#73976A",
  forest: "#677E61",
} as const;

export const categories: { slug: Category; label: string; blurb: string }[] = [
  { slug: "shirts", label: "Shirts", blurb: "Woven, relaxed, breathable. Tuck it, leave it out." },
  { slug: "t-shirts", label: "T-shirts", blurb: "The everyday base layer, in Merino and Lyocell." },
  { slug: "pants", label: "Pants", blurb: "Easy drape, pockets that work, room to move." },
  { slug: "hoodies", label: "Hoodies", blurb: "Soft structure for early classes and late trains." },
  { slug: "joggers", label: "Joggers", blurb: "For the days that don't need a plan." },
  { slug: "shorts", label: "Shorts", blurb: "Warm weather, no fuss." },
  { slug: "accessories", label: "Accessories", blurb: "Socks and belts that finish the outfit." },
  { slug: "other", label: "Other casual", blurb: "One-off pieces that don't fit the other rails." },
];

export const fabrics: Record<
  Fabric,
  {
    name: string;
    tier: Tier;
    tierLabel: string;
    summary: string;
    detail: string;
    swatch: { name: string; hex: string }[];
    care: string;
    bestFor: string;
  }
> = {
  merino: {
    name: "Merino wool",
    tier: "luxury-comfort",
    tierLabel: "Luxury comfort",
    summary: "Soft, breathable and temperature-regulating, with a natural resistance to creases.",
    detail:
      "Fine Merino fibres bend rather than prickle, so the fabric sits softly against skin. It holds warmth without weight, releases moisture, and recovers its shape after a day of wear — which is why it travels well and needs washing less often.",
    swatch: [
      { name: "Teal Tide, 200 GSM Merino Wool", hex: "#3C6E71" },
      { name: "Oat Merino, 175 GSM", hex: "#D9C9AD" },
    ],
    care: "Machine wash cool on wool cycle, reshape and dry flat. Air between wears.",
    bestFor: "Long days, travel, classrooms with unpredictable air conditioning.",
  },
  lyocell: {
    name: "Lyocell",
    tier: "everyday-value",
    tierLabel: "Everyday value",
    summary: "A plant-based cellulose fibre with a soft, fluid drape and a cool, light hand-feel.",
    detail:
      "Lyocell — also sold as Tencel — is made from wood pulp in a closed-loop process. It hangs softly, breathes well and feels cool against skin. It is not wool: always label it Lyocell, never 'Lyocell wool'.",
    swatch: [
      { name: "Dusty pink Lyocell", hex: "#D9A9A0" },
      { name: "Steel blue Lyocell", hex: "#7E93A6" },
    ],
    care: "Machine wash cool, gentle cycle. Line dry in shade, warm iron if needed.",
    bestFor: "Everyday wear, layering, humid afternoons and long commutes.",
  },
};

export const fabricProperties = [
  { name: "Breathable", icon: "wind", note: "Air moves through the fibre, so you do too." },
  { name: "Wrinkle-resistant", icon: "crease", note: "Packs into a bag, comes out looking worn-on-purpose." },
  { name: "Comfortable", icon: "soft", note: "Fine fibres that bend with you instead of against you." },
  { name: "Lightweight", icon: "feather", note: "Warmth and drape without bulk." },
  { name: "Easy maintenance", icon: "drop", note: "Wash less, air more, iron rarely." },
  { name: "Sustainable", icon: "leaf", note: "Natural, traceable fibres over synthetic blends." },
] as const;

export const tierConfig: Record<Tier, { min: number; max: number; label: string; note: string }> = {
  "luxury-comfort": {
    min: 4000,
    max: 4500,
    label: "Luxury comfort",
    note: "Merino pieces sit in our ₹4,000–₹4,500 guide. Partner prices above the guide are shown as source prices in INR, never adjusted.",
  },
  "everyday-value": {
    min: 500,
    max: 600,
    label: "Everyday value",
    note: "Lyocell basics sit in our ₹500–₹600 guide for Butterfly Originals. Partner pieces show their own INR price.",
  },
};

export const fxRates: Record<string, number> = {
  INR: 1,
  USD: 88,
  EUR: 95,
  AUD: 57,
};

export const sizeGuide = [
  { size: "XS", chest: "32–34", waist: "26–28", hip: "34–36" },
  { size: "S", chest: "34–36", waist: "28–30", hip: "36–38" },
  { size: "M", chest: "36–38", waist: "30–32", hip: "38–40" },
  { size: "L", chest: "38–40", waist: "32–34", hip: "40–42" },
  { size: "XL", chest: "40–42", waist: "34–36", hip: "42–44" },
  { size: "XXL", chest: "42–44", waist: "36–38", hip: "44–46" },
];

export const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/latest", label: "New arrivals" },
  { href: "/brands", label: "Brands" },
  { href: "/fabrics", label: "Fabrics" },
  { href: "/try-on", label: "Try on" },
  { href: "/design", label: "Design your own" },
];

export const footerNav = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All pieces" },
      { href: "/latest", label: "New arrivals" },
      { href: "/shop?pick=1", label: "Butterfly Picks" },
      { href: "/shop?category=hoodies", label: "Hoodies" },
      { href: "/design", label: "Design your own" },
    ],
  },
  {
    title: "Butterfly",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/fabrics", label: "Fabrics" },
      { href: "/brands", label: "Brand directory" },
      { href: "/feedback", label: "Feedback & looks" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/shipping-returns", label: "Shipping & returns" },
      { href: "/size-guide", label: "Size guide" },
      { href: "/track", label: "Track an order" },
      { href: "/account", label: "Your account" },
    ],
  },
];

export const affiliateDisclosure =
  "Some links to partner brands are affiliate links: Butterfly may earn a commission if you buy, at no extra cost to you. Prices and availability are set by the brand.";

/** Flat fee added to a Butterfly Original blank when a customer customises it. */
export const customisationFee = 250;

export type { Brand };
