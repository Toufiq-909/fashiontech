import Link from "next/link";
import type { Metadata } from "next";
import { TeeCustomiser } from "@/components/TeeCustomiser";
import { customisationFee } from "@/lib/config";
import { formatINR } from "@/lib/format";

export const metadata: Metadata = {
  title: "Design your own tee",
  description:
    "Design your own Butterfly Original tee: pick a colour and fabric, add front text and back artwork, see it on the shirt and pay only for your customisations.",
  alternates: { canonical: "/design" },
};

export default function DesignPage() {
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
            <p className="eyebrow">Design your own</p>
            <h1 className="h1 mt-2">Your words in front. Your art on the back.</h1>
          </div>
          <div>
            <p className="lede">
              Pick a colour and fabric, drag your text and artwork onto the shirt, and pay only for what
              you customise — a Butterfly Original blank plus a {formatINR(customisationFee)}{" "}
              customisation fee.
            </p>
            <div className="cta-row mt-4">
              <span className="tag tag-solid">3 colours</span>
              <span className="tag">Merino or Lyocell</span>
              <span className="tag">5–8 working days</span>
            </div>
          </div>
        </div>
      </header>

      <TeeCustomiser />

      <div className="notice mt-8">
        <strong>Butterfly Original.</strong> These blanks are our own label, made with our manufacturing
        partner in India. Custom pieces are made to order and cannot be returned for a change of mind,
        only if faulty.{" "}
        <Link className="link-under" href="/shipping-returns">
          Read the returns rules
        </Link>
        .
      </div>
      <div className="h-8" />
    </div>
  );
}
