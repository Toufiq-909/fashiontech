import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms & brand terms",
  description:
    "Butterfly's website terms, affiliate disclosure, brand ownership note, order and custom-design rules.",
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

      <h2>2. Brands, ownership and credit</h2>
      <p>
        Butterfly curates and sells clothing made by partner brands. Each product page names the brand
        that made it. Partner products remain the property and responsibility of that brand; a listing
        is not a claim of ownership, manufacture or endorsement beyond the commercial arrangement
        described on the page. “Butterfly Original” is our own label, produced with a manufacturing
        partner in India.
      </p>
      <p>
        All brand names, logos and product imagery belong to their respective owners. We show imagery
        only when supplied through a permitted feed or with permission; otherwise we use clearly
        labelled illustrated placeholders.
      </p>

      <h2>3. Affiliate disclosure</h2>
      <p>
        Some partner links are affiliate links. If you buy through one, Butterfly may earn a commission
        at no extra cost to you. Those products are marked “Buy at brand”; the brand sets the price,
        stock, delivery and returns policy and takes payment. Butterfly does not process the order.
      </p>

      <h2>4. Product information and pricing</h2>
      <p>
        We show fabric composition from the brand&apos;s own product data. The “Fabric verified” badge
        is used only for that case. Colours can vary between screens and production batches. Prices are
        in Indian Rupees and include applicable taxes unless stated. Foreign-currency partner prices are
        converted for display at the rate recorded on the product; the source price is shown, and the
        brand may charge in its own currency. We may correct pricing errors and cancel an affected order
        with a full refund.
      </p>
      <p>
        Price tier guides (Merino ₹4,000–₹4,500; Lyocell ₹500–₹600) are positioning guides for Butterfly
        Originals, configurable in the admin panel. They are not a price promise for partner products.
      </p>

      <h2>5. Orders and fulfilment</h2>
      <p>
        An order placed through Butterfly is an offer to buy. We confirm it after payment authorisation
        (or on acceptance of a cash-on-delivery order). For “Order via Butterfly” items, we forward the
        order to the brand named on the piece and the brand ships it. Delivery estimates are estimates,
        not guarantees. Risk passes on delivery.
      </p>
      <p>
        Cash on delivery is subject to PIN-code eligibility. We may cancel an order for suspected fraud,
        stock failure or a pricing error, with a refund of any amount paid.
      </p>

      <h2>6. Returns and custom pieces</h2>
      <p>
        Standard “Order via Butterfly” pieces can be returned within 14 days of delivery, unworn with
        tags, under the process on the{" "}
        <Link className="link-under" href="/shipping-returns">
          shipping and returns page
        </Link>
        . Customised Butterfly Originals are made to order and are non-returnable unless faulty. “Buy at
        brand” returns follow the brand&apos;s policy.
      </p>

      <h2>7. Custom designs and moderation</h2>
      <p>
        When you upload text or artwork, you confirm that you own it or have permission to use it, and
        that it is not unlawful, hateful, obscene, infringing, misleading or an impersonation of a brand
        or person. You grant Butterfly a limited licence to reproduce the design to make and fulfil your
        order. We screen uploads and may reject or cancel a design that breaks these rules, with a refund
        of the customisation fee where production has not begun.
      </p>

      <h2>8. Try-on and generated previews</h2>
      <p>
        Virtual try-on is a visual aid. A generated preview, or a 2D overlay fallback, may not accurately
        represent fit, drape, colour or texture. It is not a guarantee of how a garment will look on you.
        You must have the right to use any photo you upload and must be the person in it, or have that
        person&apos;s consent. Do not upload images of other people without permission.
      </p>

      <h2>9. Accounts</h2>
      <p>
        You are responsible for keeping your password confidential and for activity under your account.
        We may suspend an account used for abuse, fraud or repeated policy breaches. You can ask us to
        delete your account at any time.
      </p>

      <h2>10. Acceptable use</h2>
      <p>
        Do not attempt to break the site, scrape it, interfere with other customers, or use it to upload
        malware or unlawful content. Do not misrepresent a partner product as Butterfly&apos;s own when
        reselling or sharing.
      </p>

      <h2>11. Liability</h2>
      <p>
        Nothing in these terms limits liability that cannot be limited under Indian law. Otherwise, our
        liability for an order is limited to the amount you paid Butterfly for that order. We are not
        responsible for a partner brand&apos;s independent acts or omissions, but we will help you raise
        a complaint for an order placed through Butterfly.
      </p>

      <h2>12. Governing law</h2>
      <p>
        These terms are governed by the laws of India. Courts in Bengaluru, Karnataka have exclusive
        jurisdiction, subject to any mandatory consumer protection rights.
      </p>

      <h2>13. Contact</h2>
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
