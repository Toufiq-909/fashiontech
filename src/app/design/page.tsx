import Link from "next/link";
import type { Metadata } from "next";
import { DesignStudio, type DesignProduct } from "@/components/DesignStudio";
import { approvedProducts } from "@/lib/catalog";
import { customisationFee } from "@/lib/config";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Design your own",
  description:
    "Customise a Butterfly Original Merino or Lyocell tee, hoodie or shirt with your own text or artwork. Live pricing, moderation and virtual try-on preview.",
  alternates: { canonical: "/design" },
};

type SearchParams = Promise<{ product?: string }>;

export default async function DesignPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const products: DesignProduct[] = approvedProducts()
    .filter((product) => product.customisable)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      fabric: product.fabric,
      composition: product.composition,
      priceINR: product.priceINR,
      colours: product.colours,
    }));

  const cheapest = products.reduce(
    (min, product) => (product.priceINR < min ? product.priceINR : min),
    products[0]?.priceINR ?? 0,
  );

  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Design your own</span>
        </nav>
        <div className="page-head-grid">
          <div>
            <p className="eyebrow">Add your own things</p>
            <h1 className="h1 mt-2">Blank canvas, Butterfly label.</h1>
          </div>
          <div>
            <p className="lede">
              We cannot print on other brands&apos; garments, so this works on Butterfly Originals:
              plain Merino and Lyocell t-shirts, hoodies and shirts made with our manufacturing partner
              in India.
            </p>
            <div className="cta-row mt-4">
              <span className="tag tag-solid">From {formatINR(cheapest + customisationFee)}</span>
              <span className="tag">{formatINR(customisationFee)} customisation</span>
              <span className="tag">5–8 working days</span>
            </div>
          </div>
        </div>
      </header>

      <div className="notice notice-plum mb-6">
        <strong>Butterfly Original.</strong> These blanks are our own label, not partner products. They
        are the only pieces we can customise and print, because the garment and the production line are
        ours to work with.
      </div>

      <DesignStudio products={products} initialSlug={params.product} />

      <section className="section-tight grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <h2 className="h3">What you can add</h2>
          <p className="mt-2 text-[0.86rem] muted">
            Up to 60 characters of text, one artwork or logo (JPG, PNG, WebP; 2 MB), and a colour from
            the blank&apos;s palette. Place, scale and rotate both live on the mockup.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="h3">Moderation</h2>
          <p className="mt-2 text-[0.86rem] muted">
            No offensive, hateful, or infringing content. We reject copyrighted logos or artwork you do
            not have rights to use. Text is screened automatically and files are type/size checked;
            the team can still reject a design before production.
          </p>
        </div>
        <div className="card p-5">
          <h2 className="h3">What happens to your file</h2>
          <p className="mt-2 text-[0.86rem] muted">
            Your design record and artwork are stored with the order for production. Automatic
            moderation runs at upload; admin review can follow. You can ask us to delete a design that
            has not been ordered.
          </p>
        </div>
      </section>

      <div className="notice">
        <strong>Price and returns.</strong> The live price is the blank&apos;s price plus a{" "}
        {formatINR(customisationFee)} customisation fee. Custom pieces are made to order: they cannot be
        returned for a change of mind, only if faulty.{" "}
        <Link className="link-under" href="/shipping-returns">
          Read the returns rules
        </Link>
        .
      </div>
      <div className="h-8" />
    </div>
  );
}
