/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { ButterflyMark } from "@/components/brand/ButterflyMark";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Butterfly is an Indian fashion brand for 16–30 year-olds leaving uniforms behind. Merino and Lyocell clothing curated for freedom of movement and self-expression.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="shell page-main">
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Our story</span>
      </nav>

      <header className="about-hero">
        <div>
          <p className="eyebrow">Our story</p>
          <h1 className="h1 mt-2">Live to Love.</h1>
          <p>
            Butterfly makes everyday clothing more comfortable, practical and expressive for young
            people. We combine natural fabrics, comfort and modern design so people can move, feel and
            express themselves freely.
          </p>
          <div className="cta-row mt-5">
            <Link className="btn" href="/shop">
              Shop the catalogue
            </Link>
            <Link className="btn btn-secondary" href="/fabrics">
              Why these fabrics
            </Link>
          </div>
        </div>
        <div>
          <div className="media-frame" style={{ minHeight: 280 }}>
            <img
              src="/images/products/vir-xiti-dress.webp"
              alt="Model wearing a marigold VIRGIO 100% Lyocell mini dress"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <p className="micro muted mt-2">Official image — VIRGIO</p>
        </div>
      </header>

      <section className="section">
        <div className="statement-grid">
          <div>
            <p className="eyebrow">The idea</p>
            <h2 className="statement-type mt-3">
              Clothing should move with you, <em>not restrict you.</em>
            </h2>
          </div>
          <p className="statement-side">
            Not formal. Not rigid. Not a uniform. Freedom to move, freedom from constant ironing,
            freedom from clothing that asks you to sit differently.
          </p>
        </div>
      </section>

      <section className="section-tight">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">The gap we fill</p>
            <h2 className="h2 mt-2">After the uniform, what?</h2>
            <p className="mt-4 text-[0.94rem] text-[rgba(61,60,66,0.84)]">
              School students are uncomfortable with uniform restrictions. Young adults want freedom to
              express their style. Budget-conscious youth want trendy fashion without compromising on
              how it feels. The market often asks them to choose one.
            </p>
            <p className="mt-3 text-[0.94rem] text-[rgba(61,60,66,0.84)]">
              Butterfly is built for ages 16 to 30: students leaving uniforms, fashion-conscious
              shoppers, and anyone building an everyday wardrobe that can go from a lecture hall to a
              late train without a costume change.
            </p>
          </div>
          <div className="frame" style={{ background: "#F1DEC4" }}>
            <p className="eyebrow">The butterfly</p>
            <div className="my-4">
              <ButterflyMark size={86} wing="#7F5283" accent="#F9B637" body="#3D3C42" />
            </div>
            <p className="text-[0.94rem]">
              The butterfly stands for transformation. Our customers are often in transition — from a
              uniform they did not choose to a style they are still discovering. We are not trying to
              finish the transformation. We are trying to make the clothes that let it happen.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">How we curate</p>
            <h2 className="h2 mt-2">We don&apos;t make everything. We choose well.</h2>
          </div>
        </div>
        <p className="lede">
          We pick the best Merino and Lyocell clothing from brands that share our idea of comfort and
          freedom.
        </p>
        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <div className="card p-5">
            <p className="eyebrow">01 · The fibre rule</p>
            <h3 className="h3 mt-2">At least 50% Merino or Lyocell</h3>
            <p className="mt-2 text-[0.88rem] muted">
              Every piece must have one of those as its main fibre. We show the exact composition and
              label Lyocell as Lyocell — never “Lyocell wool”.
            </p>
          </div>
          <div className="card p-5">
            <p className="eyebrow">02 · The freedom test</p>
            <h3 className="h3 mt-2">Relaxed fits and easy care</h3>
            <p className="mt-2 text-[0.88rem] muted">
              If it restricts movement, needs constant ironing or only works with one outfit, it does
              not belong here. Mix-and-match matters more than a statement piece.
            </p>
          </div>
          <div className="card p-5">
            <p className="eyebrow">03 · The composition rule</p>
            <h3 className="h3 mt-2">The blend is always shown</h3>
            <p className="mt-2 text-[0.88rem] muted">
              Every product page states its exact Merino or Lyocell composition, taken from our tech
              pack — no vague fabric claims.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="chrysalis-row">
          <div className="stage">
            <span className="stage-num">01</span>
            <ButterflyMark size={48} wing="#3D3C42" accent="#677E61" body="#3D3C42" />
            <h3>Chrysalis</h3>
            <p>Uniforms, rules, someone else&apos;s idea of what fits. Comfortable, maybe, but not yours.</p>
          </div>
          <div className="stage">
            <span className="stage-num">02</span>
            <ButterflyMark size={44} wing="#7F5283" accent="#F9B637" body="#3D3C42" />
            <h3>Emerging</h3>
            <p>A fabric that feels different, a fit with room in it, a colour you chose yourself.</p>
          </div>
          <div className="stage">
            <span className="stage-num">03</span>
            <ButterflyMark size={52} wing="#677E61" accent="#F9B637" body="#3D3C42" />
            <h3>Wings</h3>
            <p>Fewer clothes, more outfits, less time at the ironing board. Your style, not a definition.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">The founders</p>
            <h2 className="h2 mt-2">Built by three people who noticed the gap.</h2>
            <p className="mt-3 text-[0.9rem] muted max-w-[38ch]">
              Butterfly is a young Indian brand, based in Bengaluru, designing its own label and making
              it with a manufacturing partner in India.
            </p>
          </div>
          <div>
            <div className="founder-grid">
              {["Muheeth S", "Kousic T", "Likith N"].map((name) => (
                <div className="founder" key={name}>
                  <strong>{name}</strong>
                  <span>Founder, Butterfly</span>
                </div>
              ))}
            </div>
            <blockquote className="mt-6 border-l-[3px] border-[#7F5283] pl-4">
              <p className="h3" style={{ maxWidth: "34ch" }}>
                “We don&apos;t want to define your style; we want to give you the freedom to define it
                yourself.”
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="tryon-banner">
          <div>
            <p className="eyebrow" style={{ color: "#FFDD9C" }}>
              Your turn
            </p>
            <h2 className="h2 mt-2">Find your first piece.</h2>
            <p>
              Start with a tee, a shirt or the try-on. Build from there — that is the whole idea.
            </p>
            <div className="cta-row mt-5">
              <Link className="btn" href="/shop">
                Shop the catalogue
              </Link>
              <Link className="btn btn-ghost-cream" href="/try-on">
                Try it on
              </Link>
            </div>
          </div>
          <div className="tryon-banner-art" aria-hidden="true">
            <ButterflyMark size={130} wing="#FFDD9C" accent="#F9B637" body="#FEFBF6" />
          </div>
        </div>
      </section>
      <div className="h-8" />
    </div>
  );
}
