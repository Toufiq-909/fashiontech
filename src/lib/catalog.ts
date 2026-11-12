import "server-only";
import { getDb } from "./db";
import type { Brand, Product, Fabric, Tier } from "./types";

export function brands(): Brand[] {
  return getDb().brands;
}

export function brandBySlug(slug: string) {
  return getDb().brands.find((brand) => brand.slug === slug) ?? null;
}

export function brandById(id: string) {
  return getDb().brands.find((brand) => brand.id === id) ?? null;
}

export function allProducts() {
  return getDb().products;
}

export function approvedProducts() {
  return getDb().products.filter((product) => product.status === "approved" && product.availability !== "sold-out");
}

/**
 * The shoppable catalogue. Every listing on the site is a Butterfly product —
 * anything not attributed to the Butterfly own label stays out of retail listings.
 */
export function retailProducts() {
  return approvedProducts().filter((product) => product.brandId === "brand-butterfly-original");
}

export function productBySlug(slug: string) {
  return getDb().products.find((product) => product.slug === slug) ?? null;
}

export function productById(id: string) {
  return getDb().products.find((product) => product.id === id) ?? null;
}

export function productsForBrand(brandId: string) {
  return retailProducts().filter((product) => product.brandId === brandId);
}

export function butterflyPicks(limit = 4) {
  return retailProducts()
    .filter((product) => product.butterflyPick)
    .slice(0, limit);
}

export function newArrivals(limit = 8) {
  return [...retailProducts()]
    .filter((product) => product.isNew)
    .sort((a, b) => b.lastSyncedAt.localeCompare(a.lastSyncedAt))
    .slice(0, limit);
}

export interface ShopFilters {
  category?: string;
  fabric?: string;
  brand?: string;
  tier?: string;
  size?: string;
  colour?: string;
  care?: string;
  pick?: string;
  q?: string;
  sort?: string;
}

export function filterProducts(filters: ShopFilters) {
  const list = retailProducts();
  const brandSlugMap = new Map(brands().map((brand) => [brand.id, brand.slug]));
  let result = list.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.fabric && product.fabric !== (filters.fabric as Fabric)) return false;
    if (filters.brand && brandSlugMap.get(product.brandId) !== filters.brand) return false;
    if (filters.tier && product.tier !== (filters.tier as Tier)) return false;
    if (filters.size && !product.sizes.includes(filters.size)) return false;
    if (filters.colour && !product.colours.some((colour) => colour.name === filters.colour)) return false;
    if (filters.care === "easy" && !product.easyCare) return false;
    if (filters.pick === "1" && !product.butterflyPick) return false;
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const haystack = `${product.name} ${product.composition} ${brandSlugMap.get(product.brandId)} ${product.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  switch (filters.sort) {
    case "price-asc":
      result = result.sort((a, b) => a.priceINR - b.priceINR);
      break;
    case "price-desc":
      result = result.sort((a, b) => b.priceINR - a.priceINR);
      break;
    case "new":
      result = result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
      break;
    default:
      result = result.sort((a, b) => Number(b.butterflyPick) - Number(a.butterflyPick));
  }
  return result;
}

export function filterOptions() {
  const products = retailProducts();
  return {
    categories: [...new Set(products.map((product) => product.category))],
    brands: brands().filter((brand) => products.some((product) => product.brandId === brand.id)),
    sizes: [...new Set(products.flatMap((product) => product.sizes))],
    colours: [...new Set(products.flatMap((product) => product.colours.map((colour) => colour.name)))].sort(),
  };
}

export function reviewsFor(productId: string) {
  return getDb()
    .reviews.filter((review) => review.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function productRating(productId: string) {
  const list = reviewsFor(productId);
  if (!list.length) return { average: 0, count: 0 };
  return {
    average: list.reduce((sum, review) => sum + review.rating, 0) / list.length,
    count: list.length,
  };
}

export function styleWith(product: Product) {
  return product.styleWith
    .map((slug) => productBySlug(slug))
    .filter((item): item is Product => Boolean(item));
}
