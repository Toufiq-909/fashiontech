import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms & brand terms",
  description:
    "Butterfly's website terms, brand ownership note, order and custom-design rules.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="shell page-main legal-page">
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Terms</span>
      </nav>
      <p className="eyebrow mt-4">Legal</p>
      <h1 className="h1 mt-2">Terms &amp; brand terms.</h1>
      <p className="hint">Last updated 8 November 2026.</p>

      <h2>1. Who these terms are between</h2>
      <p>
        These terms govern your use of the Butterfly website and any order you place through it.
        “Butterfly”, “we” and “us” mean the Butterfly brand operated from Bengaluru, India. By using the
        site or ordering, you agree to these terms.
      </p>

      <h2>2. Brand, ownership and credit</h2>
      <p>
        Every piece listed on Butterfly is a Butterfly Original: designed by Butterfly and produced by
        our manufacturing partner in India. Butterfly takes your order, payment and returns, and each
        product page names the label and shows the exact composition.
      </p>
      <p>
        Product imagery belongs to Butterfly or is used with permission; where no cleared image exists,
        we show a clearly labelled illustrated placeholder.
      </p>

      <h2>3. Product information and pricing</h2>
      <p>
        We show fabric composition from our own tech pack. The “Fabric verified” badge
        is used only for that case. Colours can vary between screens and production batches. Prices are
        in Indian Rupees and include applicable taxes unless stated. We may correct pricing errors and
        cancel an affected order with a full refund.
      </p>
      <p>
        Price tier guides (Merino ₹4,000–₹4,500; Lyocell ₹500–₹600) are positioning guides for Butterfly
        Originals, configurable in the admin panel. They are not a hard price promise for every piece.
      </p>

      <h2>4. Orders and fulfilment</h2>
      <p>
        An order placed through Butterfly is an offer to buy. We confirm it after payment authorisation
        (or on acceptance of a cash-on-delivery order). Your piece is produced under the Butterfly
        Original label and shipped by Butterfly. Delivery estimates are estimates, not guarantees. Risk
        passes on delivery.
      </p>
      <p>
        Cash on delivery is subject to PIN-code eligibility. We may cancel an order for suspected fraud,
        stock failure or a pricing error, with a refund of any amount paid.
      </p>

      <h2>5. Returns and custom pieces</h2>
      <p>
        Standard pieces can be returned within 14 days of delivery, unworn with
        tags, under the process on the{" "}
        <Link className="link-under" href="/shipping-returns">
          shipping and returns page
        </Link>
        . Customised Butterfly Originals are made to order and are non-returnable unless faulty.
      </p>

      <h2>6. Custom designs and moderation</h2>
      <p>
        When you upload text or artwork, you confirm that you own it or have permission to use it, and
        that it is not unlawful, hateful, obscene, infringing, misleading or an impersonation of a brand
        or person. You grant Butterfly a limited licence to reproduce the design to make and fulfil your
        order. We screen uploads and may reject or cancel a design that breaks these rules, with a refund
        of the customisation fee where production has not begun.
      </p>

      <h2>7. Try-on and generated previews</h2>
      <p>
        Virtual try-on is a visual aid. A generated preview, or a 2D overlay fallback, may not accurately
        represent fit, drape, colour or texture. It is not a guarantee of how a garment will look on you.
        You must have the right to use any photo you upload and must be the person in it, or have that
        person&apos;s consent. Do not upload images of other people without permission.
      </p>

      <h2>8. Accounts</h2>
      <p>
        You are responsible for keeping your password confidential and for activity under your account.
        We may suspend an account used for abuse, fraud or repeated policy breaches. You can ask us to
        delete your account at any time.
      </p>

      <h2>9. Acceptable use</h2>
      <p>
        Do not attempt to break the site, scrape it, interfere with other customers, or use it to upload
        malware or unlawful content. Do not misrepresent Butterfly products or pass off our imagery as
        your own when reselling or sharing.
      </p>

      <h2>10. Liability</h2>
      <p>
        Nothing in these terms limits liability that cannot be limited under Indian law. Otherwise, our
        liability for an order is limited to the amount you paid Butterfly for that order.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive
        jurisdiction, subject to any mandatory consumer protection rights.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a className="link-under" href={`mailto:${site.email}`}>
          {site.email}
        </a>{" "}
        · {site.address}
      </p>
      <div className="h-8" />
    </div>
  );
}
