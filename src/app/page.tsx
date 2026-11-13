import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { PropertyBadges } from "@/components/PropertyBadges";
import { ButterflyMark } from "@/components/brand/ButterflyMark";
import { StarRating } from "@/components/StarRating";
import {
  brandById,
  butterflyPicks,
  retailProducts,
} from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { fabrics, site, tierConfig } from "@/lib/config";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Activewear stays on the shop rail but out of the landing page story sections. */
function isActivewear(product: Product) {
  return product.category === "joggers" || /active/i.test(product.name);
}

export const metadata = {
  title: "Butterfly — Live to Love",
  description: site.description,
  alternates: { canonical: "/" },
};

const LOOK_SEEDS = [
  {
    title: "The 9 a.m. lecture",
    note: "A striped shirt that survives the commute, wide trousers, and a blue overshirt.",
    slugs: ["eta-off-white-striped-relaxed-fit-shirt", "blue-denim-tencel-pleated-pants", "azure-blue-lyocell-linen-shirt"],
  },
  {
    title: "Library, then dinner",
    note: "One colour family, three textures. Nothing needs ironing.",
    slugs: ["drift-brown-lyocell-linen-shirt", "blue-pintuck-denim-tunic", "cloud-white-lyocell-linen-shirt"],
  },
  {
    title: "Sunday, slowly",
    note: "A printed blouse, a marigold dress, and a soft bubble hem for the walk home.",
    slugs: ["lyocell-rich-printed-crew-neck-blouse", "womens-tencel-sleeveless-blouse", "lyocell-rich-textured-bubble-hem-blouse"],
  },
];

export default function HomePage() {
  const all = retailProducts();
  const landing = all.filter((product) => !isActivewear(product));
  const newest = [...landing]
    .sort(
      (a, b) =>
        Number(b.isNew) - Number(a.isNew) || b.lastSyncedAt.localeCompare(a.lastSyncedAt),
    )
    .slice(12, 16);
  const picks = butterflyPicks(8).filter((product) => !isActivewear(product)).slice(0, 4);
  const feedback = getDb()
    .feedback.filter((item) => item.featured)
    .slice(0, 3);
  const lookCards = LOOK_SEEDS.map((look) => ({
    ...look,
    products: look.slugs
      .map((slug) => all.find((product) => product.slug === slug))
      .filter((product): product is Product => Boolean(product)),
  }));
  const collage = [
    { slug: "lyocell-rich-printed-crew-neck-blouse", caption: "A print that does the thinking for you" },
    { slug: "cloud-white-lyocell-linen-shirt", caption: "A white shirt without the ironing" },
    { slug: "blue-denim-tencel-pleated-pants", caption: "Lyocell that falls, not clings" },
  ].map((item) => ({ ...item, product: all.find((product) => product.slug === item.slug) }));

  return (
    <>
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline poster="/images/products/w-23few62400.webp">
          <source src="/videos/twc_web_banner_2025.mp4" type="video/mp4" />
        </video>
        <div className="hero-wash" aria-hidden="true" />
        <div className="shell">
          <div className="hero-top">
            <span className="hero-kicker">
              <ButterflyMark size={14} wing="#E6D6BD" accent="#C6A464" body="#F4F0E8" />
              Natural fibres, considered
            </span>
          </div>

          <div className="hero-grid">
            <div className="hero-copy hero-enter">
              <h1 className="hero-type" aria-label="Live to Love.">
                <span className="hero-line">Made for</span>
                <span className="hero-line hero-line-accent pb-6">living.</span>
              </h1>
              <p className="hero-lede">
                Merino and Lyocell pieces selected for the way they feel, move and endure.
              </p>
              <div className="hero-actions">
                <Link className="btn btn-hero-primary" href="/shop">
                  Explore the collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-12 pr-12 whitespace-nowrap text-[0.72rem] font-semibold">
              <span>Freedom to move</span>
              <span>Merino &amp; Lyocell</span>
              <span>Fabric verified</span>
              <span>Butterfly Original</span>
              <span>Live to Love</span>
              <span>Easy care</span>
              <span>Made for 16–30</span>
            </div>
          ))}
        </div>
      </div>

      <section className="section shell">
        <div className="section-head">
          <div className="section-head-copy">
            <p className="eyebrow">Latest work</p>
            <h2 className="h2 mt-2">Newest on the rail</h2>
            <p>
              Our latest drop from the Butterfly rail, hand-picked where the fabric and the fit earn
              it.
            </p>
          </div>
          <Link className="link-arrow" href="/latest">
            All new arrivals
          </Link>
        </div>
        <div className="product-grid">
          {newest.map((product, index) => {
            const brand = brandById(product.brandId);
            return brand ? (
              <ProductCard key={product.id} product={product} brand={brand} priority={index < 2} />
            ) : null;
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <p className="text-[0.82rem] muted">
            New arrivals sync automatically. The admin can pin or feature a piece.
          </p>
          <Link className="btn btn-secondary btn-sm" href="/shop">
            Browse the catalogue
          </Link>
        </div>
      </section>

      <section className="statement-band">
        <div className="shell statement-grid">
          <div>
            <p className="eyebrow" style={{ color: "#FFDD9C" }}>
              The idea
            </p>
            <h2 className="statement-type mt-3">
              Clothing should move with you, <em>not restrict you.</em>
            </h2>
          </div>
          <div>
            <p className="statement-side">
              We combine natural fabrics, comfort and modern design so people can move, feel and
              express themselves freely. Not formal. Not rigid. Not a uniform.
            </p>
            <div className="mt-5">
              <Link className="btn btn-cream btn-sm" href="/about">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="story-split">
          <div className="story-collage">
            {collage.map((entry, position) => (
              <div
                key={entry.slug}
                className={`collage-tile ${position === 0 ? "collage-tile-tall" : ""}`}
              >
                {entry.product && (
                  <ProductVisual product={entry.product} showNote={false} priority={position === 0} />
                )}
                <span className="collage-caption">
                  {entry.caption}
                  {entry.product ? ` · From ${brandById(entry.product.brandId)?.name}` : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="story-copy">
            <p className="eyebrow">Why Butterfly</p>
            <h2 className="h1">The gap after the uniform.</h2>
            <p>
              Somewhere between school uniforms and a first salary, a lot of people are left to work
              out what they actually like wearing. Butterfly is for that moment: freedom to move,
              freedom from constant ironing, freedom from clothing that asks you to sit differently.
            </p>
            <p>
              We design Merino and Lyocell clothing around one idea of comfort and freedom, and make
              it under our own label. The butterfly stands for transformation — not a finished look, a
              direction.
            </p>
            <blockquote>
              &ldquo;We don&apos;t want to define your style; we want to give you the freedom to
              define it yourself.&rdquo;
            </blockquote>
            <div className="cta-row mt-5">
              <Link className="btn btn-sm" href="/about">
                The Butterfly story
              </Link>
              <Link className="link-arrow" href="/brands">
                Meet the brands
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight shell">
        <div className="chrysalis-row">
          {[
            {
              title: "Chrysalis",
              copy: "You start with what you know: a uniform, a safe outfit, someone else's idea of right.",
              colour: "#3D3C42",
              size: 52,
            },
            {
              title: "Emerging",
              copy: "You try a fabric that feels different, a fit with room in it, a colour you chose yourself.",
              colour: "#7F5283",
              size: 44,
            },
            {
              title: "Wings",
              copy: "Fewer clothes, more outfits. Easy movement, easy care, and a style that is unmistakably yours.",
              colour: "#677E61",
              size: 52,
            },
          ].map((stage, index) => (
            <div className="stage" key={stage.title}>
              <span className="stage-num">0{index + 1}</span>
              <span className="stage-art">
                <ButterflyMark size={stage.size} wing={stage.colour} accent="#F9B637" body="#3D3C42" />
              </span>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="section-head">
          <div className="section-head-copy">
            <p className="eyebrow">Butterfly Picks</p>
            <h2 className="h2 mt-2">The pieces we would buy first</h2>
            <p>
              Hand-picked by our team from the Butterfly rail — different fabrics, one idea of
              comfort.
            </p>
          </div>
          <Link className="link-arrow" href="/shop?pick=1">
            All Picks
          </Link>
        </div>
        <div className="product-grid">
          {picks.map((product) => {
            const brand = brandById(product.brandId);
            return brand ? <ProductCard key={product.id} product={product} brand={brand} /> : null;
          })}
        </div>
      </section>

      <section className="section-tight shell">
        <div className="section-head">
          <div className="section-head-copy">
            <p className="eyebrow">Mix and match</p>
            <h2 className="h2 mt-2">Three pieces, five outfits</h2>
            <p>
              Build different looks with fewer clothes. Each combination crosses brands, because the
              wardrobe should not be a set.
            </p>
          </div>
        </div>
        <div className="look-grid">
          {lookCards.map((look) => (
            <article className="look-card" key={look.title}>
              <div className="look-collage">
                {look.products.slice(0, 3).map((product) => (
                  <div key={product.id}>
                    <ProductVisual
                      product={product}
                      brandTone={brandById(product.brandId)?.tone ?? "#F1DEC4"}
                      showNote={false}
                    />
                  </div>
                ))}
              </div>
              <div className="look-body">
                <h3>{look.title}</h3>
                <p>{look.note}</p>
                <p className="micro muted">
                  {look.products.map((product) => brandById(product.brandId)?.name).filter(Boolean).join(" · ")}
                </p>
                <p className="look-price">
                  {formatINR(look.products.reduce((sum, product) => sum + product.priceINR, 0))} for the look
                </p>
                {look.products[0] && (
                  <Link className="link-arrow text-[0.85rem]" href={`/shop/${look.products[0].slug}`}>
                    Start with the {look.products[0].category.replace("-", " ")}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* <section className="fabric-strip">
        <div className="shell fabric-strip-inner">
          <div>
            <p className="eyebrow">The fibres</p>
            <h2 className="h2 mt-2">Two fibres. One idea.</h2>
            <p className="mt-3 max-w-[45ch] text-[0.95rem]">
              Instead of choosing fabrics only for appearance, we want the materials themselves to
              contribute to the experience of wearing Butterfly.
            </p>
            <div className="cta-row mt-4">
              <Link className="btn btn-sm" href="/fabrics">
                Merino vs Lyocell
              </Link>
              <span className="tag">₹{tierConfig["luxury-comfort"].min}–{tierConfig["luxury-comfort"].max} Merino</span>
              <span className="tag">₹{tierConfig["everyday-value"].min}–{tierConfig["everyday-value"].max} Lyocell</span>
            </div>
          </div>
          <div className="fabric-swatches">
            {[...fabrics.merino.swatch, ...fabrics.lyocell.swatch].map((swatch) => (
              <div
                key={swatch.name}
                className="fabric-swatch"
                style={{ background: swatch.hex }}
              >
                <span>{swatch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section className="section shell">
        <div className="section-head">
          <div className="section-head-copy">
            <p className="eyebrow">What the fabric does</p>
            <h2 className="h2 mt-2">Comfort you can name</h2>
          </div>
        </div>
        <PropertyBadges />
      </section>

      <section className="section shell">
        <div className="section-head">
          <div className="section-head-copy">
            <p className="eyebrow">From the community</p>
            <h2 className="h2 mt-2">Notes from people in motion</h2>
          </div>
          <Link className="link-arrow" href="/feedback">
            Feedback &amp; looks
          </Link>
        </div>
        <div className="feedback-grid">
          {feedback.map((item) => (
            <article className="quote-card" key={item.id}>
              <StarRating value={item.rating} />
              <p>&ldquo;{item.message}&rdquo;</p>
              <p className="quote-who">
                {item.name} · verified customer
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight shell">
        <div className="tryon-banner">
          <div>
            <p className="eyebrow" style={{ color: "#FFDD9C" }}>
              Virtual try-on
            </p>
            <h2 className="h2 mt-2">See it on you before you decide.</h2>
            <p>
              Upload a photo, choose a piece, and preview it on your own body. Your photo is processed
              for the preview only — never used for marketing.
            </p>
            <div className="cta-row mt-5">
              <Link className="btn" href="/try-on">
                Try it on virtually
              </Link>
              <Link className="btn btn-ghost-cream" href="/design">
                Or design your own
              </Link>
            </div>
          </div>
          <div className="tryon-banner-art" aria-hidden="true">
            <ButterflyMark size={130} wing="#FFDD9C" accent="#F9B637" body="#FEFBF6" />
          </div>
        </div>
      </section>
    </>
  );
}
