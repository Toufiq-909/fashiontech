import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminAction } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { brandById } from "@/lib/catalog";
import { formatINR, formatDateTime } from "@/lib/format";

export default async function AdminDashboard() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const db = getDb();
  const pending = db.products.filter((product) => product.status === "pending");
  const approved = db.products.filter((product) => product.status === "approved");
  const revenue = db.orders
    .filter((order) => order.payment.status === "paid")
    .reduce((sum, order) => sum + order.total, 0);
  const recentOrders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const recentFeedback = [...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Everything on the rail.</h1>
          <p>Signed in as {admin.name} · {admin.email}</p>
        </div>
        <Link className="btn btn-secondary btn-sm" href="/">
          View the shop
        </Link>
      </header>

      <div className="stat-grid">
        <div className="stat">
          <strong>{pending.length}</strong>
          <span>Imports awaiting review</span>
        </div>
        <div className="stat">
          <strong>{approved.length}</strong>
          <span>Live products</span>
        </div>
        <div className="stat">
          <strong>{db.orders.length}</strong>
          <span>Orders</span>
        </div>
        <div className="stat">
          <strong>{formatINR(revenue)}</strong>
          <span>Paid revenue (test + live)</span>
        </div>
      </div>

      <div className="notice mb-4">
        Everything here mutates the local data store. In a real deployment, replace the JSON store with
        a database and add audit logging for every approval, rejection and order status change.
      </div>

      <section className="admin-card">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <h2>Imports to review</h2>
          <Link className="link-arrow text-[0.82rem]" href="/admin/products">All products</Link>
        </div>
        {pending.length === 0 ? (
          <p className="hint">No pending imports. Upload or sync a feed to stage products.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Brand</th>
                  <th>Fabric claim</th>
                  <th>Why it is pending</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {pending.slice(0, 6).map((product) => (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      <span className="block micro muted">{product.sourceUrl}</span>
                    </td>
                    <td>{brandById(product.brandId)?.name ?? product.brandId}</td>
                    <td>
                      {product.composition}
                      <span className={`status-pill ml-1 ${product.fabricVerified ? "status-approved" : "status-pending"}`}>
                        {product.fabricVerified ? "verified" : "unverified"}
                      </span>
                    </td>
                    <td className="admin-note">{product.compositionSource.slice(0, 120)}</td>
                    <td>
                      <div className="cell-actions">
                        <AdminAction payload={{ type: "product", productId: product.id, action: "approve" }} label="Approve" className="mini-btn mini-btn-approve" />
                        <AdminAction payload={{ type: "product", productId: product.id, action: "reject" }} label="Reject" className="mini-btn mini-btn-reject" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <h2>Recent orders</h2>
          <Link className="link-arrow text-[0.82rem]" href="/admin/orders">Manage orders</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="hint">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.code}>
                    <td><Link className="link-under" href={`/order/${order.code}`}>{order.code}</Link></td>
                    <td>{order.name}<span className="block micro muted">{order.email}</span></td>
                    <td>{formatINR(order.total)}</td>
                    <td>
                      <span className={`status-pill status-${order.payment.status}`}>{order.payment.status}</span>
                      <span className="block micro muted">{order.payment.method} · {order.payment.mode}</span>
                    </td>
                    <td><span className={`status-pill status-${order.status}`}>{order.status}</span></td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="admin-card">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            <h2>Newest feedback</h2>
            <Link className="link-arrow text-[0.82rem]" href="/admin/feedback">All feedback</Link>
          </div>
          {recentFeedback.map((item) => (
            <div key={item.id} className="py-2 border-b border-[rgba(61,60,66,0.12)]">
              <p className="text-[0.85rem]">&ldquo;{item.message.slice(0, 120)}&rdquo;</p>
              <p className="micro muted mt-1">
                {item.name} · {item.rating}/5 · featured: {item.featured ? "yes" : "no"}
              </p>
            </div>
          ))}
        </section>
        <section className="admin-card">
          <h2>Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link className="btn btn-secondary btn-sm" href="/admin/products">Review imports</Link>
            <Link className="btn btn-secondary btn-sm" href="/admin/feeds">Feeds &amp; upload</Link>
            <Link className="btn btn-secondary btn-sm" href="/admin/designs">Custom designs</Link>
            <Link className="btn btn-secondary btn-sm" href="/admin/settings">Settings</Link>
          </div>
          <p className="hint mt-3">
            Fulfilment mode and brand terms live under Brands. Each brand note records image permission,
            affiliate status and who owns returns.
          </p>
        </section>
      </div>
    </>
  );
}
