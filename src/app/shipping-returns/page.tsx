import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description:
    "Delivery windows, who ships each Butterfly order, the free-delivery threshold and returns rules.",
  alternates: { canonical: "/shipping-returns" },
};

export default function ShippingReturnsPage() {
  return (
    <div className="shell page-main legal-page">
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Shipping &amp; returns</span>
      </nav>
      <p className="eyebrow mt-4">Help</p>
      <h1 className="h1 mt-2">Shipping &amp; returns.</h1>
      <p className="lede mt-3">
        Every piece on Butterfly is a Butterfly Original, ordered and shipped through Butterfly. The
        product page and checkout always show the delivery window and returns rule that apply.
      </p>

      <h2>Ordering from Butterfly</h2>
      <p>
        Butterfly takes your order and payment. Each piece is made under the Butterfly Original label
        with our manufacturing partner in India, and Butterfly ships it and owns the customer
        relationship and the return request.
      </p>
      <ul>
        <li>Delivery within India: typically 3–7 working days after dispatch.</li>
        <li>Butterfly Originals: made-to-order in 5–8 working days, then shipped.</li>
        <li>Delivery fee: ₹99, free on orders of ₹2,000 or more.</li>
        <li>Tracking: the order page shows each status change from placed to delivered.</li>
        <li>Returns: 14 days from delivery, unworn with tags attached and in original packaging.</li>
        <li>Customised pieces: non-returnable unless faulty, because they are made specifically for you.</li>
        <li>Refunds: to the original payment method within 5–7 working days after the return is checked. COD refunds are by bank transfer.</li>
      </ul>

      <h2>What if something arrives damaged or wrong?</h2>
      <p>
        Email{" "}
        <a className="link-under" href="mailto:hello@butterfly.example">
          hello@butterfly.example
        </a>{" "}
        within 48 hours with your order ID and photos. We will arrange a replacement or refund —
        Butterfly owns the resolution from start to finish.
      </p>

      <h2>International orders</h2>
      <p>
        Butterfly ships within India only. We do not ship orders out of India yet.
      </p>

      <h2>Cancellations and changes</h2>
      <p>
        Contact us as soon as possible with your order ID. We can usually cancel or amend before the
        order goes into production at the workshop. Once it is in production, the return process
        applies. Custom design
        production starts quickly and may not be cancellable after 24 hours.
      </p>

      <h2>Where to track</h2>
      <p>
        Use{" "}
        <Link className="link-under" href="/track">
          Track an order
        </Link>{" "}
        with your order ID and email, or open the order from your{" "}
        <Link className="link-under" href="/account">
          account history
        </Link>
        . The confirmation page is also a permanent tracking link.
      </p>

      <div className="notice mt-6">
        The short version: 14-day returns on standard order-via-Butterfly pieces, none on custom pieces
        unless faulty, and the brand&apos;s own policy for buy-at-brand links.{" "}
        <Link className="link-under" href="/terms">
          Read the full terms
        </Link>
        .
      </div>
      <div className="h-8" />
    </div>
  );
}
