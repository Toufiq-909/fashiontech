"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminAction({
  payload,
  label,
  className = "mini-btn",
  confirmText,
}: {
  payload: Record<string, unknown>;
  label: string;
  className?: string;
  confirmText?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        className={className}
        disabled={busy}
        title={error || undefined}
        onClick={async () => {
          if (confirmText && !window.confirm(confirmText)) return;
          setBusy(true);
          setError("");
          const response = await fetch("/api/admin/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const body = (await response.json()) as { ok?: boolean; error?: string };
          setBusy(false);
          if (!response.ok) {
            setError(body.error ?? "Failed");
            return;
          }
          router.refresh();
        }}
      >
        {busy ? "…" : label}
      </button>
      {error && <span className="error-text" title={error}>!</span>}
    </span>
  );
}

export function AdminBrandEditor({
  brand,
}: {
  brand: {
    id: string;
    name: string;
    fulfilment: string;
    featured: boolean;
    termsNote: string;
  };
}) {
  const router = useRouter();
  const [fulfilment, setFulfilment] = useState(brand.fulfilment);
  const [featured, setFeatured] = useState(brand.featured);
  const [termsNote, setTermsNote] = useState(brand.termsNote);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      className="admin-card"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        const response = await fetch("/api/admin/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "brand", brandId: brand.id, fulfilment, featured, termsNote }),
        });
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        setBusy(false);
        setMessage(response.ok ? "Saved." : payload.error ?? "Could not save.");
        if (response.ok) router.refresh();
      }}
    >
      <div className="flex flex-wrap justify-between gap-2 items-baseline mb-2">
        <h2>{brand.name}</h2>
        <span className="micro muted">Brand terms note (admin only)</span>
      </div>
      <div className="form-grid-2">
        <div className="field">
          <label htmlFor={`fulfilment-${brand.id}`}>Fulfilment mode</label>
          <select
            id={`fulfilment-${brand.id}`}
            className="select"
            value={fulfilment}
            onChange={(event) => setFulfilment(event.target.value)}
          >
            <option value="buy-at-brand">Buy at brand (affiliate / redirect)</option>
            <option value="order-via-butterfly">Order via Butterfly (partner fulfilment)</option>
          </select>
        </div>
        <label className="check mt-6">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          <span>Feature on the home page</span>
        </label>
      </div>
      <div className="field">
        <label htmlFor={`terms-${brand.id}`}>Brand terms &amp; permissions</label>
        <textarea
          id={`terms-${brand.id}`}
          className="textarea"
          style={{ minHeight: 80 }}
          value={termsNote}
          maxLength={600}
          onChange={(event) => setTermsNote(event.target.value)}
        />
        <span className="hint">
          Internal note: affiliation status, image permission, returns owner, current agreement. Never
          shown to customers.
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-sm" disabled={busy}>{busy ? "Saving…" : "Save brand"}</button>
        {message && <span className="micro" role="status">{message}</span>}
      </div>
    </form>
  );
}

export function AdminSettingsForm({
  tiers,
}: {
  tiers: Record<string, { min: number; max: number; label: string }>;
}) {
  const router = useRouter();
  const [values, setValues] = useState({
    "luxury-comfort": { min: tiers["luxury-comfort"].min, max: tiers["luxury-comfort"].max },
    "everyday-value": { min: tiers["everyday-value"].min, max: tiers["everyday-value"].max },
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <form
      className="admin-card"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setMessage("");
        const response = await fetch("/api/admin/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "settings", tiers: values }),
        });
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        setBusy(false);
        setMessage(response.ok ? "Price guide saved." : payload.error ?? "Could not save.");
        if (response.ok) router.refresh();
      }}
    >
      <h2>Price tier guide</h2>
      <p className="hint mb-3">
        The filter and labels use these ranges. They are a positioning guide, not a cap: partner prices
        are always shown as the brand lists them.
      </p>
      {(["luxury-comfort", "everyday-value"] as const).map((key) => (
        <div className="form-grid-2" key={key}>
          <div className="field">
            <label htmlFor={`${key}-min`}>{tiers[key].label} minimum (₹)</label>
            <input
              id={`${key}-min`}
              type="number"
              min={0}
              className="input"
              value={values[key].min}
              onChange={(event) => setValues({ ...values, [key]: { ...values[key], min: Number(event.target.value) } })}
            />
          </div>
          <div className="field">
            <label htmlFor={`${key}-max`}>{tiers[key].label} maximum (₹)</label>
            <input
              id={`${key}-max`}
              type="number"
              min={0}
              className="input"
              value={values[key].max}
              onChange={(event) => setValues({ ...values, [key]: { ...values[key], max: Number(event.target.value) } })}
            />
          </div>
        </div>
      ))}
      <button className="btn btn-sm" disabled={busy}>{busy ? "Saving…" : "Save price guide"}</button>
      {message && <span className="micro ml-3" role="status">{message}</span>}
    </form>
  );
}
