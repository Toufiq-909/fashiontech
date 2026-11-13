import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "How Butterfly handles account data, orders, try-on photos, feedback images and payment information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="shell page-main legal-page">
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Privacy</span>
      </nav>
      <p className="eyebrow mt-4">Legal</p>
      <h1 className="h1 mt-2">Privacy notice.</h1>
      <p className="hint">Last updated 8 November 2026.</p>

      <h2>Who we are</h2>
      <p>
        Butterfly is an Indian fashion brand and curated retailer based in Bengaluru. For privacy
        questions, email{" "}
        <a className="link-under" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        .
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, email, password hash (scrypt, never plain text), saved addresses, wishlist, order history.</li>
        <li><strong>Order data:</strong> recipient name, delivery address, phone, email, items, payment method, payment status and provider reference.</li>
        <li><strong>Feedback:</strong> name, email, rating, message and any photo you choose to upload.</li>
        <li><strong>Reviews:</strong> your account name, rating, review text and any photo you choose to upload.</li>
        <li><strong>Try-on photos:</strong> processed only to generate a preview. Stored only if you save a look.</li>
        <li><strong>Design files:</strong> text, artwork and placement data for custom orders.</li>
      </ul>
      <p>
        We do not run third-party advertising trackers in this build. Essential cookies are used for
        your session only; the cart is stored in your browser&apos;s local storage.
      </p>

      <h2>Try-on photos and saved looks</h2>
      <p>
        A try-on photo is sent to Butterfly&apos;s server to produce the preview. If a try-on provider
        is configured, the photo and garment reference are forwarded to that provider for rendering. We
        do not write the photo to disk unless you press “Save this look”.
      </p>
      <ul>
        <li>Saved looks are stored in Butterfly&apos;s data store and can be deleted in one click from the try-on page or your account.</li>
        <li>Try-on photos are never used for marketing, model training or profiling by Butterfly.</li>
        <li>Deleting a saved look deletes the stored image file and the database record.</li>
        <li>If you do not save, the preview exists only for your current session.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        In the current demo, payments run in a labelled test mode and no money is collected. When a
        payment gateway such as Razorpay is configured, card and UPI details are handled by the gateway;
        Butterfly stores only the provider order reference and payment status. We never store full card
        numbers or UPI credentials.
      </p>

      <h2>Who we share with</h2>
      <ul>
        <li>Our manufacturing partner in India, only what is needed to produce your piece (no payment details).</li>
        <li>A payment gateway, to process payment.</li>
        <li>A virtual try-on provider, only when you request a preview and a provider is configured.</li>
        <li>Hosting and storage providers that run this site, under their own safeguards.</li>
      </ul>
      <p>We do not sell personal data.</p>

      <h2>How long we keep it</h2>
      <p>
        Orders and invoices are kept as long as needed for tax and customer-service records. Account
        data remains until you ask us to delete it. Feedback and reviews remain until removed. Saved
        looks remain until you delete them. Unsaved try-on photos are not retained.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask for a copy of your data, correction, or deletion by emailing{" "}
        <a className="link-under" href={`mailto:${site.email}`}>
          {site.email}
        </a>
        . You can delete saved looks yourself. If you ask us to delete an account, we will remove
        personal data we are not legally required to keep and tell you what remains.
      </p>

      <h2>Children</h2>
      <p>
        Butterfly is aimed at people aged 16 and over. We do not knowingly collect data from children
        under 16. If you believe a child has provided data, contact us and we will remove it.
      </p>

      <h2>Changes</h2>
      <p>
        If this notice changes materially, we will update the date above and, where appropriate, tell
        account holders by email.
      </p>

      <div className="notice mt-6">
        The plain version: we use your data to run your account, send your order to the brand, generate
        a preview you asked for, and keep the shop working. We do not sell it or use try-on photos for
        marketing.
      </div>
      <div className="h-8" />
    </div>
  );
}
