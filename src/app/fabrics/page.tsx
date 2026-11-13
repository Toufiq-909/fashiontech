import Link from "next/link";
import type { Metadata } from "next";
import { PropertyBadges } from "@/components/PropertyBadges";
import { fabrics, tierConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Fabrics — Merino wool and Lyocell",
  description:
    "Why Butterfly chooses natural, sustainable fibres: Merino wool and Lyocell (Tencel), compared on feel, breathability, care and price.",
  alternates: { canonical: "/fabrics" },
};

const swatchPhotos: Record<string, string> = {
  "Teal Tide, 200 GSM Merino Wool": "/images/fabrics/teal-merino-knit.jpg",
  "Oat Merino, 175 GSM": "/images/fabrics/oat-merino-knit.jpg",
  "Dusty pink Lyocell": "/images/fabrics/pink-lyocell.jpg",
  "Steel blue Lyocell": "/images/fabrics/steel-blue-lyocell.jpg",
};

const comparison = [
  ["Source", "Renewable wool from sheep, mulesing-free sources", "Wood pulp cellulose, closed-loop solvent process"],
  ["Hand-feel", "Soft, fine, slightly springy; bends rather than pricks", "Cool, smooth and fluid, with a soft drape"],
  ["Warmth", "Insulates without weight; regulates temperature", "Light warmth; best as a cool, breathable layer"],
  ["Breathability", "High — releases moisture vapour", "High — absorbs and releases moisture quickly"],
  ["Creasing", "Naturally wrinkle-resistant; recovers between wears", "Resists creasing but can mark with sharp folds"],
  ["Care", "Wash cool on wool cycle, dry flat, air between wears", "Wash cool, line dry in shade, warm iron if needed"],
  ["Our tier", `${tierConfig["luxury-comfort"].label} · ₹${tierConfig["luxury-comfort"].min}–₹${tierConfig["luxury-comfort"].max} guide`, `${tierConfig["everyday-value"].label} · ₹${tierConfig["everyday-value"].min}–₹${tierConfig["everyday-value"].max} guide`],
];

export default function FabricsPage() {
  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Fabrics</span>
        </nav>
        <div className="page-head-grid">
          <div>
            <p className="eyebrow">The materials</p>
            <h1 className="h1 mt-2">Fabric first, not fabric as an afterthought.</h1>
          </div>
          <p className="lede">
            Instead of choosing fabrics only for appearance, we want the materials themselves to
            contribute to the experience of wearing Butterfly.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {(["merino", "lyocell"] as const).map((key) => {
          const fabric = fabrics[key];
          return (
            <article key={key} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">{fabric.tierLabel}</p>
                  <h2 className="h2 mt-1">{fabric.name}</h2>
                </div>
                <span className={`badge ${key === "merino" ? "badge-merino" : "badge-lyocell"}`}>
                  {key === "merino" ? "Luxury comfort" : "Everyday value"}
                </span>
              </div>
              <p className="mt-4 text-[0.92rem] text-[rgba(61,60,66,0.82)]">{fabric.detail}</p>
              <div className="fabric-swatches mt-5">
                {fabric.swatch.map((swatch) => (
                  <div key={swatch.name} className="fabric-swatch" style={{ background: swatch.hex, minHeight: 110 }}>
                    {swatchPhotos[swatch.name] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={swatchPhotos[swatch.name]}
                        alt={`${swatch.name} fabric close-up`}
                        loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                    <span>{swatch.name}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[0.82rem] muted">
                <strong>Best for:</strong> {fabric.bestFor}
              </p>
              <p className="mt-1 text-[0.82rem] muted">
                <strong>Care:</strong> {fabric.care}
              </p>
              <Link className="link-arrow mt-4 inline-flex" href={`/shop?fabric=${key}`}>
                Shop {fabric.name}
              </Link>
            </article>
          );
        })}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Side by side</p>
            <h2 className="h2 mt-2">Merino vs Lyocell</h2>
            <p>Same idea of comfort; two different ways of getting there.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="comparison-table">
            <caption className="sr-only">Comparison of Merino wool and Lyocell</caption>
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Merino wool</th>
                <th scope="col">Lyocell / Tencel</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([property, merino, lyocell]) => (
                <tr key={property}>
                  <th scope="row" style={{ fontWeight: 600 }}>{property}</th>
                  <td>{merino}</td>
                  <td>{lyocell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint mt-3">
          Lyocell is a plant-based cellulose fibre, not wool. We label it “Lyocell” (or Tencel, its
          common brand name) and never “Lyocell wool”.
        </p>
      </section>

      <section className="section-tight">
        <div className="section-head">
          <div>
            <p className="eyebrow">Six things the fabric does</p>
            <h2 className="h2 mt-2">Properties we actually look for</h2>
          </div>
        </div>
        <PropertyBadges />
      </section>

      <section className="section">
        <div className="frame" style={{ background: "#F1DEC4" }}>
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <p className="eyebrow">Why natural fibres</p>
              <blockquote className="mt-3">
                <p className="h2" style={{ maxWidth: "22ch" }}>
                  “The best outfit is the one you stop noticing.”
                </p>
              </blockquote>
              <p className="mt-4 max-w-[56ch] text-[0.92rem]">
                Natural fibres breathe, age honestly and need less intervention. Merino can be worn
                several times between washes; Lyocell dries quickly and drapes without cling. Both let
                us build an everyday wardrobe that asks less of you — and of the planet.
              </p>
              <p className="mt-3 max-w-[56ch] text-[0.92rem]">
                We require the main fibre to be Merino or Lyocell, we show the exact blend on every
                product page, and every piece is made under the Butterfly Original label.
              </p>
            </div>
            <div className="fabric-swatch" style={{ background: "#73976A", minHeight: 180 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/fabrics/teal-wool-wide.jpg"
                alt="Teal Tide, 200 GSM Merino Wool fabric close-up"
                loading="lazy"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <span>Teal Tide, 200 GSM Merino Wool</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="notice">
            <strong>Care that keeps the fabric.</strong> Wash less. Air between wears. Use a wool cycle
            for Merino and dry flat; line dry Lyocell in shade. Fabric softeners are unnecessary and
            can coat the fibre.
          </div>
          <div className="notice notice-plum">
            <strong>Price transparency.</strong> Merino sits in our ₹{tierConfig["luxury-comfort"].min}–₹{tierConfig["luxury-comfort"].max}
            {" "}guide and Lyocell in ₹{tierConfig["everyday-value"].min}–₹{tierConfig["everyday-value"].max} for
            Butterfly Originals. The guide is a directional range, not a hard cap on every piece.
          </div>
        </div>
        <div className="cta-row mt-6">
          <Link className="btn" href="/shop">
            Shop the catalogue
          </Link>
          <Link className="btn btn-secondary" href="/about">
            Our story
          </Link>
        </div>
      </section>
      <div className="h-8" />
    </div>
  );
}
