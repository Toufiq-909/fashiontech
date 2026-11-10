import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ShopFilters } from "@/components/ShopFilters";
import {
  brandById,
  filterOptions,
  filterProducts,
  retailProducts,
  type ShopFilters as Filters,
} from "@/lib/catalog";
import { categories, fabrics } from "@/lib/config";

export const metadata = {
  title: "Shop Merino & Lyocell clothing",
  description:
    "Shop Butterfly's curated catalogue of Merino wool and Lyocell shirts, t-shirts, pants, hoodies and casual wear from credited partner brands.",
  alternates: { canonical: "/shop" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return typeof value === "string" && value.length ? value : undefined;
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters: Filters = {
    category: readParam(params, "category"),
    fabric: readParam(params, "fabric"),
    brand: readParam(params, "brand"),
    tier: readParam(params, "tier"),
    size: readParam(params, "size"),
    colour: readParam(params, "colour"),
    care: readParam(params, "care"),
    pick: readParam(params, "pick"),
    q: readParam(params, "q"),
    sort: readParam(params, "sort"),
  };
  const products = filterProducts(filters);
  const options = filterOptions();
  const all = retailProducts();
  const countByCategory = new Map<string, number>();
  for (const product of all) {
    countByCategory.set(product.category, (countByCategory.get(product.category) ?? 0) + 1);
  }
  const activeCategories = categories.filter((category) => countByCategory.has(category.slug));

  function categoryHref(slug?: string) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== "category") query.set(key, value);
    }
    if (slug) query.set("category", slug);
    const string = query.toString();
    return string ? `/shop?${string}` : "/shop";
  }

  return (
    <>
      <section className="page-head shell">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Shop</span>
        </nav>
        <div className="page-head-grid">
          <div>
            <p className="eyebrow">The catalogue</p>
            <h1 className="h1 mt-2">
              {filters.pick === "1" ? "Butterfly Picks" : "For the way you actually move."}
            </h1>
          </div>
          <p className="lede">
            Shirts, tees, pants and hoodies from brands making Merino or Lyocell clothing. We show the
            composition, the source price and who ships it — every time.
          </p>
        </div>
      </section>

      <div className="shell">
        <div className="chip-row" aria-label="Categories">
          <Link className={`chip ${!filters.category ? "chip-active" : ""}`} href={categoryHref()}>
            All ({all.length})
          </Link>
          {activeCategories.map((category) => (
            <Link
              key={category.slug}
              className={`chip ${filters.category === category.slug ? "chip-active" : ""}`}
              href={categoryHref(category.slug)}
            >
              {category.label} ({countByCategory.get(category.slug)})
            </Link>
          ))}
        </div>

        <div className="shop-layout">
          <ShopFilters
            options={{
              categories: activeCategories.map((category) => category.slug),
              brands: options.brands.map((brand) => ({ slug: brand.slug, name: brand.name })),
              sizes: options.sizes,
              colours: options.colours,
            }}
            current={filters}
            resultCount={products.length}
          />

          <div>
            <div className="shop-toolbar">
              <p className="result-count">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
                {filters.category
                  ? ` in ${categories.find((category) => category.slug === filters.category)?.label ?? filters.category}`
                  : ""}
                .
              </p>
              <p className="micro muted">
                {filters.fabric === "merino"
                  ? fabrics.merino.name
                  : filters.fabric === "lyocell"
                    ? fabrics.lyocell.name
                    : "Merino + Lyocell"}{" "}
                · prices in INR
              </p>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <h2>Nothing matches those filters yet.</h2>
                <p>
                  The catalogue is curated, so an empty rail is possible. Clear a filter or tell us
                  what you are looking for.
                </p>
                <div className="cta-row justify-center mt-4">
                  <Link className="btn btn-sm" href="/shop">
                    Clear filters
                  </Link>
                  <Link className="btn btn-secondary btn-sm" href="/feedback">
                    Suggest a piece
                  </Link>
                </div>
              </div>
            ) : (
              <div className="product-grid product-grid-3">
                {products.map((product, index) => {
                  const brand = brandById(product.brandId);
                  return brand ? (
                    <ProductCard key={product.id} product={product} brand={brand} priority={index < 3} />
                  ) : null;
                })}
              </div>
            )}

            <div className="notice mt-8">
              <strong>How ordering works.</strong> Some pieces are sold through Butterfly: we take the
              order and payment, then forward it to the brand. Others are <em>Buy at brand</em>: a
              labelled link takes you to the brand&apos;s own checkout, and Butterfly may earn a
              commission.{" "}
              <Link className="link-under" href="/shipping-returns">
                Shipping and returns by mode
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
