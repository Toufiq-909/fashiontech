"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./cart/CartProvider";
import { formatINR } from "@/lib/format";
import type { Brand, Product } from "@/lib/types";

/**
 * Purchase panel for the product page. "Order via Butterfly" items can be added
 * to the cart; "Buy at brand" items hand off to the brand's own checkout.
 */
export function ProductBuyBox({
  product,
  brand,
  signedIn,
}: {
  product: Product;
  brand: Brand;
  signedIn: boolean;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [size, setSize] = useState(product.sizes[Math.min(1, product.sizes.length - 1)] ?? "");
  const [colour, setColour] = useState(product.colours[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [wishError, setWishError] = useState("");

  const buyAtBrand = brand.fulfilment === "buy-at-brand";
  const externalHref = product.sourceUrl.startsWith("http") ? product.sourceUrl : brand.website;

  function onAdd() {
    setError("");
    if (!size) {
      setError("Choose a size first.");
      return;
    }
    if (!colour) {
      setError("Choose a colour first.");
      return;
    }
    if (product.availability === "sold-out") {
      setError("This piece is currently sold out.");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandId: product.brandId,
      brandName: brand.name,
      category: product.category,
      fabric: product.fabric,
      composition: product.composition,
      size,
      colour,
      colourHex: product.colours.find((option) => option.name === colour)?.hex ?? "#F1DEC4",
      imageUrl: product.images[0]?.url ?? null,
      qty,
      unitPrice: product.priceINR,
      fulfilment: "order-via-butterfly",
    });
    setAdded(true);
    router.refresh();
  }

  async function toggleWishlist() {
    if (!signedIn) {
      router.push(`/account?next=/shop/${product.slug}`);
      return;
    }
    setWishError("");
    const response = await fetch("/api/account/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });
    const payload = (await response.json()) as { ok?: boolean; inWishlist?: boolean; error?: string };
    if (!response.ok) {
      setWishError(payload.error ?? "Could not update your wishlist.");
      return;
    }
    setWishlisted(Boolean(payload.inWishlist));
  }

  return (
    <div className="buybox">
      <h1>{product.name}</h1>
     

      <div className="price-row">
        <span className="price-big">{formatINR(product.priceINR)}</span>
        <span className="badge badge-merino">
          {product.tier === "luxury-comfort" ? "Luxury comfort" : "Everyday value"}
        </span>
        {product.fabricVerified && <span className="badge badge-verified">Fabric verified</span>}
      </div>
      <p className="price-note">
        {product.sourceCurrency === "INR"
          ? "Price as listed by the brand in INR."
          : `Converted from ${product.sourceCurrency} ${product.sourcePrice} at ₹${product.fxRateUsed}/${product.sourceCurrency}. The brand sets the source price; duties may apply.`}
      </p>

      {/* <div className="option-block">
        <div className="option-label">
          <span>Colour · {colour}</span>
        </div>
        <div className="colour-options" role="group" aria-label="Colour">
          {product.colours.map((option) => (
            <button
              key={option.name}
              type="button"
              className={`colour-option ${colour === option.name ? "is-selected" : ""}`}
              aria-pressed={colour === option.name}
              onClick={() => setColour(option.name)}
            >
              <span className="swatch-dot" style={{ background: option.hex }} aria-hidden="true" />
              {option.name}
            </button>
          ))}
        </div>
      </div> */}

      <div className="option-block">
        <div className="option-label">
          <span>Size</span>
          <Link href="/size-guide">Size guide</Link>
        </div>
        <div className="size-options" role="group" aria-label="Size">
          {product.sizes.map((option) => (
            <button
              key={option}
              type="button"
              className={`size-option ${size === option ? "is-selected" : ""}`}
              aria-pressed={size === option}
              onClick={() => setSize(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      

      {product.tryOnEligible ? (
        <div className="product-tryon">
          <strong>See it on you.</strong> This garment image is cleared for virtual try-on.{" "}
          <Link className="link-under" href={`/try-on?product=${product.slug}`}>
            Try it on virtually
          </Link>
        </div>
      ) : (
        <p className="micro muted mt-3">
          Virtual try-on is hidden for this piece because the brand has not supplied a garment image
          cleared for that use.
        </p>
      )}

      {product.customisable && (
        <div className="notice notice-plum mt-3">
          <strong>Butterfly Original.</strong> This blank can be personalised in{" "}
          <Link className="link-under" href={`/design?product=${product.slug}`}>
            Design your own
          </Link>
          .
        </div>
      )}
    </div>
  );
}
