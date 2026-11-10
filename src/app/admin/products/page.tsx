import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminAction } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { brandById } from "@/lib/catalog";
import { formatINR, formatDate } from "@/lib/format";

export default async function AdminProductsPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const products = [...getDb().products].sort((a, b) => {
    const rank = { pending: 0, approved: 1, rejected: 2 };
    return rank[a.status] - rank[b.status] || a.name.localeCompare(b.name);
  });
  const pending = products.filter((product) => product.status === "pending");

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Imported products.</h1>
          <p>{pending.length} pending · {products.length} total. Approve only when the composition is verified.</p>
        </div>
      </header>

      <div className="notice notice-peach mb-4">
        A product should not be approved unless its composition came from the brand&apos;s own product
        data (or our tech pack for Butterfly Originals) and its imagery is either supplied with
        permission or a labelled placeholder. Rejecting keeps the audit trail.
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand / category</th>
              <th>Fabric</th>
              <th>Price</th>
              <th>Fulfilment</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const brand = brandById(product.brandId);
              return (
                <tr key={product.id}>
                  <td>
                    <Link className="link-under font-semibold" href={`/shop/${product.slug}`}>{product.name}</Link>
                    <span className="block micro muted">{product.sourceUrl}</span>
                    <span className="block micro muted">
                      Try-on: {product.tryOnEligible ? "yes" : "no"} · Custom: {product.customisable ? "yes" : "no"} · Image: {product.images[0]?.kind}
                    </span>
                  </td>
                  <td>
                    {brand?.name ?? product.brandId}
                    <span className="block micro muted">{product.category}</span>
                  </td>
                  <td>
                    {product.composition}
                    <span className={`status-pill ml-1 ${product.fabricVerified ? "status-approved" : "status-pending"}`}>
                      {product.fabricVerified ? "verified" : "unverified"}
                    </span>
                    <span className="block micro muted">Main fibre: {product.fabricPercent}% {product.fabric}</span>
                  </td>
                  <td>
                    {formatINR(product.priceINR)}
                    <span className="block micro muted">
                      {product.sourceCurrency === "INR" ? "source INR" : `${product.sourceCurrency} ${product.sourcePrice}`}
                    </span>
                  </td>
                  <td>
                    {brand?.fulfilment === "buy-at-brand" ? "Buy at brand" : "Order via Butterfly"}
                    <span className="block micro muted">{product.availability}</span>
                  </td>
                  <td>
                    <span className={`status-pill status-${product.status}`}>{product.status}</span>
                    {product.butterflyPick && <span className="status-pill ml-1">Pick</span>}
                  </td>
                  <td className="micro">{formatDate(product.lastSyncedAt)}</td>
                  <td>
                    <div className="cell-actions">
                      {product.status !== "approved" && (
                        <AdminAction payload={{ type: "product", productId: product.id, action: "approve" }} label="Approve" className="mini-btn mini-btn-approve" />
                      )}
                      {product.status !== "rejected" && (
                        <AdminAction payload={{ type: "product", productId: product.id, action: "reject" }} label="Reject" className="mini-btn mini-btn-reject" confirmText="Reject this product? It will be hidden from the shop." />
                      )}
                      <AdminAction
                        payload={{ type: "product", productId: product.id, action: "feature", value: !product.butterflyPick }}
                        label={product.butterflyPick ? "Unpick" : "Make Pick"}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="hint mt-4">
        New imports are staged from permitted feeds or admin CSV/JSON upload. See{" "}
        <Link className="link-under" href="/admin/feeds">Feeds &amp; import</Link>. We never scrape
        websites for products or reuse brand photography without permission.
      </p>
    </>
  );
}
