"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { GarmentArt } from "./GarmentArt";
import { useCart } from "./cart/CartProvider";
import { formatINR } from "@/lib/format";

export function CartView() {
  const { lines, ready, subtotal, remove, setQty, clear } = useCart();
  const shipping = subtotal >= 2000 || subtotal === 0 ? 0 : 99;

  if (!ready) {
    return <p className="muted text-[0.9rem]">Loading your cart…</p>;
  }

  if (lines.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty.</h2>
        <p>
          Pieces sold through Butterfly can be added here. Items marked <em>Buy at brand</em> go
          straight to the brand&apos;s own checkout instead.
        </p>
        <div className="cta-row justify-center mt-4">
          <Link className="btn btn-sm" href="/shop">
            Shop the catalogue
          </Link>
          <Link className="btn btn-secondary btn-sm" href="/try-on">
            Try something on
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <p className="text-[0.85rem] muted">
            {lines.reduce((sum, line) => sum + line.qty, 0)} items ·{" "}
            {lines.length === 1 ? "1 piece" : `${lines.length} pieces`}
          </p>
          <button type="button" className="remove-link" onClick={clear}>
            Empty cart
          </button>
        </div>

        {lines.map((line) => (
          <article className="cart-line" key={line.key}>
            <div className="cart-line-art">
              {line.imageUrl ? (
                <img src={line.imageUrl} alt="" />
              ) : (
                <GarmentArt category={line.category} colour={line.colourHex} />
              )}
            </div>
            <div>
              <h3>
                <Link className="hover:underline decoration-1 underline-offset-4" href={`/shop/${line.slug}`}>
                  {line.name}
                </Link>
              </h3>
              <p className="cart-line-meta">
                From {line.brandName} · {line.composition}
              </p>
              <p className="cart-line-meta">
                {line.colour} · Size {line.size} · Qty {line.qty}
              </p>
              {line.customSummary && (
                <p className="cart-line-meta">
                  <span className="badge badge-pick">Custom</span> {line.customSummary}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="qty" aria-label={`Quantity for ${line.name}`}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQty(line.key, line.qty - 1)}
                  >
                    −
                  </button>
                  <span>{line.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQty(line.key, line.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <button type="button" className="remove-link" onClick={() => remove(line.key)}>
                  Remove
                </button>
              </div>
              {/* <p className="micro muted mt-2">
                {line.fulfilment === "order-via-butterfly"
                  ? "Order via Butterfly · we forward it to the brand"
                  : "Buy at brand"}
              </p> */}
            </div>
            <div className="cart-line-right">
              <span>{formatINR(line.unitPrice * line.qty)}</span>
              <span className="micro muted font-normal">{formatINR(line.unitPrice)} each</span>
            </div>
          </article>
        ))}

        <p className="hint mt-4">
          Customised Butterfly Originals are made to order and cannot be returned unless faulty.
        </p>
      </div>

      <aside className="summary-card sticky-side" aria-label="Order summary">
        <h2>Order summary</h2>
        <div className="summary-row">
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
        {subtotal < 2000 && (
          <p className="hint mt-2">Add {formatINR(2000 - subtotal)} for free delivery.</p>
        )}
        <Link className="btn btn-block mt-4" href="/checkout">
          Checkout
        </Link>
        <Link className="btn btn-secondary btn-block mt-2" href="/shop">
          Keep shopping
        </Link>
        <p className="micro muted mt-3">
          Guest checkout available. Payment in test mode until gateway keys are configured; no money
          is collected.
        </p>
      </aside>
    </div>
  );
}
