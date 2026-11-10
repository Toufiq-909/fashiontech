import Link from "next/link";
import type { Metadata } from "next";
import { TryOnStudio, type TryOnProduct } from "@/components/TryOnStudio";
import { approvedProducts, brandById } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Virtual try-on",
  description:
    "Upload a photo and preview Butterfly Original Merino and Lyocell pieces on yourself. Consent-first, session-only photo processing.",
  alternates: { canonical: "/try-on" },
};

type SearchParams = Promise<{ product?: string }>;

export default async function TryOnPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const eligible: TryOnProduct[] = approvedProducts()
    .filter((product) => product.tryOnEligible && product.images.some((image) => image.allowedForTryOn))
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      fabric: product.fabric,
      composition: product.composition,
      priceINR: product.priceINR,
      sizes: product.sizes,
      colours: product.colours,
      imageUrl: product.images.find((image) => image.allowedForTryOn)?.url ?? null,
      brandName: brandById(product.brandId)?.name ?? "Butterfly Original",
    }));

  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Virtual try-on</span>
        </nav>
        <div className="page-head-grid">
          <div>
            <p className="eyebrow">Signature feature</p>
            <h1 className="h1 mt-2">See it on you.</h1>
          </div>
          <div>
            <p className="lede">
              Upload a photo, consent, choose a garment, and preview it on your own body. Swap colour,
              compare, then add to cart or save the look.
            </p>
            <p className="hint mt-3">
              Currently {eligible.length} {eligible.length === 1 ? "piece is" : "pieces are"} cleared for
              try-on: our own Butterfly Originals. Partner photography is not reused without
              permission.
            </p>
          </div>
        </div>
      </header>

      <TryOnStudio products={eligible} initialSlug={params.product} />

      <section className="section-tight grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="eyebrow">Photo guidance</p>
          <h2 className="h3 mt-2">Give the model a chance.</h2>
          <ul className="mt-2 grid gap-1.5 text-[0.86rem] muted">
            <li>Full-body or half-body, front-facing.</li>
            <li>One person, arms not crossing the torso.</li>
            <li>Good even light; avoid heavy shadows and filters.</li>
            <li>Plain background, if possible.</li>
          </ul>
        </div>
        <div className="card p-5">
          <p className="eyebrow">Privacy</p>
          <h2 className="h3 mt-2">Your photo, your call.</h2>
          <ul className="mt-2 grid gap-1.5 text-[0.86rem] muted">
            <li>Processed only to make the preview.</li>
            <li>Not stored beyond the session unless you save the look.</li>
            <li>Never used for marketing or model training by Butterfly.</li>
            <li>Delete a saved look in one click from here or your account.</li>
          </ul>
          <Link className="link-underline link-arrow mt-3 inline-flex" href="/privacy">
            Read the privacy notice
          </Link>
        </div>
        <div className="card p-5">
          <p className="eyebrow">No key? No pretence.</p>
          <h2 className="h3 mt-2">Fallback, labelled.</h2>
          <p className="mt-2 text-[0.86rem] muted">
            With no virtual try-on API key configured, Butterfly uses a client-side 2D garment overlay.
            It is clearly marked, adjustable, and never described as an AI-generated render.
          </p>
          <p className="mt-2 text-[0.86rem] muted">
            Add <code>TRYON_API_URL</code> and <code>TRYON_API_KEY</code> to switch the service to a
            configured model provider.
          </p>
        </div>
      </section>

      <div className="notice notice-plum">
        <strong>What leaves this device?</strong> On generate, the photo and garment reference are sent
        to Butterfly&apos;s server; if a provider is configured, that request is forwarded to the
        provider for rendering. Butterfly does not write the photo to disk unless you save the look.
        The saved look is stored in Butterfly&apos;s local data store with a delete control.
      </div>
      <div className="h-8" />
    </div>
  );
}
