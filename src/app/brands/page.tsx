import Link from "next/link";
import type { Metadata } from "next";
import { brands } from "@/lib/catalog";
import { fabrics } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brand directory",
  description:
    "The Merino and Lyocell brands Butterfly curates, with country, fabrics, India delivery and how ordering works for each.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  const all = brands();
  const partner = all.filter((brand) => brand.kind === "partner");
  const own = all.filter((brand) => brand.kind === "own-label");
  const direct = partner.filter((brand) => brand.indiaDelivery === "direct").length;

  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Brands</span>
        </nav>
        <div className="page-head-grid">
          <div>
            <p className="eyebrow">Brand directory</p>
            <h1 className="h1 mt-2">The makers behind the rail.</h1>
          </div>
          <p className="lede">
            We pick the best Merino and Lyocell clothing from brands that share our idea of comfort and
            freedom. Every product says who made it. Butterfly curates and sells; it does not claim
            these pieces as its own.
          </p>
        </div>
      </header>

      <div className="notice notice-peach mb-8">
        <strong>{partner.length} partner brands.</strong> {direct} deliver directly to India. Some are
        sold at the brand (a clearly labelled affiliate link); others are ordered through Butterfly and
        forwarded to the brand for fulfilment. Fabric claims are checked against each brand&apos;s own
        product data before a piece goes live.
      </div>

      {own.map((brand) => (
        <section key={brand.id} className="mb-8">
          <Link href={`/brands/${brand.slug}`} className="brand-tile brand-own block">
            <div className="brand-tile-head">
              <span className="brand-mark" aria-hidden="true">
                {brand.logoMark}
              </span>
              <div>
                <h2 className="h3">{brand.name}</h2>
                <p style={{ color: "rgba(254,251,246,0.78)" }}>Our own label · {brand.country}</p>
              </div>
            </div>
            <p>{brand.story}</p>
            <div className="brand-tile-foot">
              <span className="tag" style={{ background: "rgba(254,251,246,0.16)", color: "#FEFBF6", borderColor: "rgba(254,251,246,0.35)" }}>
                Merino &amp; Lyocell
              </span>
              <span className="tag" style={{ background: "#FEFBF6", color: "#3D3C42" }}>
                Customisable
              </span>
            </div>
          </Link>
        </section>
      ))}

      <div className="brand-directory-grid">
        {[...partner]
          .sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name))
          .map((brand) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`} className="brand-tile">
              <div className="brand-tile-head">
                <span className="brand-mark" aria-hidden="true">
                  {brand.logoMark}
                </span>
                <div>
                  <h2 className="h3">{brand.name}</h2>
                  <p>{brand.country}</p>
                </div>
              </div>
              <p>{brand.story.split(". ").slice(0, 2).join(". ")}.</p>
              <div className="brand-tile-foot">
                {brand.fabrics.map((fabric) => (
                  <span key={fabric} className={`badge ${fabric === "merino" ? "badge-merino" : "badge-lyocell"}`}>
                    {fabrics[fabric].name}
                  </span>
                ))}
                <span className={`badge ${brand.indiaDelivery === "none" ? "badge-error" : ""}`}>
                  {brand.indiaDelivery === "direct"
                    ? "Ships to India"
                    : brand.indiaDelivery === "marketplace"
                      ? "India via marketplace"
                      : "No India delivery"}
                </span>
                <span className="badge">
                  {brand.fulfilment === "buy-at-brand" ? "Buy at brand" : "Order via Butterfly"}
                </span>
              </div>
            </Link>
          ))}
      </div>

      <div className="notice mt-8">
        <strong>Affiliate disclosure.</strong> Some links to partner brands are affiliate links:
        Butterfly may earn a commission if you buy, at no extra cost to you. Prices, stock and returns
        are set by the brand for those items. When you order via Butterfly, we tell you who ships the
        piece and which returns policy applies.
      </div>
      <div className="h-8" />
    </div>
  );
}
