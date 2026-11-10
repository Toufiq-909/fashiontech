"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { GarmentArt } from "./GarmentArt";
import { useCart } from "./cart/CartProvider";
import { garmentMarkup } from "@/lib/garment";
import { customisationFee } from "@/lib/config";
import { formatINR } from "@/lib/format";

export interface DesignProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  fabric: "merino" | "lyocell";
  composition: string;
  priceINR: number;
  colours: { name: string; hex: string }[];
}

function textColour(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "#3D3C42";
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? "#3D3C42" : "#FEFBF6";
}

export function DesignStudio({
  products,
  initialSlug,
}: {
  products: DesignProduct[];
  initialSlug?: string;
}) {
  const { add } = useCart();
  const initial = products.find((product) => product.slug === initialSlug) ?? products[0];
  const [productSlug, setProductSlug] = useState(initial?.slug ?? "");
  const product = products.find((entry) => entry.slug === productSlug) ?? products[0];
  const [colourName, setColourName] = useState(product?.colours[0]?.name ?? "");
  const colour = product?.colours.find((option) => option.name === colourName) ?? product?.colours[0];
  const [text, setText] = useState("Live to Love");
  const [artwork, setArtwork] = useState<string | null>(null);
  const [artworkName, setArtworkName] = useState("");
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  const [declared, setDeclared] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const artworkInput = useRef<HTMLInputElement>(null);

  const price = (product?.priceINR ?? 0) + customisationFee;
  const ink = textColour(colour?.hex ?? "#F1DEC4");

  const composition = useMemo(() => {
    const lines = text.split("\n").slice(0, 2);
    return lines;
  }, [text]);

  async function onArtwork(file: File | undefined) {
    setError("");
    setAdded(false);
    if (!file) {
      setArtwork(null);
      setArtworkName("");
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Artwork must be a JPG, PNG or WebP. SVG and PDF are not accepted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Keep the artwork under 2 MB.");
      return;
    }
    const buffer = await file.arrayBuffer();
    const data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    setArtwork(`data:${file.type};base64,${data}`);
    setArtworkName(file.name);
  }

  function buildGarmentSvg() {
    if (!product || !colour) return "";
    const cx = 200 + transform.x * 2.4;
    const cy = 210 + transform.y * 2.2;
    const scale = transform.scale;
    const rotate = transform.rotation;
    const lines = composition;
    const fontSize = 15;
    const textMarkup = lines
      .map(
        (line, index) =>
          `<text x="${cx}" y="${cy + index * (fontSize + 5) + (artwork ? 34 : 0)}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${ink}" transform="rotate(${rotate} ${cx} ${cy})">${line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")}</text>`,
      )
      .join("");
    const artMarkup = artwork
      ? `<image href="${artwork}" x="${cx - (60 * scale) / 2}" y="${cy - (60 * scale) / 2 - 12}" width="${60 * scale}" height="${60 * scale}" preserveAspectRatio="xMidYMid meet" transform="rotate(${rotate} ${cx} ${cy})" opacity="0.92"/>`
      : "";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">${garmentMarkup(product.category, colour.hex)}${artMarkup}${textMarkup}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function previewTryOn() {
    if (!product) return;
    const image = buildGarmentSvg();
    try {
      window.sessionStorage.setItem(
        "butterfly-tryon-design",
        JSON.stringify({ productSlug: product.slug, name: product.name, image }),
      );
    } catch {
      setError("This design is too large to preview in try-on. Try smaller artwork.");
      return;
    }
    window.location.href = `/try-on?product=${product.slug}&design=1`;
  }

  async function addCustomToCart() {
    setError("");
    setAdded(false);
    if (!product || !colour) return;
    if (!text.trim() && !artwork) {
      setError("Add text or upload artwork first.");
      return;
    }
    if (!declared) {
      setError("Confirm the content declaration before adding to cart.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garmentProductId: product.id,
          colour: colour.name,
          text,
          artwork,
          transform,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        design?: { id: string; price: number; status: string; moderationNote: string };
        error?: string;
      };
      if (!response.ok || !payload.design) {
        setError(payload.error ?? "Could not save the design.");
        setBusy(false);
        return;
      }
      add({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brandId: "brand-butterfly-original",
        brandName: "Butterfly Original",
        category: product.category,
        fabric: product.fabric,
        composition: product.composition,
        size: "Made to order",
        colour: colour.name,
        colourHex: colour.hex,
        imageUrl: null,
        qty: 1,
        unitPrice: payload.design.price,
        fulfilment: "order-via-butterfly",
        customDesignId: payload.design.id,
        customSummary: `${colour.name} · ${text.trim() || "artwork only"} · ${payload.design.moderationNote}`,
      });
      setAdded(true);
    } catch {
      setError("Network error. The design was not added.");
    }
    setBusy(false);
  }

  if (!products.length) {
    return (
      <div className="empty-state">
        <h2>Customisation is paused.</h2>
        <p>No Butterfly Original blanks are available right now. Check the shop for ready-made pieces.</p>
      </div>
    );
  }

  return (
    <div className="designer-grid">
      <div>
        <div className="design-canvas">
          <GarmentArt
            category={product.category}
            colour={colour?.hex ?? "#F1DEC4"}
            tone="#F1DEC4"
            className="garment-base"
          />
          {artwork && (
            <img
              src={artwork}
              alt="Your artwork preview"
              className="art-layer"
              style={{
                transform: `translate(-50%, -50%) translate(${transform.x}%, ${transform.y}%) rotate(${transform.rotation}deg) scale(${transform.scale})`,
                top: "42%",
              }}
            />
          )}
          <div
            className="design-text"
            style={{
              top: artwork ? "58%" : "46%",
              color: ink,
              transform: `translate(-50%, -50%) translate(${transform.x}%, ${transform.y}%) rotate(${transform.rotation}deg) scale(${transform.scale})`,
              fontSize: "clamp(0.9rem, 2.2vw, 1.4rem)",
            }}
          >
            {composition.map((line, index) => (
              <span key={index} className="block">
                {line || " "}
              </span>
            ))}
          </div>
        </div>
        <p className="micro muted mt-2">
          Live mockup on a Butterfly Original blank. Actual print position can shift by a few
          millimetres during production.
        </p>
      </div>

      <div className="design-controls">
        <div className="studio-panel">
          <h2>Start with a blank</h2>
          <label className="field-label" htmlFor="design-garment">
            Garment
          </label>
          <select
            id="design-garment"
            className="select mb-3"
            value={product.slug}
            onChange={(event) => {
              const next = products.find((entry) => entry.slug === event.target.value);
              setProductSlug(event.target.value);
              setColourName(next?.colours[0]?.name ?? "");
              setAdded(false);
              setError("");
            }}
          >
            {products.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.name} · {entry.fabric === "merino" ? "Merino" : "Lyocell"} · {formatINR(entry.priceINR)}
              </option>
            ))}
          </select>
          <p className="field-label mb-1.5">Fabric</p>
          <p className="tag mb-3">{product.fabric === "merino" ? "Merino wool" : "Lyocell"} · {product.composition}</p>
          <p className="field-label mb-1.5">Colour · {colour?.name}</p>
          <div className="swatch-grid">
            {product.colours.map((option) => (
              <button
                key={option.name}
                type="button"
                className={`swatch-button ${colourName === option.name ? "is-selected" : ""}`}
                style={{ background: option.hex }}
                aria-label={option.name}
                aria-pressed={colourName === option.name}
                onClick={() => {
                  setColourName(option.name);
                  setAdded(false);
                }}
              />
            ))}
          </div>
        </div>

        <div className="studio-panel">
          <h2>Add your own</h2>
          <div className="field">
            <label htmlFor="design-text">Text</label>
            <input
              id="design-text"
              className="input"
              value={text}
              maxLength={60}
              onChange={(event) => {
                setText(event.target.value);
                setAdded(false);
              }}
              placeholder="A word, a line, your name"
            />
            <span className="hint">{60 - text.length} characters left. Two lines maximum in the preview.</span>
          </div>

          <div className="field">
            <label htmlFor="design-art">Artwork or logo</label>
            <input
              id="design-art"
              ref={artworkInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => onArtwork(event.target.files?.[0])}
            />
            <span className="hint">PNG with transparency works best. JPG, PNG or WebP, up to 2 MB.</span>
          </div>
          {artwork && (
            <div className="flex items-center gap-3 mb-3">
              <img src={artwork} alt="Uploaded artwork" style={{ width: 48, height: 48, objectFit: "contain", border: "1px solid rgba(61,60,66,0.2)", borderRadius: 6 }} />
              <span className="micro muted">{artworkName}</span>
              <button type="button" className="remove-link" onClick={() => { setArtwork(null); setArtworkName(""); if (artworkInput.current) artworkInput.current.value = ""; }}>
                Remove
              </button>
            </div>
          )}

          {[
            { key: "x" as const, label: "Move across", min: -30, max: 30, step: 1, value: transform.x, unit: "" },
            { key: "y" as const, label: "Move down", min: -30, max: 30, step: 1, value: transform.y, unit: "" },
            { key: "scale" as const, label: "Scale", min: 0.5, max: 2, step: 0.05, value: transform.scale, unit: "×" },
            { key: "rotation" as const, label: "Rotate", min: -30, max: 30, step: 1, value: transform.rotation, unit: "°" },
          ].map((control) => (
            <label className="control-row" key={control.key}>
              <span>{control.label}</span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                onChange={(event) => {
                  setTransform((current) => ({ ...current, [control.key]: Number(event.target.value) }));
                  setAdded(false);
                }}
              />
              <output>
                {control.key === "scale" ? `${control.value.toFixed(2)}×` : `${control.value}${control.unit}`}
              </output>
            </label>
          ))}
        </div>

        <div className="studio-panel">
          <h2>Price and rules</h2>
          <div className="design-price">
            <span className="text-[0.86rem]">
              {formatINR(product.priceINR)} base + {formatINR(customisationFee)} customisation
            </span>
            <strong>{formatINR(price)}</strong>
          </div>
          <p className="hint mt-2">
            Made to order on a Butterfly Original blank. 5–8 working days. Customised pieces are
            non-returnable unless faulty.
          </p>
          <label className="check mt-3 mb-3">
            <input type="checkbox" checked={declared} onChange={(event) => setDeclared(event.target.checked)} />
            <span>
              This is my own text or artwork. It is not offensive, hateful, or copyrighted material I
              do not have permission to use, and it does not impersonate a brand.
            </span>
          </label>
          {error && <p className="error-text mb-2" role="alert">{error}</p>}
          <div className="cta-row">
            <button type="button" className="btn btn-sm" onClick={addCustomToCart} disabled={busy}>
              {busy ? "Saving…" : added ? "Add another" : "Add custom to cart"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={previewTryOn}>
              Preview in try-on
            </button>
          </div>
          {added && (
            <p className="success-panel mt-3 text-[0.82rem]">
              Added as a custom order.{" "}
              <Link className="link-under" href="/cart">
                Review the cart
              </Link>{" "}
              and complete checkout. Automatic moderation passed; the team may spot-check the artwork.
            </p>
          )}
          <p className="hint mt-3">
            Uploads are checked for type and size and text is screened automatically. Butterfly may
            reject a design that breaks the rules before production.
          </p>
        </div>
      </div>
    </div>
  );
}
