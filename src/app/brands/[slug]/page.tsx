import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { brandBySlug, brands, productsForBrand } from "@/lib/catalog";
import { fabrics } from "@/lib/config";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandBySlug(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: `${brand.name} — Butterfly brand directory`,
    description: `${brand.story} Fabrics: ${brand.fabrics.map((fabric) => fabrics[fabric].name).join(", ")}.`,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default async function BrandPage({ params }: { params: Params }) {
  const { slug } = await params;
  const brand = brandBySlug(slug);
  if (!brand) notFound();
  const products = productsForBrand(brand.id);
  const otherBrands = brands()
    .filter((entry) => entry.id !== brand.id)
    .slice(0, 4);
  const buyAtBrand = brand.fulfilment === "buy-at-brand";

  return (
    <div className="shell page-main">
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/brands">Brands</Link>
        <span aria-hidden="true">/</span>
        <span>{brand.name}</span>
      </nav>

      <section className="brand-hero">
        <div>
          <p className="eyebrow" style={{ color: "#FFDD9C" }}>
            {brand.kind === "own-label" ? "Our own label" : "Partner brand"} · {brand.country}
          </p>
          <h1 className="h1">{brand.name}</h1>
          <p>{brand.story}</p>
          <div className="cta-row mt-5">
            <a
              className="btn btn-cream btn-sm"
              href={brand.website}
              target={brand.website.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
            >
              {brand.kind === "own-label" ? "Design a Butterfly Original" : `Visit ${brand.name}`}
              {brand.website.startsWith("http") && <span aria-hidden="true">↗</span>}
            </a>
            {products.length > 0 && (
              <a className="btn btn-ghost-cream btn-sm" href="#brand-products">
                See the pieces
              </a>
            )}
          </div>
        </div>
        <dl className="brand-facts">
          <div>
            <dt>Fabrics used</dt>
            <dd>{brand.fabrics.map((fabric) => fabrics[fabric].name).join(" · ")}</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{brand.country}</dd>
          </div>
          {brand.founded && (
            <div>
              <dt>Founded</dt>
              <dd>{brand.founded}</dd>
            </div>
          )}
          <div>
            <dt>Delivery to India</dt>
            <dd>{brand.indiaNote}</dd>
          </div>
          <div>
            <dt>Ordering</dt>
            <dd>{buyAtBrand ? "Buy at the brand" : "Order via Butterfly"}</dd>
          </div>
        </dl>
      </section>

      <section className="section-tight">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card p-5">
            <h2 className="h3">Who ships it</h2>
            <p className="mt-2 text-[0.88rem] muted">
              {buyAtBrand
                ? `${brand.name} takes payment and ships your order directly. Butterfly earns a commission on referred sales and does not handle the parcel.`
                : `Butterfly takes your order and payment, then forwards it to ${brand.name} for fulfilment. Butterfly is not the manufacturer.`}
            </p>
          </div>
          <div className="card p-5">
            <h2 className="h3">Fabric verification</h2>
            <p className="mt-2 text-[0.88rem] muted">
              Each listed piece shows its exact composition. The “Fabric verified” badge is used only
              when that composition came from {brand.name}&apos;s own product data.
            </p>
          </div>
          <div className="card p-5">
            <h2 className="h3">Returns</h2>
            <p className="mt-2 text-[0.88rem] muted">
              {buyAtBrand
                ? `Returns follow ${brand.name}'s policy. Butterfly can help you raise a request but cannot override the brand.`
                : "14 days from delivery, unworn with tags. Butterfly arranges the return with the brand; customised pieces are exempt unless faulty."}
            </p>
          </div>
        </div>
      </section>

      <section id="brand-products" className="section-tight">
        <div className="section-head">
          <div>
            <p className="eyebrow">The pieces</p>
            <h2 className="h2 mt-2">
              {products.length ? `Curated from ${brand.name}` : "Nothing on the rail right now"}
            </h2>
          </div>
          <Link className="link-arrow" href="/shop">
            All pieces
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="empty-state">
            <p>
              We do not invent products. When a piece from this brand meets our fabric rule (50%+
              Merino or Lyocell) and shows a verified composition, it will appear here.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} brand={brand} />
            ))}
          </div>
        )}
      </section>

      <section className="section-tight">
        <div className="notice">
          <strong>Brand relationship.</strong> {brand.affiliateDisclosure} All trademarks and product
          imagery belong to {brand.name}. Butterfly lists these pieces as a curator and retailer; a
          listing is not a claim of ownership or endorsement beyond the commercial arrangement
          described here.
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {otherBrands.map((other) => (
            <Link key={other.id} className="chip" href={`/brands/${other.slug}`}>
              {other.name}
            </Link>
          ))}
        </div>
      </section>
      <div className="h-8" />
    </div>
  );
}
