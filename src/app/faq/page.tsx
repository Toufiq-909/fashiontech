import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Butterfly's own-label Merino and Lyocell catalogue, ordering, delivery, returns, try-on privacy and custom designs.",
  alternates: { canonical: "/faq" },
};

const questions = [
  {
    q: "What exactly is Butterfly?",
    a: "Butterfly is an Indian fashion brand for 16–30 year-olds. We design Merino wool and Lyocell clothing under our own label, Butterfly Original, and make it with a manufacturing partner in India. Every listing on the site is a Butterfly piece.",
  },
  {
    q: "Are the clothes made by Butterfly?",
    a: "Yes — every piece on the site is a Butterfly Original: designed by Butterfly and produced by our manufacturing partner in India. Butterfly takes your order, payment and returns.",
  },
  {
    q: "How do you verify the fabric?",
    a: "A piece is listed only when its main fibre is Merino wool or Lyocell at 50% or more. We show the exact composition. The “Fabric verified” badge appears only when that composition comes from our own tech pack. Lyocell is a plant-based cellulose fibre and is never described as “Lyocell wool”.",
  },
  {
    q: "Who takes my order?",
    a: "Butterfly always does. You order and pay on Butterfly, we make and ship the piece from India, and we handle returns. Each product page states the delivery window and the returns policy.",
  },
  {
    q: "Why can I only try on some pieces?",
    a: "Virtual try-on needs a garment image cleared for that use. Pieces rendered with our own garment mockups support it; the try-on button appears there and stays hidden everywhere else.",
  },
  {
    q: "Do you keep my try-on photo?",
    a: "Only if you press “Save this look”. Otherwise the photo is processed for the preview and not written to our store. Saved looks can be deleted in one click from the try-on page or your account. We never use try-on photos for marketing.",
  },
  {
    q: "Can I print anything on a custom piece?",
    a: "No. Text and artwork must be your own or used with permission, and must not be offensive, hateful or infringing. We screen text automatically and check file type and size; we can still reject a design before production. Copyrighted logos and brand impersonation are not accepted.",
  },
  {
    q: "How do the price tiers work?",
    a: "Merino is our “Luxury comfort” tier with a ₹4,000–₹4,500 guide; Lyocell is “Everyday value” with a ₹500–₹600 guide for Butterfly Originals. The guide is configurable in the admin panel and is not a promise that every piece sits inside it.",
  },
  {
    q: "What sizes do you stock?",
    a: "Sizes are shown on each product page. Our size guide gives relaxed-fit body measurements in inches — match your measurements to it before ordering.",
  },
  {
    q: "Which payments do you accept?",
    a: "UPI, cards and cash on delivery for eligible PIN codes on orders placed through Butterfly. The checkout runs in test mode until payment gateway keys are configured, so no money is collected in the current demo.",
  },
  {
    q: "Can I cancel or change an order?",
    a: "Email hello@butterfly.example with your order ID as soon as possible. We can cancel or amend before the order goes into production at the workshop. Once it is in production, the returns policy applies.",
  },
  {
    q: "Do you ship outside India?",
    a: "Butterfly currently ships inside India only. We do not ship orders out of India yet.",
  },
];

export default function FaqPage() {
  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>FAQ</span>
        </nav>
        <p className="eyebrow">Help</p>
        <h1 className="h1 mt-2">Questions people actually ask.</h1>
        <p className="lede mt-3">
          If your question is not here, write to{" "}
          <a className="link-under" href="mailto:hello@butterfly.example">
            hello@butterfly.example
          </a>{" "}
          and a person will reply.
        </p>
      </header>

      <div className="faq-list">
        {questions.map((item) => (
          <details className="accordion" key={item.q}>
            <summary>
              {item.q} <span className="plus" aria-hidden="true">+</span>
            </summary>
            <p className="text-[0.9rem] leading-relaxed text-[rgba(61,60,66,0.84)] pb-4 max-w-[68ch]">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="notice mt-8">
        Still stuck? <Link className="link-under" href="/contact">Contact us</Link> or read{" "}
        <Link className="link-under" href="/shipping-returns">shipping &amp; returns</Link> and the{" "}
        <Link className="link-under" href="/size-guide">size guide</Link>.
      </div>
      <div className="h-8" />
    </div>
  );
}
