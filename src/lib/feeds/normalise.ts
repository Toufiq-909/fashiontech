import { fxRates, tierConfig } from "../config";
import type { Brand, Category, Feed, Product, ProductImage } from "../types";

export interface RawFeedProduct {
  sku: string;
  name: string;
  category: Category;
  fabric: "merino" | "lyocell";
  composition: string;
  compositionPercent: number;
  compositionSource: string;
  gsm?: number;
  price: number;
  currency: string;
  sizes: string[];
  colours: { name: string; hex: string }[];
  imageUrl: string | null;
  imagePermission: boolean;
  /** "reference" = credited official brand image, not cleared for try-on. */
  imageRights?: "permitted" | "reference";
  sourceUrl: string;
  availability: "in-stock" | "low-stock" | "sold-out";
  description: string;
  fit: string;
  care: string;
  isNew: boolean;
  easyCare: boolean;
  customisable?: boolean;
  reviewNote?: string;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const TRY_ON_CATEGORIES: Category[] = ["shirts", "t-shirts", "hoodies", "pants"];

export function toINR(price: number, currency: string) {
  const rate = fxRates[currency] ?? 1;
  return { inr: Math.round(price * rate), rate };
}

export function imagesFor(raw: RawFeedProduct, brand: Brand): ProductImage[] {
  const reference = !raw.imagePermission && raw.imageRights === "reference";
  if (raw.imageUrl && (raw.imagePermission || reference)) {
    const owned = raw.imageUrl.startsWith("/api/garment/");
    return [
      {
        kind: owned ? "owned-mockup" : reference ? "brand-reference" : "feed",
        url: raw.imageUrl,
        credit: owned
          ? "Butterfly Original — own mockup"
          : reference
            ? `Official image — ${brand.name}`
            : `Image supplied by ${brand.name}`,
        // Try-on stays limited to garments we own and have cleared for it.
        allowedForTryOn: owned,
      },
    ];
  }
  return [
    {
      kind: "placeholder",
      url: null,
      credit: `Brand image not supplied — placeholder for ${brand.name}`,
      allowedForTryOn: false,
    },
  ];
}

export function normaliseProduct(raw: RawFeedProduct, brand: Brand, feedId: string, importedAt: string): Product {
  const { inr, rate } = toINR(raw.price, raw.currency);
  const images = imagesFor(raw, brand);
  const fabricVerified =
    raw.compositionSource === "brand-product-data" || raw.compositionSource === "butterfly-tech-pack";
  const reviewsNote = raw.reviewNote ? ` ${raw.reviewNote}` : "";

  return {
    id: `prod-${brand.slug}-${raw.sku.toLowerCase()}`,
    slug: slugify(raw.name),
    brandId: brand.id,
    name: raw.name,
    category: raw.category,
    fabric: raw.fabric,
    fabricPercent: raw.compositionPercent,
    composition: raw.composition,
    gsm: raw.gsm,
    tier: raw.fabric === "merino" ? "luxury-comfort" : "everyday-value",
    priceINR: inr,
    sourcePrice: raw.price,
    sourceCurrency: raw.currency,
    fxRateUsed: rate,
    sizes: raw.sizes,
    colours: raw.colours,
    images,
    sourceUrl: raw.sourceUrl,
    availability: raw.availability,
    lastSyncedAt: importedAt,
    status: brand.kind === "own-label" ? "approved" : "pending",
    fabricVerified,
    compositionSource: raw.compositionSource + reviewsNote,
    isNew: raw.isNew,
    butterflyPick: false,
    easyCare: raw.easyCare,
    tryOnEligible: images.some((image) => image.allowedForTryOn) && TRY_ON_CATEGORIES.includes(raw.category),
    customisable: Boolean(raw.customisable),
    styleWith: [],
    care: raw.care,
    description: raw.description,
    fit: raw.fit,
  };
}

export function tierRange(tier: keyof typeof tierConfig) {
  const config = tierConfig[tier];
  return `₹${config.min.toLocaleString("en-IN")}–₹${config.max.toLocaleString("en-IN")}`;
}

/** Simple CSV parser for the admin upload adapter. Handles quoted commas. */
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") field += char;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((cell) => cell.trim()));
  if (!header) return [];
  return body.map((cells) =>
    Object.fromEntries(header.map((key, index) => [key.trim(), (cells[index] ?? "").trim()])),
  );
}

export function feedAdapterLabel(adapter: Feed["adapter"]) {
  return {
    json: "JSON feed",
    csv: "CSV upload",
    affiliate: "Affiliate feed",
    api: "Brand API",
  }[adapter];
}
