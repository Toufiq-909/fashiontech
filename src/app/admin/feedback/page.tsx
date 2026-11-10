import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminAction } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { productById } from "@/lib/catalog";
import { formatDateTime } from "@/lib/format";

export default async function AdminFeedbackPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const db = getDb();
  const feedback = [...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const reviews = [...db.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Community</p>
          <h1>Feedback &amp; reviews.</h1>
          <p>{feedback.length} general notes · {reviews.length} product reviews. Feature the best on the home page.</p>
        </div>
      </header>

      <div className="notice mb-4">
        Featuring is editorial. A featured feedback item appears in the home-page quote row; featured
        reviews remain on their product page. Never edit a customer&apos;s words without telling them.
      </div>

      <section className="admin-card">
        <h2>General feedback</h2>
        {feedback.length === 0 && <p className="hint">No feedback yet.</p>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>From</th>
                <th>Rating</th>
                <th>Message</th>
                <th>Photo</th>
                <th>Received</th>
                <th>Featured</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.name}
                    <span className="block micro muted">{item.email}</span>
                  </td>
                  <td>{item.rating}/5</td>
                  <td style={{ maxWidth: 380 }}>{item.message}</td>
                  <td>
                    {item.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/uploads/${item.photo}`} alt={`Photo from ${item.name}`} style={{ width: 56, height: 72, objectFit: "cover", borderRadius: 6 }} />
                    ) : (
                      <span className="micro muted">—</span>
                    )}
                  </td>
                  <td className="micro">{formatDateTime(item.createdAt)}</td>
                  <td>{item.featured ? "Yes" : "No"}</td>
                  <td>
                    <AdminAction
                      payload={{ type: "feedback", id: item.id, value: !item.featured }}
                      label={item.featured ? "Unfeature" : "Feature"}
                      className={item.featured ? "mini-btn" : "mini-btn mini-btn-approve"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-card">
        <h2>Product reviews</h2>
        <p className="hint mb-2">Reviews are verified-buyer only. Moderation here is visibility, not deletion.</p>
        {reviews.length === 0 && <p className="hint">No reviews yet.</p>}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Received</th>
                <th>Featured</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => {
                const product = productById(review.productId);
                return (
                  <tr key={review.id}>
                    <td>
                      {product ? (
                        <Link className="link-under" href={`/shop/${product.slug}`}>{product.name}</Link>
                      ) : (
                        <span className="micro muted">Removed product</span>
                      )}
                    </td>
                    <td>
                      {review.name}
                      <span className="block micro muted">{review.verified ? "Verified buyer" : "Unverified"}</span>
                    </td>
                    <td>{review.rating}/5</td>
                    <td style={{ maxWidth: 360 }}>{review.body}</td>
                    <td className="micro">{formatDateTime(review.createdAt)}</td>
                    <td>{review.featured ? "Yes" : "No"}</td>
                    <td>
                      <AdminAction
                        payload={{ type: "review", reviewId: review.id, value: !review.featured }}
                        label={review.featured ? "Unfeature" : "Feature"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
