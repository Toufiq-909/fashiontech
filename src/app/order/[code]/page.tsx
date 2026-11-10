import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { formatINR, formatDateTime } from "@/lib/format";

export const metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

const STEPS = ["placed", "confirmed", "forwarded", "shipped", "delivered"] as const;

export default async function OrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = getDb().orders.find((entry) => entry.code.toUpperCase() === code.toUpperCase());
  if (!order) notFound();

  const currentStep = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const paymentLabel =
    order.payment.method === "cod"
      ? "Cash on delivery"
      : order.payment.method === "upi"
        ? "UPI"
        : "Card";

  return (
    <div className="shell page-main">
      <div className="order-success py-10">
        <div className="notice notice-peach">
          <strong>Order {order.code}</strong> · placed {formatDateTime(order.createdAt)}. This page is
          your confirmation; keep the link to track it.
        </div>

        <header className="page-head">
          <p className="eyebrow">Thank you</p>
          <h1 className="h1 mt-2">
            {order.status === "delivered" ? "It arrived." : "Your order is moving."}
          </h1>
          <p className="lede mt-3">
            {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} from{" "}
            {[...new Set(order.items.map((item) => item.brandName))].join(" and ")}. Butterfly has your
            order; each brand ships its own piece.
          </p>
        </header>

        <section className="card p-5 mb-6">
          <div className="flex flex-wrap justify-between gap-3 items-start">
            <div>
              <h2 className="h3">Status</h2>
              <p className="text-[0.88rem] mt-1">
                <span className={`status-pill status-${order.status}`}>{order.status}</span>{" "}
                {order.status === "placed" && "Awaiting confirmation."}
                {order.status === "confirmed" && "Confirmed. Preparing to forward."}
                {order.status === "forwarded" && "Forwarded to the brand for fulfilment."}
                {order.status === "shipped" && "Shipped by the brand."}
                {order.status === "delivered" && "Delivered."}
                {order.status === "cancelled" && "Cancelled."}
              </p>
            </div>
            <div className="text-right">
              <h2 className="h3">Total</h2>
              <p className="price-big">{formatINR(order.total)}</p>
              <p className="micro muted">
                {formatINR(order.subtotal)} + {order.shipping === 0 ? "free delivery" : `${formatINR(order.shipping)} delivery`}
              </p>
            </div>
          </div>

          <div className="order-timeline mt-5">
            {STEPS.map((step, index) => {
              const event = order.timeline.find((entry) =>
                entry.label.toLowerCase().includes(step === "confirmed" ? "payment" : step),
              );
              return (
                <div key={step} className={`timeline-step ${index <= currentStep ? "is-done" : ""}`}>
                  <span className="timeline-dot" aria-hidden="true">{index + 1}</span>
                  <div>
                    <strong>{step === "placed" ? "Order placed" : step.charAt(0).toUpperCase() + step.slice(1)}</strong>
                    <span>{event ? formatDateTime(event.at) : "Pending"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="notice mt-2">
            <strong>Payment:</strong> {paymentLabel} · {order.payment.status} ({order.payment.mode} mode)
            {order.payment.providerRef && (
              <span className="micro muted"> · ref {order.payment.providerRef}</span>
            )}
            {order.payment.mode === "test" && (
              <p className="micro muted mt-1">Test mode: no money was collected for this order.</p>
            )}
          </div>
        </section>

        <section className="card p-5 mb-6">
          <h2 className="h3 mb-3">Pieces</h2>
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.colour}`} className="flex justify-between gap-4 py-2 border-b border-[rgba(61,60,66,0.12)]">
              <div>
                <Link className="link-under font-semibold text-[0.9rem]" href={`/shop/${item.slug}`}>
                  {item.name}
                </Link>
                <p className="micro muted">
                  {item.brandName} · {item.composition} · {item.colour} · {item.size} · ×{item.qty}
                </p>
                {item.customSummary && <p className="micro" style={{ color: "#7F5283" }}>Custom: {item.customSummary}</p>}
                <p className="micro muted">
                  {item.fulfilment === "order-via-butterfly"
                    ? "Order via Butterfly · brand ships"
                    : "Buy at brand"}
                </p>
              </div>
              <span className="font-semibold text-[0.9rem] whitespace-nowrap">
                {formatINR(item.unitPrice * item.qty)}
              </span>
            </div>
          ))}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatINR(order.total)}</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 mb-6">
          <div className="card p-5">
            <h2 className="h3 mb-2">Delivering to</h2>
            <p className="text-[0.88rem] leading-relaxed">
              {order.name}
              <br />
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
              <br />
              {order.address.city}, {order.address.state} {order.address.pin}
              <br />
              {order.address.phone}
              <br />
              {order.email}
            </p>
          </div>
          <div className="card p-5">
            <h2 className="h3 mb-2">What happens now</h2>
            <p className="text-[0.88rem] leading-relaxed muted">
              Butterfly forwards the order to the brand named on each piece. Delivery windows depend on
              the brand; Indian partner orders typically arrive in 3–7 working days. Custom Butterfly
              Originals take 5–8 working days.
            </p>
            <Link className="link-arrow mt-3 inline-flex" href="/shipping-returns">
              Shipping and returns by mode
            </Link>
          </div>
        </section>

        <div className="cta-row">
          <Link className="btn btn-sm" href="/shop">
            Continue shopping
          </Link>
          <Link className="btn btn-secondary btn-sm" href="/track">
            Track another order
          </Link>
          <Link className="link-arrow" href="/feedback">
            Tell us how it went
          </Link>
        </div>
        <p className="micro muted mt-5">
          Need help? Email{" "}
          <a className="link-under" href="mailto:hello@butterfly.example">
            hello@butterfly.example
          </a>{" "}
          with order {order.code}.
        </p>
      </div>
    </div>
  );
}
