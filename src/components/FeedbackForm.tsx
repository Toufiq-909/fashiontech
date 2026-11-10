"use client";

import { useState } from "react";

export function FeedbackForm() {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<{ data: string; name: string } | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  async function onPhoto(file: File | undefined) {
    setError("");
    if (!file) {
      setPhoto(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Keep the image under 2 MB.");
      return;
    }
    const buffer = await file.arrayBuffer();
    const data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    setPhoto({ data: `data:${file.type};base64,${data}`, name: file.name });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setState("busy");
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, rating, message, photo: photo?.data ?? null }),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok) {
      setState("idle");
      setError(payload.error ?? "Could not send your feedback.");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="success-panel">
        <h2 className="h3 mb-1">Thank you, {name.split(" ")[0] || "friend"}.</h2>
        <p>
          Your feedback is with the Butterfly team. Featured notes appear on the home page and in the
          admin panel; we do not publish your email address.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form-section">
      <h2>Send us your feedback</h2>
      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="feedback-name">Name</label>
          <input id="feedback-name" className="input" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor="feedback-email">Email</label>
          <input id="feedback-email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} />
        </div>
      </div>
      <div className="field">
        <span className="field-label">Rating</span>
        <div className="rating-input" role="group" aria-label="Rating out of 5">
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
        <label htmlFor="feedback-message">What should we know?</label>
        <textarea
          id="feedback-message"
          className="textarea"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
          minLength={10}
          maxLength={1200}
          placeholder="Fit, fabric, delivery, the try-on, anything."
        />
      </div>
      <div className="field">
        <label htmlFor="feedback-photo">Photo of your look (optional)</label>
        <input id="feedback-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onPhoto(event.target.files?.[0])} />
        <span className="hint">JPG, PNG or WebP, up to 2 MB. Only shared with your permission.</span>
      </div>
      {error && <p className="error-text mb-2" role="alert">{error}</p>}
      <button className="btn" disabled={state === "busy"}>
        {state === "busy" ? "Sending…" : "Send feedback"}
      </button>
      <p className="hint mt-3">
        Photos are stored with your feedback so the team can feature your look. Ask us to delete it at
        any time.
      </p>
    </form>
  );
}
