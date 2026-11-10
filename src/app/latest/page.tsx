import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { brandById, butterflyPicks, retailProducts } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Latest work — new arrivals",
  description:
    "The newest Merino and Lyocell pieces on Butterfly's rail, synced from partner feeds and picked by our team.",
  alternates: { canonical: "/latest" },
};

export default function LatestPage() {
  const all = retailProducts();
  const newItems = all.filter((product) => product.isNew);
  const fallback = [...all]
    .sort((a, b) => b.lastSyncedAt.localeCompare(a.lastSyncedAt))
    .filter((product) => !newItems.some((item) => item.id === product.id));
  const gallery = [...newItems, ...fallback].slice(0, 12);
  const picks = butterflyPicks(4);
  const drops = [...new Set(gallery.map((product) => product.lastSyncedAt))].slice(0, 4);
  const partnerCount = new Set(gallery.map((product) => product.brandId)).size;

  return (
    <>
      <section className="page-head shell">
        <div className="page-head-grid">
          <div>
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span>Latest work</span>
            </nav>
            <p className="eyebrow">Latest drop</p>
            <h1 className="h1 mt-2">Newest pieces, latest thinking.</h1>
          </div>
          <div>
            <p className="lede">
              Every arrival is checked for fibre content before it goes live. If the composition
              isn&apos;t on the brand&apos;s own product page, it doesn&apos;t get a{" "}
              <span className="badge badge-verified">Fabric verified</span> badge.
            </p>
            <div className="cta-row mt-4">
              <Link className="btn btn-sm" href="/shop">
                Shop all
              </Link>
              <Link className="btn btn-secondary btn-sm" href="/shop?pick=1">
                Butterfly Picks
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight shell">
        <div className="notice notice-peach mb-6">
          <strong>{newItems.length} marked new</strong> across {partnerCount} brands in this window. New
          arrivals sync automatically from permitted product feeds; our admin can pin a piece to the
          front of the rail. Sold-out and unverified imports stay hidden.
        </div>

        <div className="product-grid">
          {gallery.map((product, index) => {
            const brand = brandById(product.brandId);
            return brand ? (
              <ProductCard key={product.id} product={product} brand={brand} priority={index < 2} />
            ) : null;
          })}
        </div>
      </section>

      <section className="section-tight shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">The drop timeline</p>
            <h2 className="h2 mt-2">What landed, and when.</h2>
            <p className="mt-3 text-[0.92rem] text-[rgba(61,60,66,0.78)] max-w-[44ch]">
              Feed timestamps are kept on every product, so the rail reflects the source rather than a
              marketing calendar. Pinned items are a separate editorial decision.
            </p>
            <div className="mt-5">
              <Link className="link-arrow" href="/brands">
                See where these brands are
              </Link>
            </div>
          </div>
          <div className="border-l border-[rgba(103,126,97,0.35)] pl-5 grid gap-5">
            {drops.map((date) => {
              const items = gallery.filter((product) => product.lastSyncedAt === date);
              return (
                <div key={date}>
                  <p className="micro font-semibold" style={{ color: "#7F5283" }}>
                    {formatDate(date)}
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {items.map((product) => (
                      <li key={product.id} className="text-[0.88rem]">
                        <Link className="link-under" href={`/shop/${product.slug}`}>
                          {product.name}
                        </Link>{" "}
                        <span className="muted">
                          · {brandById(product.brandId)?.name} · {product.composition}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {picks.length > 0 && (
        <section className="section shell">
          <div className="section-head">
            <div className="section-head-copy">
              <p className="eyebrow">Pinned by the team</p>
              <h2 className="h2 mt-2">Butterfly Picks from this drop</h2>
            </div>
          </div>
          <div className="product-grid">
            {picks.map((product) => {
              const brand = brandById(product.brandId);
              return brand ? <ProductCard key={product.id} product={product} brand={brand} /> : null;
            })}
          </div>
        </section>
      )}
    </>
  );
}
