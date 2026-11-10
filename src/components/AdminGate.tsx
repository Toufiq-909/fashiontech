"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Shown instead of admin content when the session is missing or is not an admin. */
export function AdminGate() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json()) as { ok?: boolean; role?: string; error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Could not sign in.");
      setBusy(false);
      return;
    }
    if (payload.role !== "admin") {
      setError("That account is a customer account. Use an admin account for this panel.");
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-login">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2">Butterfly admin.</h1>
      <p>
        Brand feeds, imported products, orders, feedback, custom designs and settings. Sign in with an
        account that has the admin role.
      </p>
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input id="admin-email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input id="admin-password" type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
        </div>
        {error && <p className="error-text mb-2" role="alert">{error}</p>}
        <button className="btn btn-block" disabled={busy}>{busy ? "Signing in…" : "Sign in to admin"}</button>
      </form>
      <p className="hint mt-4">
        Admin accounts are provisioned in the seeded data store. The demo admin credentials are
        documented in the README; change them before any real use.
      </p>
    </div>
  );
}
