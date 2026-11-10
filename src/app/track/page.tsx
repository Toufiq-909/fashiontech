import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track an order",
  description: "Track a Butterfly order with your order ID and email address.",
  alternates: { canonical: "/track" },
};

type SearchParams = Promise<{ code?: string; email?: string }>;

export default async function TrackPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const code = (params.code ?? "").trim();
  const email = (params.email ?? "").trim().toLowerCase();
  const submitted = Boolean(code && email);
  const order = submitted
    ? getDb().orders.find(
        (entry) =>
          entry.code.toLowerCase() === code.toLowerCase() && entry.email.toLowerCase() === email,
      )
    : undefined;

  return (
    <div className="shell page-main">
      <header className="page-head">
        <p className="eyebrow">Order tracking</p>
        <h1 className="h1 mt-2">Where is it?</h1>
        <p className="lede mt-3">
          Enter the order ID from your confirmation (it looks like BFL-8K2M4Q) and the email used at
          checkout.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form className="form-section" method="get" action="/track">
          <div className="field">
            <label htmlFor="track-code">Order ID</label>
            <input
              id="track-code"
              name="code"
              className="input"
              defaultValue={code}
              placeholder="BFL-XXXXXX"
              required
              maxLength={20}
            />
          </div>
          <div className="field">
            <label htmlFor="track-email">Email</label>
            <input
              id="track-email"
              name="email"
              type="email"
              className="input"
              defaultValue={email}
              required
              maxLength={160}
            />
          </div>
          <button className="btn">Find my order</button>
          <p className="hint mt-3">
            Guest orders are found with this pair. For privacy, we never list orders by email alone.
          </p>
        </form>

        <div>
          {submitted && !order && (
            <div className="notice notice-warn" role="alert">
              <strong>No matching order.</strong> Check the order ID and email, or{" "}
              <Link className="link-under" href="/contact">
                contact us
              </Link>{" "}
              with your payment reference.
            </div>
          )}
          {order && (
            <div className="card p-5">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="eyebrow">Order {order.code}</p>
                  <h2 className="h3 mt-1">
                    <span className={`status-pill status-${order.status}`}>{order.status}</span>
                  </h2>
                </div>
                <p className="text-[0.82rem] muted">Placed {formatDateTime(order.createdAt)}</p>
              </div>
              <p className="text-[0.9rem] mt-4">
                {order.items.length} {order.items.length === 1 ? "piece" : "pieces"} from{" "}
                {[...new Set(order.items.map((item) => item.brandName))].join(" · ")}
              </p>
              <ul className="mt-4 grid gap-2 text-[0.86rem]">
                {order.timeline.map((event) => (
                  <li key={`${event.at}-${event.label}`} className="flex gap-2">
                    <span aria-hidden="true">·</span>
                    <span>
                      {event.label}
                      <span className="block micro muted">{formatDateTime(event.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Link className="btn btn-sm mt-4" href={`/order/${order.code}`}>
                Open full order
              </Link>
            </div>
          )}
          {!submitted && (
            <div className="notice">
              <strong>Where is my order ID?</strong> It is in the confirmation page after checkout and
              in the confirmation email. Signed-in customers can also find it under{" "}
              <Link className="link-under" href="/account">
                account history
              </Link>
              .
            </div>
          )}
        </div>
      </div>
      <div className="h-16" />
    </div>
  );
}
