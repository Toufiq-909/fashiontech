"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthPanel({ next = "/account" }: { next?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "login" ? { email, password } : { name, email, password },
      ),
    });
    const payload = (await response.json()) as { ok?: boolean; error?: string; role?: string };
    if (!response.ok) {
      setError(payload.error ?? "Could not sign you in.");
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="auth-grid">
      <div>
        <div className="flex gap-2 mb-4" role="tablist" aria-label="Sign in or create an account">
          <button
            type="button"
            className={`chip ${mode === "login" ? "chip-active" : ""}`}
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`chip ${mode === "register" ? "chip-active" : ""}`}
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <h2>{mode === "login" ? "Welcome back." : "Start your Butterfly account."}</h2>
          <p>
            {mode === "login"
              ? "See your orders, wishlist, addresses and saved looks."
              : "Accounts are optional: you can check out as a guest. An account keeps your history in one place."}
          </p>
          {mode === "register" && (
            <div className="field">
              <label htmlFor="auth-name">Name</label>
              <input id="auth-name" className="input" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} autoComplete="name" />
            </div>
          )}
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input id="auth-email" type="email" className="input" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={mode === "register" ? 8 : 1}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
            />
            {mode === "register" && <span className="hint">At least 8 characters.</span>}
          </div>
          {error && <p className="error-text mb-2" role="alert">{error}</p>}
          <button className="btn btn-block" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
          <p className="micro muted mt-3">
            We store your name, email, hashed password, orders, wishlist and addresses. We never store
            try-on photos unless you save a look.
          </p>
        </form>
      </div>
      <div className="auth-card" style={{ background: "#F1DEC4" }}>
        <h2>Why sign in?</h2>
        <ul className="grid gap-2 text-[0.88rem] mt-3">
          <li>Order history and one-tap reorder of basics.</li>
          <li>A wishlist that survives the tab you closed.</li>
          <li>Saved addresses for faster checkout.</li>
          <li>Saved try-on looks, which you can delete any time.</li>
          <li>Verified-buyer reviews on the pieces you own.</li>
        </ul>
        <p className="mt-4 text-[0.82rem] muted">
          Signed-in customers can also review pieces they have bought. Reviews from accounts without
          an order containing that piece are not accepted.
        </p>
      </div>
    </div>
  );
}
