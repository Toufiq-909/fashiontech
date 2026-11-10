"use client";

import { useState } from "react";
import { StarRating } from "./StarRating";

export function ReviewForm({ productId, signedIn }: { productId: string; signedIn: boolean }) {
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <p className="notice">
        Reviews are open to verified buyers. <a className="link-under" href="/account">Sign in</a> with the
        account you used to order, and the form will appear here.
      </p>
    );
  }

  async function readPhoto(file: File | undefined) {
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Keep the photo under 2 MB.");
      return;
    }
    const buffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    setPhoto(`data:${file.type};base64,${base64}`);
    setError("");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!rating) {
      setError("Choose a star rating.");
      return;
    }
    setBusy(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, body, photo }),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not post your review.");
      return;
    }
    setMessage("Thank you. Your review is published.");
    setBody("");
    setPhoto(null);
    setRating(0);
  }

  return (
    <form className="review-form" onSubmit={submit}>
      <h3 className="h3 mb-2">Write a review</h3>
      <p className="hint mb-3">Only verified buyers can review. Your order history is checked automatically.</p>
      <div className="field">
        <span className="field-label">Your rating</span>
        <div className="rating-input" role="group" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={star <= rating ? "is-on" : ""}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              aria-pressed={star === rating}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="review-body">Your review</label>
        <textarea
          id="review-body"
          className="textarea"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          minLength={10}
          maxLength={1200}
          placeholder="How did it fit, move and wash?"
        />
      </div>
      <div className="field">
        <label htmlFor="review-photo">Add a photo (optional)</label>
        <input
          id="review-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => readPhoto(event.target.files?.[0])}
        />
        <span className="hint">JPG, PNG or WebP, up to 2 MB.</span>
      </div>
      {error && <p className="error-text mb-2" role="alert">{error}</p>}
      {message && <p className="success-panel mb-2" role="status">{message}</p>}
      <button className="btn btn-sm" disabled={busy}>
        {busy ? "Posting…" : "Post review"}
      </button>
    </form>
  );
}

export function RatingSummary({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <StarRating value={average} showValue count={count} />
    </div>
  );
}
