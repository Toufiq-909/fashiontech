"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/lib/config";

export function AdminImportForm({ brands }: { brands: { id: string; name: string }[] }) {
  const router = useRouter();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [adapter, setAdapter] = useState<"csv" | "json">("csv");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="admin-card"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        if (!file) {
          setError("Choose a CSV or JSON file.");
          return;
        }
        setBusy(true);
        const text = await file.text();
        const response = await fetch("/api/admin/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandId, adapter, text }),
        });
        const payload = (await response.json()) as {
          ok?: boolean;
          imported?: number;
          skipped?: number;
          warnings?: string[];
          error?: string;
        };
        setBusy(false);
        if (!response.ok) {
          setError(payload.error ?? "Import failed.");
          return;
        }
        setMessage(
          `Imported ${payload.imported ?? 0} ${payload.imported === 1 ? "product" : "products"} as pending review${payload.skipped ? `, skipped ${payload.skipped} duplicate${payload.skipped === 1 ? "" : "s"}` : ""}.${payload.warnings?.length ? ` ${payload.warnings.join(" ")}` : ""}`,
        );
        setFile(null);
        router.refresh();
      }}
    >
      <h2>Upload a product file</h2>
      <p className="hint mb-3">
        CSV or JSON from a source you are permitted to use (brand feed export, affiliate feed or a
        partner hand-off). Uploaded products are staged as <strong>pending</strong> until approved.
        Never upload scraped data or images you do not have rights to.
      </p>
      <div className="form-grid-2">
        <div className="field">
          <label htmlFor="import-brand">Brand</label>
          <select id="import-brand" className="select" value={brandId} onChange={(event) => setBrandId(event.target.value)} required>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="import-type">Format</label>
          <select id="import-type" className="select" value={adapter} onChange={(event) => setAdapter(event.target.value as "csv" | "json")}>
            <option value="csv">CSV</option>
            <option value="json">JSON array</option>
          </select>
        </div>
      </div>
      <div className="field">
        <label htmlFor="import-file">File</label>
        <input
          id="import-file"
          type="file"
          accept=".csv,text/csv,.json,application/json"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          required
        />
        <span className="hint">
          Required CSV columns: sku, name, category, fabric, composition, compositionPercent, price,
          currency, sizes, colours, sourceUrl. Sizes use “|” (S|M|L); colours use “Name:#hex|Name:#hex”.
          Categories: {categories.map((category) => category.slug).join(", ")}. Use imageUrl only with
          permission; otherwise leave it blank and the store shows a placeholder.
        </span>
      </div>
      {error && <p className="error-text mb-2" role="alert">{error}</p>}
      {message && <p className="success-panel mb-2" role="status">{message}</p>}
      <button className="btn btn-sm" disabled={busy}>{busy ? "Importing…" : "Import and stage for review"}</button>
    </form>
  );
}
