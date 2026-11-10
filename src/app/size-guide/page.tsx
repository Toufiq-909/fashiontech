import Link from "next/link";
import type { Metadata } from "next";
import { sizeGuide } from "@/lib/config";

export const metadata: Metadata = {
  title: "Size guide",
  description:
    "Butterfly's relaxed-fit size guide in inches, how to measure, and what to do when a partner brand's chart differs.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <div className="shell page-main legal-page">
      <nav className="breadcrumbs pt-5" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span>Size guide</span>
      </nav>
      <p className="eyebrow mt-4">Fit</p>
      <h1 className="h1 mt-2">Room to move, measured.</h1>
      <p className="lede mt-3">
        Butterfly pieces are chosen for relaxed fits. Use this as a starting point, then read the
        brand&apos;s own chart where it differs — partner size labels are shown exactly as the brand
        lists them.
      </p>

      <div className="overflow-x-auto mt-6">
        <table className="comparison-table">
          <caption className="sr-only">Body measurements in inches</caption>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest (in)</th>
              <th>Waist (in)</th>
              <th>Hip (in)</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.map((row) => (
              <tr key={row.size}>
                <th scope="row">{row.size}</th>
                <td>{row.chest}</td>
                <td>{row.waist}</td>
                <td>{row.hip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint mt-3">Measurements are body measurements, not garment measurements.</p>

      <h2>How to measure</h2>
      <ul>
        <li><strong>Chest:</strong> around the fullest part, tape level under the arms and across the shoulder blades.</li>
        <li><strong>Waist:</strong> around the natural waist, relaxed — do not pull the tape tight.</li>
        <li><strong>Hip:</strong> around the fullest part, about 20 cm below the waist.</li>
        <li>Wear light clothing and keep the tape parallel to the floor. If you are between sizes, size up for a relaxed fit.</li>
      </ul>

      <h2>Between sizes?</h2>
      <p>
        Our fit philosophy is movement first. For tees and hoodies, choose the larger size if you want
        an oversized look; the smaller size if you want a clean shoulder. For pants and joggers, use
        your waist measurement and allow for the elastic or drawcord.
      </p>

      <h2>Partner size labels</h2>
      <p>
        Some partner brands use UK, US or EU labels. We show the brand&apos;s own label (for example “UK
        10”) rather than translating it silently. Check the brand&apos;s product page or our product
        page&apos;s fit note when you are unsure. If a brand supplies garment measurements, those take
        priority over our guide.
      </p>

      <h2>Custom Butterfly Originals</h2>
      <p>
        Custom pieces use the same blank sizes shown in Design Your Own. They are made to order and are
        not returnable for a sizing change of mind, so measure before ordering. If a custom piece arrives
        with the wrong size label, contact us — that is our error, not a fit preference.
      </p>

      <div className="notice mt-6">
        Need a second opinion?{" "}
        <Link className="link-under" href="/contact">
          Contact us
        </Link>{" "}
        with your measurements and the piece you are considering. We answer with the fit we would choose.
      </div>
      <div className="h-8" />
    </div>
  );
}
