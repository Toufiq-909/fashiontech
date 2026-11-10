import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminAction } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { productById } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";

export default async function AdminDesignsPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const designs = [...getDb().designs].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Customisation</p>
          <h1>Custom design queue.</h1>
          <p>{designs.length} saved designs. Automatic moderation runs first; spot-check before production.</p>
        </div>
      </header>

      <div className="notice mb-4">
        Designs are only accepted on Butterfly Original blanks. Check that text and artwork are
        original, non-offensive and not copyrighted material the customer does not own. Rejecting does
        not delete the file; keep it for the audit trail, or remove it under your data-retention policy.
      </div>

      {designs.length === 0 ? (
        <div className="empty-state">
          <h2>No custom designs yet.</h2>
          <p>When a customer adds a personalised Butterfly Original to the cart, the design appears here.</p>
          <Link className="btn btn-sm mt-4" href="/design">Open the designer</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Design</th>
                <th>Garment</th>
                <th>Artwork</th>
                <th>Placement</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {designs.map((design) => {
                const product = productById(design.garmentProductId);
                return (
                  <tr key={design.id}>
                    <td>
                      <strong>{design.text || "Artwork only"}</strong>
                      <span className="block micro muted">{design.id}</span>
                      <span className="block micro muted">{formatDateTime(design.id.split("-")[1] ? new Date(Number(design.id.split("-")[1])).toISOString() : new Date().toISOString())}</span>
                    </td>
                    <td>
                      {product ? (
                        <Link className="link-under" href={`/shop/${product.slug}`}>{product.name}</Link>
                      ) : (
                        "Unknown"
                      )}
                      <span className="block micro muted">{design.colour} · {design.fabric}</span>
                    </td>
                    <td>
                      {design.artworkFile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/uploads/${design.artworkFile}`} alt="Customer artwork" style={{ width: 56, height: 56, objectFit: "contain", border: "1px solid rgba(61,60,66,0.15)", borderRadius: 4 }} />
                      ) : (
                        <span className="micro muted">Text only</span>
                      )}
                    </td>
                    <td className="micro">
                      x {design.transform.x}, y {design.transform.y}
                      <span className="block">scale {design.transform.scale}, rotate {design.transform.rotation}°</span>
                    </td>
                    <td>₹{design.price.toLocaleString("en-IN")}</td>
                    <td>
                      <span className={`status-pill status-${design.status === "approved" ? "approved" : design.status === "rejected" ? "rejected" : "pending"}`}>
                        {design.status}
                      </span>
                      <span className="block micro muted" style={{ maxWidth: 180 }}>{design.moderationNote}</span>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <AdminAction payload={{ type: "design", designId: design.id, status: "approved", note: "Approved by admin after spot-check." }} label="Approve" className="mini-btn mini-btn-approve" />
                        <AdminAction payload={{ type: "design", designId: design.id, status: "rejected", note: "Rejected by admin after review." }} label="Reject" className="mini-btn mini-btn-reject" confirmText="Reject this design and stop production?" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
