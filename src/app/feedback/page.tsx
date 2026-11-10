import Link from "next/link";
import type { Metadata } from "next";
import { FeedbackForm } from "@/components/FeedbackForm";
import { StarRating } from "@/components/StarRating";
import { getDb } from "@/lib/db";
import { brandById, productById } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Feedback & your Butterfly looks",
  description:
    "Tell Butterfly what works, share a photo of your look, and see feedback from the community.",
  alternates: { canonical: "/feedback" },
};

export default async function FeedbackPage() {
  const db = getDb();
  const featured = db.feedback.filter((item) => item.featured).slice(0, 6);
  const recent = [...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const looks = [...db.looks].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="shell page-main">
      <header className="page-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Feedback</span>
        </nav>
        <div className="page-head-grid">
          <div>
            <p className="eyebrow">Feedback &amp; community</p>
            <h1 className="h1 mt-2">Tell us how it moves.</h1>
          </div>
          <p className="lede">
            Fit, fabric, delivery, the try-on — we read all of it. Product reviews are open to verified
            buyers; general feedback is open to everyone.
          </p>
        </div>
      </header>

      <div className="feedback-layout">
        <FeedbackForm />

        <div>
          <div className="form-section">
            <h2>What people are saying</h2>
            {featured.length === 0 ? (
              <p className="text-[0.88rem] muted">Featured notes will appear here.</p>
            ) : (
              <div className="grid gap-3">
                {featured.map((item) => (
                  <article key={item.id}>
                    <StarRating value={item.rating} />
                    <p className="text-[0.9rem] mt-1">&ldquo;{item.message}&rdquo;</p>
                    <p className="micro muted mt-1">
                      {item.name} · {formatDate(item.createdAt)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Share your Butterfly look</h2>
            <p className="text-[0.85rem] muted mb-3">
              Add a photo to your feedback and we may feature it in the community gallery. Photos are
              shown only with the submission you make here.
            </p>
            {looks.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem", textAlign: "left" }}>
                <p className="text-[0.87rem]">
                  No looks yet. Save a virtual try-on look or send a photo with your feedback, and it
                  will appear here after review.
                </p>
              </div>
            ) : (
              <div className="look-gallery">
                {looks.map((look) => {
                  const product = productById(look.garmentProductId);
                  const brand = product ? brandById(product.brandId) : null;
                  return (
                    <figure className="look-tile" key={look.id}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/uploads/${look.imageFile}`} alt={`Butterfly look${product ? ` in ${product.name}` : ""}`} />
                      <figcaption>
                        {product?.name ?? "Butterfly look"}
                        {brand ? ` · ${brand.name}` : ""}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="section-tight">
        <div className="section-head">
          <div>
            <p className="eyebrow">Newest notes</p>
            <h2 className="h2 mt-2">Straight from the inbox</h2>
          </div>
        </div>
        <div className="feedback-grid">
          {recent.map((item) => (
            <article className="quote-card" key={item.id}>
              <StarRating value={item.rating} />
              <p>&ldquo;{item.message}&rdquo;</p>
              <p className="quote-who">{item.name}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="notice">
        <strong>Product reviews live on product pages.</strong> Only customers with an order containing
        that piece can post a review, so ratings reflect people who actually bought and wore it.{" "}
        <Link className="link-under" href="/account">
          Sign in to review a piece
        </Link>
        .
      </div>
      <div className="h-8" />
    </div>
  );
}
