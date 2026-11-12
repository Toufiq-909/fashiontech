"use client";

import { useState } from "react";
import { ProductVisual } from "./ProductVisual";
import { GarmentArt } from "./GarmentArt";
import type { Product } from "@/lib/types";

function withColour(url: string, hex: string) {
  return `${url}${url.includes("?") ? "&" : "?"}colour=${encodeURIComponent(hex)}`;
}

/**
 * Colour views. Owned mockups can be recoloured in place; official partner
 * photography is shown as supplied, with the available colourways listed.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const image = product.images[0];
  const hasPhoto = Boolean(image?.url && image.kind !== "placeholder");
  const isOwned = Boolean(hasPhoto && image?.kind === "owned-mockup");
  const isReference = hasPhoto && !isOwned;
  const colour = product.colours[index] ?? product.colours[0] ?? { name: "As supplied", hex: "#F1DEC4" };

  const view = isOwned && image?.url
    ? { ...product, images: [{ ...image, url: withColour(image.url, colour.hex) }] }
    : isReference
      ? product
      : { ...product, colours: [colour, ...product.colours.filter((entry) => entry !== colour)] };

  return (
    <div>
      <div className="gallery-main">
        <ProductVisual product={view} showNote={false} priority />
        {image?.kind === "placeholder" && (
          <span className="ph-note">Brand image not supplied — illustrated placeholder</span>
        )}
      </div>

      {/* {isOwned ? (
        <div className="gallery-strip" role="group" aria-label="Colour views">
          {product.colours.slice(0, 4).map((entry, position) => (
            <button
              key={entry.name}
              type="button"
              className={`gallery-thumb ${index === position ? "is-active" : ""}`}
              aria-label={`View in ${entry.name}`}
              aria-pressed={index === position}
              onClick={() => setIndex(position)}
            >
              <GarmentArt category={product.category} colour={entry.hex} />
              <span className="ph-note">{entry.name}</span>
            </button>
          ))}
        </div>
      ) : isReference ? (
        <div className="mt-3">
          <p className="field-label mb-1.5">Colours available from the brand</p>
          <ul className="flex flex-wrap gap-1.5" aria-label="Available colours">
            {product.colours.map((entry) => (
              <li key={entry.name} className="tag">
                <span className="swatch-dot" style={{ background: entry.hex }} aria-hidden="true" />
                {entry.name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="gallery-strip" role="group" aria-label="Colour views">
          {product.colours.slice(0, 4).map((entry, position) => (
            <button
              key={entry.name}
              type="button"
              className={`gallery-thumb ${index === position ? "is-active" : ""}`}
              aria-label={`View in ${entry.name}`}
              aria-pressed={index === position}
              onClick={() => setIndex(position)}
            >
              <GarmentArt category={product.category} colour={entry.hex} />
              <span className="ph-note">{entry.name}</span>
            </button>
          ))}
        </div>
      )} */}

      {/* <p className="micro muted mt-2">
        {image?.credit ?? "Illustrated placeholder"}.
        {isReference
          ? " Official brand image; other colourways may differ. "
          : " Product colours may vary slightly between screens; the brand's own photography is the final reference."}
      </p> */}
    </div>
  );
}
