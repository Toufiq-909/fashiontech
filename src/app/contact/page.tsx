import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Butterfly about orders, sizing, brand partnerships or feedback. Bengaluru, India.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Contact</span>
        </nav>
        <p className="eyebrow">Contact</p>
        <h1 className="h1 mt-2">Talk to a person.</h1>
        <p className="lede mt-3">
          Order questions, fit advice, a brand that should be on the rail, or something we got wrong —
          all of it lands in the same inbox.
        </p>
      </header>

      <div className="contact-grid">
        <section className="contact-card">
          <h2>Customer care</h2>
          <p>
            <a className="link-under" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <br />
            <a className="link-under" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
              {site.phone}
            </a>
          </p>
          <p className="mt-2">Monday–Saturday, 10:00–18:00 IST. We reply within one working day.</p>
          <p className="mt-2">
            Include your order ID (BFL-XXXXXX) so we can look it up without a second email.
          </p>
        </section>

        <section className="contact-card">
          <h2>Where we are</h2>
          <p>{site.address}</p>
          <p className="mt-2">No walk-in store yet — we sell through this website and Instagram.</p>
          <a className="link-under" href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </section>

        <section className="contact-card">
          <h2>Order help</h2>
          <p>
            <Link className="link-under" href="/track">
              Track an order
            </Link>
            <br />
            <Link className="link-under" href="/shipping-returns">
              Shipping &amp; returns
            </Link>
            <br />
            <Link className="link-under" href="/size-guide">
              Size guide
            </Link>
            <br />
            <Link className="link-under" href="/faq">
              FAQ
            </Link>
          </p>
        </section>

        <section className="contact-card">
          <h2>Brands &amp; partnerships</h2>
          <p>
            If you make Merino or Lyocell clothing and want to be considered for the directory, email{" "}
            <a className="link-under" href={`mailto:${site.email}?subject=Brand%20partnership`}>
              {site.email}
            </a>{" "}
            with your product feed or catalogue and fabric certifications.
          </p>
          <p className="mt-2">
            We only list verified compositions and we never scrape product pages or reuse photography
            without permission.
          </p>
        </section>
      </div>

      <div className="notice mt-8">
        Prefer a form? The{" "}
        <Link className="link-under" href="/feedback">
          feedback page
        </Link>{" "}
        takes a rating, a message and an optional photo, and lands in the same admin panel.
      </div>
      <div className="h-8" />
    </div>
  );
}
