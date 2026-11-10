import { AdminGate } from "@/components/AdminGate";
import { AdminSettingsForm } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { site } from "@/lib/config";

export default async function AdminSettingsPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const db = getDb();
  const envChecks = [
    { name: "TRYON_API_URL", label: "Virtual try-on provider URL" },
    { name: "TRYON_API_KEY", label: "Virtual try-on provider key" },
    { name: "RAZORPAY_KEY_ID", label: "Razorpay key id" },
    { name: "RAZORPAY_KEY_SECRET", label: "Razorpay key secret" },
    { name: "RAZORPAY_MODE", label: "Razorpay mode (live / test)" },
    { name: "ADMIN_EMAIL", label: "Admin email override" },
    { name: "ADMIN_PASSWORD", label: "Admin password override" },
    { name: "BUTTERFLY_DATA_DIR", label: "Data directory override" },
    { name: "NEXT_PUBLIC_SITE_URL", label: "Canonical site URL" },
  ];
  const feedEnv = [...new Set(db.feeds.flatMap((feed) => feed.credentialEnvVars))];

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Store configuration.</h1>
          <p>Price guides, integration status and operating notes.</p>
        </div>
      </header>

      <AdminSettingsForm tiers={db.settings.tiers} />

      <section className="admin-card">
        <h2>Integration status</h2>
        <p className="hint mb-2">Only whether a value is configured is shown; secret values are never rendered.</p>
        <div className="table-wrap">
          <table className="data-table" style={{ minWidth: 460 }}>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Purpose</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {envChecks.map((entry) => (
                <tr key={entry.name}>
                  <td><code>{entry.name}</code></td>
                  <td>{entry.label}</td>
                  <td>
                    <span className={`status-pill ${process.env[entry.name] ? "status-approved" : "status-pending"}`}>
                      {process.env[entry.name] ? "configured" : "not set"}
                    </span>
                  </td>
                </tr>
              ))}
              {feedEnv.map((name) => (
                <tr key={name}>
                  <td><code>{name}</code></td>
                  <td>Feed credential</td>
                  <td>
                    <span className={`status-pill ${process.env[name] ? "status-approved" : "status-pending"}`}>
                      {process.env[name] ? "configured" : "not set"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint mt-3">
          Without try-on keys, the site uses the labelled 2D overlay. Without payment keys, checkout
          runs in labelled test mode and collects no money. Add values to an untracked <code>.env</code>{" "}
          and restart the server.
        </p>
      </section>

      <section className="admin-card">
        <h2>Store details</h2>
        <dl className="dl">
          <div><dt>Site name</dt><dd>{site.name}</dd></div>
          <div><dt>Tagline</dt><dd>{site.tagline}</dd></div>
          <div><dt>Support email</dt><dd>{site.email}</dd></div>
          <div><dt>Support phone</dt><dd>{site.phone}</dd></div>
          <div><dt>Registered address</dt><dd>{site.address}</dd></div>
          <div><dt>Canonical URL</dt><dd>{site.url}</dd></div>
          <div><dt>Data directory</dt><dd>{process.env.BUTTERFLY_DATA_DIR ?? ".data"}</dd></div>
        </dl>
        <p className="hint mt-3">
          These are read from <code>src/lib/config.ts</code>. Change them there before going live.
        </p>
      </section>

      <section className="admin-card">
        <h2>Operating notes</h2>
        <ul className="text-[0.86rem] grid gap-2" style={{ listStyle: "disc", paddingLeft: "1.1rem" }}>
          <li>The product catalogue is curated: only 50%+ Merino or Lyocell pieces with a verified composition.</li>
          <li>“Fabric verified” must come from brand product data or Butterfly&apos;s tech pack, not a guess.</li>
          <li>Brand terms notes are internal and should record image permission and returns ownership.</li>
          <li>Try-on photos are session-only unless the customer saves a look; saved looks must be deletable.</li>
          <li>Custom designs are moderated automatically and spot-checked before production.</li>
          <li>Test orders are visibly labelled; do not mix them into live revenue reporting.</li>
        </ul>
      </section>
    </>
  );
}
