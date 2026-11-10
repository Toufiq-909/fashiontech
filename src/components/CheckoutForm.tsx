"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart/CartProvider";
import { formatINR } from "@/lib/format";

interface Prefill {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
}

export function CheckoutForm({
  prefill,
  signedIn,
  paymentMode,
}: {
  prefill: Prefill;
  signedIn: boolean;
  paymentMode: "test" | "live";
}) {
  const { lines, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<Prefill>(prefill);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const shipping = subtotal >= 2000 ? 0 : 99;

  function update(field: keyof Prefill, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!accepted) {
      setError("Please accept the terms, returns policy and privacy notice.");
      return;
    }
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((line) => ({
            productId: line.productId,
            size: line.size,
            colour: line.colour,
            qty: line.qty,
            customDesignId: line.customDesignId,
          })),
          name: form.name,
          email: form.email,
          address: {
            line1: form.line1,
            line2: form.line2,
            city: form.city,
            state: form.state,
            pin: form.pin,
            phone: form.phone,
          },
          paymentMethod,
          acceptedTerms: accepted,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; code?: string; error?: string };
      if (!response.ok || !payload.code) {
        setError(payload.error ?? "Could not place the order. Nothing was charged.");
        setBusy(false);
        return;
      }
      clear();
      router.push(`/order/${payload.code}`);
      router.refresh();
    } catch {
      setError("Network error. Nothing was charged; please retry.");
      setBusy(false);
    }
  }

  if (!ready) return <p className="muted">Loading checkout…</p>;

  if (!lines.length) {
    return (
      <div className="empty-state">
        <h2>Nothing to check out.</h2>
        <p>Add a piece sold through Butterfly and come back. Buy-at-brand items check out on the brand&apos;s site.</p>
        <div className="cta-row justify-center mt-4">
          <Link className="btn btn-sm" href="/shop">
            Shop the catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="checkout-grid" onSubmit={submit}>
      <div>
        <div className="form-section">
          <h2>Contact</h2>
          {!signedIn && (
            <p className="hint mb-3">
              Checking out as a guest.{" "}
              <Link className="link-under" href="/account?next=/checkout">
                Sign in
              </Link>{" "}
              to use saved addresses and see order history.
            </p>
          )}
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="checkout-name">Full name</label>
              <input id="checkout-name" className="input" value={form.name} onChange={(event) => update("name", event.target.value)} required maxLength={80} autoComplete="name" />
            </div>
            <div className="field">
              <label htmlFor="checkout-phone">Phone</label>
              <input id="checkout-phone" className="input" value={form.phone} onChange={(event) => update("phone", event.target.value)} required maxLength={20} autoComplete="tel" placeholder="+91…" />
            </div>
          </div>
          <div className="field">
            <label htmlFor="checkout-email">Email</label>
            <input id="checkout-email" type="email" className="input" value={form.email} onChange={(event) => update("email", event.target.value)} required maxLength={160} autoComplete="email" />
            <span className="hint">Order confirmation and tracking are sent here.</span>
          </div>
        </div>

        <div className="form-section">
          <h2>Delivery address</h2>
          <div className="field">
            <label htmlFor="checkout-line1">Address line 1</label>
            <input id="checkout-line1" className="input" value={form.line1} onChange={(event) => update("line1", event.target.value)} required maxLength={160} autoComplete="address-line1" />
          </div>
          <div className="field">
            <label htmlFor="checkout-line2">Address line 2 (optional)</label>
            <input id="checkout-line2" className="input" value={form.line2} onChange={(event) => update("line2", event.target.value)} maxLength={160} autoComplete="address-line2" />
          </div>
          <div className="form-grid-2">
            <div className="field">
              <label htmlFor="checkout-city">City</label>
              <input id="checkout-city" className="input" value={form.city} onChange={(event) => update("city", event.target.value)} required maxLength={80} autoComplete="address-level2" />
            </div>
            <div className="field">
              <label htmlFor="checkout-state">State</label>
              <input id="checkout-state" className="input" value={form.state} onChange={(event) => update("state", event.target.value)} required maxLength={80} autoComplete="address-level1" />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 220 }}>
            <label htmlFor="checkout-pin">PIN code</label>
            <input id="checkout-pin" className="input" value={form.pin} onChange={(event) => update("pin", event.target.value)} required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" />
          </div>
        </div>

        <div className="form-section">
          <h2>
            Payment <span className="test-pill">{paymentMode === "live" ? "live" : "test mode"}</span>
          </h2>
          <div className="pay-options">
            {[
              { id: "upi", title: "UPI", note: "Google Pay, PhonePe, Paytm or any UPI app." },
              { id: "card", title: "Card", note: "Credit or debit card via the payment gateway." },
              { id: "cod", title: "Cash on delivery", note: "Pay the courier. Available on eligible PIN codes." },
            ].map((option) => (
              <label className="pay-option" key={option.id}>
                <input
                  type="radio"
                  name="payment"
                  value={option.id}
                  checked={paymentMethod === option.id}
                  onChange={() => setPaymentMethod(option.id as typeof paymentMethod)}
                />
                <span>
                  <strong>{option.title}</strong>
                  <small>{option.note}</small>
                </span>
              </label>
            ))}
          </div>
          <p className="hint mt-3">
            {paymentMode === "live"
              ? "Razorpay is configured in live mode. Payment authorisation is completed after the order is created."
              : "Test mode: no payment gateway keys are configured, so no money is collected. UPI and card orders are marked paid for demonstration; COD remains pending."}
          </p>
        </div>

        <label className="check mb-4">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} required />
          <span>
            I agree to the{" "}
            <Link className="link-under" href="/terms">
              terms
            </Link>
            , the{" "}
            <Link className="link-under" href="/shipping-returns">
              returns policy
            </Link>{" "}
            and the{" "}
            <Link className="link-under" href="/privacy">
              privacy notice
            </Link>
            . I understand that Butterfly forwards orders to the brand named on each piece.
          </span>
        </label>

        {error && (
          <p className="notice notice-warn mb-3" role="alert">
            {error}
          </p>
        )}

        <button className="btn btn-block" disabled={busy}>
          {busy ? "Placing order…" : `Place order · ${formatINR(subtotal + shipping)}`}
        </button>
      </div>

      <aside className="summary-card" aria-label="Order summary">
        <h2>Your order</h2>
        {lines.map((line) => (
          <div className="flex justify-between gap-3 py-2 border-b border-[rgba(61,60,66,0.15)]" key={line.key}>
            <div>
              <p className="text-[0.84rem] font-semibold">{line.name}</p>
              <p className="micro muted">
                {line.brandName} · {line.colour} · {line.size} · ×{line.qty}
              </p>
              {line.customSummary && <p className="micro" style={{ color: "#7F5283" }}>Custom design</p>}
            </div>
            <span className="text-[0.84rem] font-semibold whitespace-nowrap">
              {formatINR(line.unitPrice * line.qty)}
            </span>
          </div>
        ))}
        <div className="summary-row mt-3">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
        </div>
        <div className="summary-row summary-total">
          <span>Total</span>
          <span>{formatINR(subtotal + shipping)}</span>
        </div>
        <p className="hint mt-3">
          Each piece ships from the brand named on it. Delivery windows are shown on the product page.
          Custom pieces take 5–8 working days.
        </p>
      </aside>
    </form>
  );
}
