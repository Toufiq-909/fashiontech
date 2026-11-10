import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Butterfly's curated Merino and Lyocell catalogue, ordering modes, delivery, returns, try-on privacy and custom designs.",
  alternates: { canonical: "/faq" },
};

const questions = [
  {
    q: "What exactly is Butterfly?",
    a: "Butterfly is an Indian fashion brand and curated retailer for 16–30 year-olds. We select Merino wool and Lyocell clothing from partner brands, present it in one place, and sell it. We also make a small own-label range, Butterfly Originals, with a manufacturing partner in India.",
  },
  {
    q: "Are the partner clothes made by Butterfly?",
    a: "No. Each product page names the brand that made it (“From [Brand]”). Butterfly curates, presents and sells; it does not claim partner products as its own. Butterfly Originals is our own label and is labelled separately.",
  },
  {
    q: "How do you verify the fabric?",
    a: "A piece is listed only when its main fibre is Merino wool or Lyocell at 50% or more. We show the exact composition. The “Fabric verified” badge appears only when that composition comes from the brand's own product data or our own tech pack. Lyocell is a plant-based cellulose fibre and is never described as “Lyocell wool”.",
  },
  {
    q: "What is the difference between “Buy at brand” and “Order via Butterfly”?",
    a: "Buy at brand sends you to the brand's own checkout through a clearly labelled link; Butterfly may earn a commission and the brand ships and handles returns. Order via Butterfly means Butterfly takes your order and payment, then forwards it to the brand for fulfilment. Each product page states which applies, who ships, the delivery window and the returns policy.",
  },
  {
    q: "Why can I only try on Butterfly Originals?",
    a: "Virtual try-on needs a garment image cleared for that use. Partner brands have not supplied such images, so we do not reuse their photography. Butterfly Originals use our own mockups, so the try-on button appears there. We hide it everywhere else.",
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
    a: "Merino is our “Luxury comfort” tier with a ₹4,000–₹4,500 guide; Lyocell is “Everyday value” with a ₹500–₹600 guide for Butterfly Originals. Partner brands set their own INR prices, which we show as they are. The guide is configurable in the admin panel and is not a promise that every partner piece sits inside it.",
  },
  {
    q: "What sizes do you stock?",
    a: "It varies by brand and piece — sizes are shown on each product page. Our size guide gives relaxed-fit body measurements in inches, but when a brand supplies its own chart, use that. Partner size labels (for example UK sizes) are shown exactly as the brand lists them.",
  },
  {
    q: "Which payments do you accept?",
    a: "UPI, cards and cash on delivery for eligible PIN codes on orders placed through Butterfly. The checkout runs in test mode until payment gateway keys are configured, so no money is collected in the current demo. Buy-at-brand orders are paid on the brand's site.",
  },
  {
    q: "Can I cancel or change an order?",
    a: "Email hello@butterfly.example with your order ID as soon as possible. We can cancel or amend before the order is forwarded to the brand. Once forwarded, the brand's fulfilment and the returns policy apply.",
  },
  {
    q: "Do you ship outside India?",
    a: "Butterfly's own checkout currently ships inside India. Some partner brands ship to India from abroad (delivery notes are on each brand page); buy-at-brand orders follow that brand's international shipping. We do not currently ship Butterfly orders out of India.",
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
