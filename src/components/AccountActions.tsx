"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function AddressForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
    phone: "",
  });

  if (!open) {
    return (
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        Add an address
      </button>
    );
  }

  return (
    <form
      className="auth-card mt-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setBusy(true);
        const response = await fetch("/api/account/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const payload = (await response.json()) as { ok?: boolean; error?: string };
        setBusy(false);
        if (!response.ok) {
          setError(payload.error ?? "Could not save the address.");
          return;
        }
        setOpen(false);
        router.refresh();
      }}
    >
      <h3 className="h3 mb-2">New address</h3>
      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="addr-label">Label</label>
          <input id="addr-label" className="input" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} maxLength={40} />
        </div>
        <div className="field">
          <label htmlFor="addr-phone">Phone</label>
          <input id="addr-phone" className="input" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required maxLength={20} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="addr-line1">Address line 1</label>
        <input id="addr-line1" className="input" value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} required maxLength={160} />
      </div>
      <div className="field">
        <label htmlFor="addr-line2">Address line 2</label>
        <input id="addr-line2" className="input" value={form.line2} onChange={(event) => setForm({ ...form, line2: event.target.value })} maxLength={160} />
      </div>
      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="addr-city">City</label>
          <input id="addr-city" className="input" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required maxLength={80} />
        </div>
        <div className="field">
          <label htmlFor="addr-state">State</label>
          <input id="addr-state" className="input" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} required maxLength={80} />
        </div>
      </div>
      <div className="field" style={{ maxWidth: 180 }}>
        <label htmlFor="addr-pin">PIN code</label>
        <input id="addr-pin" className="input" value={form.pin} onChange={(event) => setForm({ ...form, pin: event.target.value })} required pattern="[0-9]{6}" maxLength={6} />
      </div>
      {error && <p className="error-text mb-2" role="alert">{error}</p>}
      <div className="cta-row">
        <button className="btn btn-sm" disabled={busy}>{busy ? "Saving…" : "Save address"}</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
