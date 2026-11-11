import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ReviewForm, RatingSummary } from "@/components/ReviewForm";
import { StarRating } from "@/components/StarRating";
import { PropertyBadges } from "@/components/PropertyBadges";
import {
  brandById,
  productBySlug,
  productRating,
  productsForBrand,
  reviewsFor,
  styleWith,
} from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { sessionUser } from "@/lib/auth";
import { fabrics, sizeGuide } from "@/lib/config";
import { formatDate } from "@/lib/format";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Piece not found" };
  const brand = brandById(product.brandId);
  return {
    title: `${product.name} — ${brand?.name ?? "Partner brand"}`,
    description: `${product.name} from ${brand?.name}. ${product.composition}. ${productsForBrand(product.brandId).length ? "Shop on Butterfly." : ""}`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} · Butterfly`,
      description: `${product.composition} · From ${brand?.name}.`,
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product || product.status !== "approved") notFound();
  const brand = brandById(product.brandId);
  if (!brand) notFound();

  const user = await sessionUser();
  const db = getDb();
  const canReview = Boolean(
    user &&
      db.orders.some(
        (order) =>
          order.userId === user.id &&
          order.payment.status !== "failed" &&
          order.items.some((item) => item.productId === product.id),
      ),
  );
  const reviews = reviewsFor(product.id);
  const rating = productRating(product.id);
  const related = styleWith(product).slice(0, 3);
  const moreFromBrand = productsForBrand(brand.id)
    .filter((item) => item.id !== product.id)
    .slice(0, 3);
  const featuredFeedback = db.feedback.filter(
    (item) => item.featured && item.message.toLowerCase().includes(product.fabric),
  );
  const onGreen = brand.fulfilment === "buy-at-brand";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: brand.name },
    description: product.description,
    material: product.composition,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.priceINR,
      availability:
        product.availability === "sold-out"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      url: `/shop/${product.slug}`,
      seller: { "@type": "Organization", name: onGreen ? brand.name : "Butterfly" },
    },
  };

  return (
    <div className="shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop">Shop</Link>
        <span aria-hidden="true">/</span>
        <Link href={`#`}>Butterfly</Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-layout">
        <ProductGallery product={product} />

        <div className="buybox">
          <ProductBuyBox product={product} brand={brand} signedIn={Boolean(user)} />

          <dl className="spec-list">
            <div>
              <dt>Composition</dt>
              <dd>
                {product.composition}{" "}
                {product.fabricVerified ? (
                  <span className="badge badge-verified">Fabric verified</span>
                ) : (
                  <span className="badge badge-error">Verify before ordering</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Fit</dt>
              <dd>{product.fit}</dd>
            </div>
            <div>
              <dt>Care</dt>
              <dd>{product.care}</dd>
            </div>
            <div>
              <dt>Availability</dt>
              <dd>
                {product.availability === "in-stock"
                  ? "In stock"
                  : product.availability === "low-stock"
                    ? "Low stock"
                    : "Sold out"}
              </dd>
            </div>
            <div>
              <dt>Sizes</dt>
              <dd>{product.sizes.join(" · ")}</dd>
            </div>
            <div>
              <dt>Source price</dt>
              <dd>
                {product.sourceCurrency === "INR"
                  ? `₹${product.sourcePrice.toLocaleString("en-IN")}`
                  : `${product.sourceCurrency} ${product.sourcePrice}`}
                {" · "}
                <a
                  href={product.sourceUrl}
                  target={product.sourceUrl.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer nofollow"
                  className="link-under"
                >
                  product source
                </a>
              </dd>
            </div>
            <div>
              <dt>Last synced</dt>
              <dd>{formatDate(product.lastSyncedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="grid gap-10 lg:grid-cols-2 border-t border-[rgba(103,126,97,0.3)] py-10">
        <div>
          <p className="eyebrow">The piece</p>
          <h2 className="h2 mt-2">Why it earns its place.</h2>
          <p className="mt-4 max-w-[52ch] text-[0.95rem] text-[rgba(61,60,66,0.82)]">{product.description}</p>
          <p className="mt-4 text-[0.85rem] muted">
            Credited to {brand.name}, {brand.country}. Butterfly curates and presents this product;{" "}
            {onGreen
              ? "the brand sells and ships it."
              : "Butterfly takes the order and forwards it to the brand for fulfilment."}
          </p>
          <div className="mt-5">
            <Link className="link-arrow" href={`/brands/${brand.slug}`}>
              Read {brand.name}&apos;s story
            </Link>
          </div>
        </div>
        <div>
          <p className="eyebrow">Fabric &amp; care</p>
          <h2 className="h2 mt-2">{fabrics[product.fabric].name}, in practice.</h2>
          <p className="mt-4 text-[0.92rem] text-[rgba(61,60,66,0.82)] max-w-[52ch]">
            {fabrics[product.fabric].detail}
          </p>
          <dl className="dl mt-5 max-w-[46ch]">
            <div>
              <dt>Fabric family</dt>
              <dd>{fabrics[product.fabric].name}</dd>
            </div>
            <div>
              <dt>Composition</dt>
              <dd>{product.composition}</dd>
            </div>
            {product.gsm && (
              <div>
                <dt>Weight</dt>
                <dd>{product.gsm} GSM</dd>
              </div>
            )}
            <div>
              <dt>Care</dt>
              <dd>{product.care}</dd>
            </div>
          </dl>
          <Link className="link-arrow mt-5 inline-flex" href="/fabrics">
            Merino vs Lyocell
          </Link>
        </div>
      </section>

      <section className="border-t border-[rgba(103,126,97,0.3)] py-10">
        <div className="section-head">
          <div>
            <p className="eyebrow">Delivery &amp; returns</p>
            <h2 className="h2 mt-2">{onGreen ? "Bought at the brand." : "Ordered through Butterfly."}</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5">
            <h3 className="h3">Who ships it</h3>
            <p className="mt-2 text-[0.86rem] muted">
              {onGreen
                ? `${brand.name} ships your order directly.`
                : `${brand.name} fulfils the order after Butterfly forwards it.`}
            </p>
          </div>
          <div className="card p-5">
            <h3 className="h3">Delivery to India</h3>
            <p className="mt-2 text-[0.86rem] muted">{brand.indiaNote}</p>
          </div>
          <div className="card p-5">
            <h3 className="h3">Returns</h3>
            <p className="mt-2 text-[0.86rem] muted">
              {onGreen
                ? `Returns follow ${brand.name}'s policy; Butterfly can help you start the request but cannot override it.`
                : "14 days from delivery, unworn with tags, arranged by Butterfly. Customised pieces are non-returnable unless faulty."}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[rgba(103,126,97,0.3)] py-10">
        <div className="section-head">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="h2 mt-2">Worn, washed, reported back.</h2>
          </div>
          <RatingSummary average={rating.average} count={rating.count} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {reviews.length === 0 && <p className="muted text-[0.9rem]">No reviews yet. Be the first verified buyer.</p>}
            {reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-head">
                  <span className="review-name">{review.name}</span>
                  <span className="flex items-center gap-2">
                    <StarRating value={review.rating} />
                    {review.verified && <span className="badge badge-verified">Verified buyer</span>}
                  </span>
                </div>
                <p className="review-body">{review.body}</p>
                <p className="micro muted mt-2">{formatDate(review.createdAt)}</p>
              </article>
            ))}
            {featuredFeedback.slice(0, 1).map((item) => (
              <div className="notice notice-peach mt-4" key={item.id}>
                &ldquo;{item.message}&rdquo; — {item.name}
              </div>
            ))}
          </div>
          <div>
            {canReview ? (
              <ReviewForm productId={product.id} signedIn />
            ) : (
              <div className="notice">
                <strong>Verified buyers only.</strong> Sign in with the account used for an order
                containing this piece to leave a review.{" "}
                <Link className="link-under" href={`/account?next=/shop/${product.slug}`}>
                  Sign in
                </Link>
                .
              </div>
            )}
            <div className="mt-4">
              <PropertyBadges />
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-[rgba(103,126,97,0.3)] py-10">
          <div className="section-head">
            <div>
              <p className="eyebrow">Style it with</p>
              <h2 className="h2 mt-2">Fewer clothes, more outfits.</h2>
            </div>
          </div>
          <div className="product-grid product-grid-3">
            {related.map((item) => {
              const itemBrand = brandById(item.brandId);
              return itemBrand ? <ProductCard key={item.id} product={item} brand={itemBrand} /> : null;
            })}
          </div>
        </section>
      )}

      {moreFromBrand.length > 0 && (
        <section className="border-t border-[rgba(103,126,97,0.3)] py-10">
          <div className="section-head">
            <div>
              <p className="eyebrow">More from {brand.name}</p>
              <h2 className="h2 mt-2">Same maker, same logic.</h2>
            </div>
            <Link className="link-arrow" href={`/brands/${brand.slug}`}>
              Brand page
            </Link>
          </div>
          <div className="product-grid product-grid-3">
            {moreFromBrand.map((item) => {
              const itemBrand = brandById(item.brandId);
              return itemBrand ? <ProductCard key={item.id} product={item} brand={itemBrand} /> : null;
            })}
          </div>
        </section>
      )}

      <section className="pb-10">
        <details className="accordion border-t border-[rgba(61,60,66,0.2)]">
          <summary>
            Size guide and fit notes <span className="plus" aria-hidden="true">+</span>
          </summary>
          <div className="overflow-x-auto pb-4">
            <table className="comparison-table min-w-[520px]">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in)</th>
                  <th>Waist (in)</th>
                  <th>Hip (in)</th>
                </tr>
              </thead>
              <tbody>
                {sizeGuide.map((row) => (
                  <tr key={row.size}>
                    <td>{row.size}</td>
                    <td>{row.chest}</td>
                    <td>{row.waist}</td>
                    <td>{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[0.85rem] muted pb-4">
            {brand.name}&apos;s own size chart may differ. When a brand supplies measurements, use
            those; ours is a guide for relaxed fits. Fit note for this piece: {product.fit}.
          </p>
        </details>
      </section>
    </div>
  );
}
