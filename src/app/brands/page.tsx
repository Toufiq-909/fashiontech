import Link from "next/link";
import type { Metadata } from "next";
import { brands } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Butterfly Original — our own label",
  description:
    "Butterfly Original is our own Merino and Lyocell label, made in India. Every piece on the site is designed, verified and shipped by Butterfly.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  const all = brands();

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
            <p className="eyebrow">Our label</p>
            <h1 className="h1 mt-2">One label. Every piece.</h1>
          </div>
          <p className="lede">
            Everything on Butterfly is made under our own label, Butterfly Original — Merino and
            Lyocell essentials produced with our manufacturing partner in India, with the fabric
            composition of every piece on its product page.
          </p>
        </div>
      </header>

      {all.map((brand) => (
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
              <span className="tag" style={{ background: "rgba(254,251,246,0.16)", color: "#FEFBF6", borderColor: "rgba(254,251,246,0.35)" }}>
                Made in India
              </span>
            </div>
          </Link>
        </section>
      ))}

      <div className="notice mt-8">
        <strong>One label, one standard.</strong> Every listing on Butterfly is a Butterfly Original
        piece: Butterfly takes your order and payment, ships the parcel and handles returns. The
        composition on each product page comes from our tech pack.
      </div>
      <div className="h-8" />
    </div>
  );
}
