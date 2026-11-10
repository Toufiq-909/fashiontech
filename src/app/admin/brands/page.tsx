import Link from "next/link";
import { AdminGate } from "@/components/AdminGate";
import { AdminBrandEditor } from "@/components/AdminActions";
import { adminUser } from "@/lib/admin";
import { brands } from "@/lib/catalog";
import { fabrics } from "@/lib/config";

export default async function AdminBrandsPage() {
  const admin = await adminUser();
  if (!admin) return <AdminGate />;

  const all = brands();
  const partner = all.filter((brand) => brand.kind === "partner");
  const own = all.filter((brand) => brand.kind === "own-label");

  return (
    <>
      <header className="admin-header">
        <div>
          <p className="eyebrow">Brands</p>
          <h1>Partner directory &amp; terms.</h1>
          <p>{partner.length} partner brands · {own.length} own label. Terms notes are internal.</p>
        </div>
      </header>

      <div className="notice mb-4">
        Each note should record the current commercial arrangement: affiliate or partner fulfilment,
        image permission, who owns returns, and any date the terms were last confirmed. A brand cannot
        be set to “Order via Butterfly” without a signed fulfilment arrangement in real use.
      </div>

      {all.map((brand) => (
        <div key={brand.id} className="mb-4">
          <div className="flex flex-wrap justify-between gap-2 items-center mb-2">
            <div>
              <h2 className="h3">{brand.name}</h2>
              <p className="micro muted">
                {brand.kind === "own-label" ? "Own label" : "Partner"} · {brand.country} · {brand.fabrics.map((fabric) => fabrics[fabric].name).join(" · ")}
                {" · "}
                <a className="link-under" href={brand.website} target="_blank" rel="noopener noreferrer">
                  brand site ↗
                </a>
              </p>
            </div>
            <Link className="mini-btn" href={`/brands/${brand.slug}`}>View public page</Link>
          </div>
          <div className="notice mb-2" style={{ background: "#FEFBF6" }}>
            <strong>India delivery:</strong> {brand.indiaNote}
            <br />
            <strong>Disclosure shown to customers:</strong> {brand.affiliateDisclosure}
          </div>
          <AdminBrandEditor
            brand={{
              id: brand.id,
              name: brand.name,
              fulfilment: brand.fulfilment,
              featured: brand.featured,
              termsNote: brand.termsNote,
            }}
          />
        </div>
      ))}
    </>
  );
}
