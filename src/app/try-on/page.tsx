import Link from "next/link";
import type { Metadata } from "next";
import { TryOnStudio, type TryOnProduct } from "@/components/TryOnStudio";
import { approvedProducts, brandById } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Virtual try-on",
  description:
    "Upload a photo and see Butterfly pieces on you before you buy. Your photo stays private.",
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
      photoUrl: product.images.find((image) => image.url && !image.url.startsWith("/api/garment"))?.url ?? null,
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
              Upload a photo, pick a piece, and see it on you. Compare, then add to cart or save the
              look.
            </p>
            <p className="hint mt-3">
              Try-on works for {eligible.length} {eligible.length === 1 ? "piece" : "pieces"} right
              now — our own Butterfly Originals.
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
          <p className="eyebrow">If it&apos;s busy</p>
          <h2 className="h3 mt-2">A simple backup.</h2>
          <p className="mt-2 text-[0.86rem] muted">
            If our try-on service is busy, you&apos;ll still get a preview: the garment is laid over
            your photo, and you can move and resize it until it looks right. We always say when a
            preview is the quick kind, so you&apos;re never misled.
          </p>
        </div>
      </section>

      <div className="notice notice-plum">
        <strong>Where does your photo go?</strong> When you tap “Try it on”, your photo is sent
        securely to Butterfly to create your preview. We don&apos;t keep it unless you press
        “Save this look” — and saved looks can be deleted any time.
      </div>
      <div className="h-8" />
    </div>
  );
}
