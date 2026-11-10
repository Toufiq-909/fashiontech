import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminAction } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { brandById, productById } from "@/lib/catalog";
import { formatINR, formatDateTime } from "@/lib/format";

export default async function AdminOrdersPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const orders = [...getDb().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const toForward = orders.filter((order) => order.status === "confirmed" || order.status === "placed");
  const openValue = orders
    .filter((order) => !["delivered", "cancelled"].includes(order.status))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Orders</p>
          <h1>Fulfilment queue.</h1>
          <p>{orders.length} orders · {toForward.length} need forwarding · {formatINR(openValue)} open value</p>
        </div>
      </header>

      <div className="notice mb-4">
        Butterfly takes the order and payment, then forwards it to the brand. Use “Forward” once the
        brand has confirmed stock, then update to shipped and delivered as the brand reports back. For
        buy-at-brand items there is no Butterfly order — those customers check out on the brand&apos;s
        site.
      </div>

      {orders.length === 0 && <p className="hint">No orders yet.</p>}

      {orders.map((order) => (
        <section className="admin-card" key={order.code}>
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <h2>
                <Link className="link-under" href={`/order/${order.code}`}>{order.code}</Link>
              </h2>
              <p className="micro muted">
                {formatDateTime(order.createdAt)} · {order.name} · {order.email} · {order.address.city}, {order.address.state} {order.address.pin}
              </p>
            </div>
            <div className="text-right">
              <span className={`status-pill status-${order.status}`}>{order.status}</span>
              <p className="font-semibold mt-1">{formatINR(order.total)}</p>
              <p className="micro muted">
                {order.payment.method} · <span className={`status-pill status-${order.payment.status}`}>{order.payment.status}</span> · {order.payment.mode}
              </p>
            </div>
          </div>

          <div className="table-wrap mt-3">
            <table className="data-table" style={{ minWidth: 620 }}>
              <thead>
                <tr>
                  <th>Piece</th>
                  <th>Brand</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Custom</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const product = productById(item.productId);
                  const brand = brandById(item.brandId);
                  return (
                    <tr key={`${item.productId}-${item.size}-${item.colour}`}>
                      <td>
                        <Link className="link-under" href={`/shop/${item.slug}`}>{item.name}</Link>
                        <span className="block micro muted">{item.composition}</span>
                      </td>
                      <td>
                        {item.brandName}
                        <span className="block micro muted">{brand?.fulfilment ?? item.fulfilment}</span>
                      </td>
                      <td>{item.colour} · {item.size}</td>
                      <td>{item.qty}</td>
                      <td>{formatINR(item.unitPrice)}</td>
                      <td>
                        {item.customDesignId ? (
                          <Link className="link-under micro" href="/admin/designs">{item.customDesignId}</Link>
                        ) : (
                          <span className="micro muted">—</span>
                        )}
                        {item.customSummary && <span className="block micro muted">{item.customSummary}</span>}
                        {product?.images[0]?.kind === "placeholder" && (
                          <span className="block micro muted">placeholder art</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {order.payment.status !== "paid" && order.payment.method !== "cod" && (
              <AdminAction payload={{ type: "order", code: order.code, action: "paid" }} label="Mark paid" />
            )}
            {!["forwarded", "shipped", "delivered", "cancelled"].includes(order.status) && (
              <AdminAction payload={{ type: "order", code: order.code, action: "forward" }} label="Forward to brand" className="mini-btn mini-btn-approve" />
            )}
            {["forwarded", "confirmed"].includes(order.status) && (
              <AdminAction payload={{ type: "order", code: order.code, action: "ship" }} label="Mark shipped" />
            )}
            {order.status === "shipped" && (
              <AdminAction payload={{ type: "order", code: order.code, action: "deliver" }} label="Mark delivered" className="mini-btn mini-btn-approve" />
            )}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <AdminAction payload={{ type: "order", code: order.code, action: "cancel" }} label="Cancel" className="mini-btn mini-btn-reject" confirmText="Cancel this order? Record the reason separately with the brand." />
            )}
            <a className="mini-btn" href={`mailto:${order.email}?subject=Butterfly%20order%20${order.code}`}>
              Email customer
            </a>
          </div>

          <p className="micro muted mt-3">
            Timeline: {order.timeline.map((event) => `${event.label} (${formatDateTime(event.at)})`).join(" → ")}
          </p>
        </section>
      ))}
    </>
  );
}
