/* eslint-disable @next/next/no-img-element */
import { GarmentArt } from "./GarmentArt";
import type { Product } from "@/lib/types";

export function ProductVisual({
  product,
  brandTone = "#F1DEC4",
  priority = false,
  showNote = true,
}: {
  product: Product;
  brandTone?: string;
  priority?: boolean;
  showNote?: boolean;
}) {
  const image = product.images[0];
  const colour = product.colours[0]?.hex ?? "#F1DEC4";

  if (image && image.url && image.kind !== "placeholder") {
    return (
      <>
        <img
          src={image.url}
          alt={`${product.name} — product image`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {showNote && (
          <span className="ph-note" style={{ background: "rgba(254,251,246,0.9)" }}>
            {image.credit}
          </span>
        )}
      </>
    );
  }

  return (
    <>
      <GarmentArt category={product.category} colour={colour} tone={brandTone} />
      {showNote && <span className="ph-note">Brand image not supplied — illustrated placeholder</span>}
    </>
  );
}
