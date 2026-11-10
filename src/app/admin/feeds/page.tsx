import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminAction } from "@/components/AdminActions";
import { AdminImportForm } from "@/components/AdminImportForm";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { brandById, brands } from "@/lib/catalog";
import { feedAdapterLabel } from "@/lib/feeds/normalise";
import { formatDateTime } from "@/lib/format";

export default async function AdminFeedsPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const db = getDb();
  const feeds = db.feeds;

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Feeds &amp; import</p>
          <h1>Permitted sources only.</h1>
          <p>{feeds.length} configured feeds. Every import is staged for review.</p>
        </div>
      </header>

      <div className="notice mb-4">
        <strong>Source rules.</strong> Supported adapters: official affiliate or partner product feeds,
        brand storefront APIs the brand has granted access to, and CSV/JSON upload from this panel. Do
        not scrape websites or copy product photos without permission. Images are stored only when the
        feed carries an explicit permission flag; otherwise products use a labelled placeholder.
      </div>

      <div className="section-head">
        <h2 className="h2">Feeds</h2>
      </div>

      <div className="table-wrap mb-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Feed</th>
              <th>Brand</th>
              <th>Adapter</th>
              <th>Endpoint</th>
              <th>Last run</th>
              <th>Imported</th>
              <th>Credentials</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((feed) => {
              const credentials = feed.credentialEnvVars.length
                ? feed.credentialEnvVars.map((name) => `${name}${process.env[name] ? " ✓" : " —"}`).join(" · ")
                : "None required";
              return (
                <tr key={feed.id}>
                  <td>{feed.label}</td>
                  <td>{brandById(feed.brandId)?.name ?? feed.brandId}</td>
                  <td>{feedAdapterLabel(feed.adapter)}</td>
                  <td className="micro" style={{ maxWidth: 220, overflowWrap: "anywhere" }}>{feed.endpoint}</td>
                  <td className="micro">{feed.lastRunAt ? formatDateTime(feed.lastRunAt) : "Never"}</td>
                  <td>{feed.importedCount}</td>
                  <td className="micro">{credentials}</td>
                  <td>
                    <span className={`status-pill ${feed.enabled ? "status-approved" : "status-rejected"}`}>
                      {feed.enabled ? "enabled" : "disabled"}
                    </span>
                  </td>
                  <td>
                    <div className="cell-actions">
                      <AdminAction
                        payload={{ type: "feed", feedId: feed.id, enabled: !feed.enabled }}
                        label={feed.enabled ? "Disable" : "Enable"}
                      />
                      <AdminAction
                        payload={{ type: "feed", feedId: feed.id, run: true }}
                        label="Run sync"
                        className="mini-btn mini-btn-approve"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminImportForm brands={brands().map((brand) => ({ id: brand.id, name: brand.name }))} />

      <section className="admin-card">
        <h2>How sync works in this build</h2>
        <p className="text-[0.86rem] muted">
          The seeded feeds are JSON payloads shaped like real partner feeds. “Run sync” updates the feed
          timestamp; API adapters refuse to run until their credential environment variables are set.
          In production, point each feed at a real partner endpoint, verify the composition field
          against the brand&apos;s product data, and keep the pending-review gate before anything goes
          live.
        </p>
        <p className="hint mt-2">
          Need a sample file? Start from{" "}
          <Link className="link-under" href="/admin/products">the products table</Link> and use the CSV
          columns described in the upload form. CSV uploads never overwrite existing SKUs; duplicates
          are skipped.
        </p>
      </section>
    </>
  );
}
