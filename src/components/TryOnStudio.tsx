"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "./cart/CartProvider";
import { formatINR } from "@/lib/format";

export interface TryOnProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  fabric: "merino" | "lyocell";
  composition: string;
  priceINR: number;
  sizes: string[];
  colours: { name: string; hex: string }[];
  imageUrl: string | null;
  photoUrl: string | null;
  brandName: string;
}

interface Result {
  mode: "image" | "overlay";
  image: string | null;
  garmentImage: string | null;
  provider: string;
  notice: string;
}

interface CustomGarment {
  productSlug: string;
  name: string;
  image: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = source;
  });
}

async function composeLook(
  photo: string,
  garment: string,
  transform: { scale: number; x: number; y: number },
): Promise<string> {
  const photoImage = await loadImage(photo);
  const garmentImage = await loadImage(garment);
  const width = Math.min(1200, photoImage.naturalWidth || 900);
  const height = Math.round(width * ((photoImage.naturalHeight || 1200) / (photoImage.naturalWidth || 900)));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.fillStyle = "#FEFBF6";
  context.fillRect(0, 0, width, height);

  const photoRatio = (photoImage.naturalWidth || 1) / (photoImage.naturalHeight || 1);
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  if (photoRatio > canvasRatio) drawHeight = width / photoRatio;
  else drawWidth = height * photoRatio;
  context.drawImage(photoImage, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);

  const garmentWidth = drawWidth * 0.52 * transform.scale;
  const garmentHeight = garmentWidth * ((garmentImage.naturalHeight || 500) / (garmentImage.naturalWidth || 400));
  const centerX = width / 2 + (drawWidth * transform.x) / 100;
  const centerY = height * 0.58 + (height * transform.y) / 100;
  context.globalAlpha = 0.9;
  context.drawImage(
    garmentImage,
    centerX - garmentWidth / 2,
    centerY - garmentHeight / 2,
    garmentWidth,
    garmentHeight,
  );
  return canvas.toDataURL("image/png");
}

export function TryOnStudio({
  products,
  initialSlug,
}: {
  products: TryOnProduct[];
  initialSlug?: string;
}) {
  const { add } = useCart();
  const initial = products.find((product) => product.slug === initialSlug) ?? products[0];
  const [productSlug, setProductSlug] = useState(initial?.slug ?? "");
  const product = products.find((entry) => entry.slug === productSlug) ?? products[0];
  const [colourIndex, setColourIndex] = useState(0);
  const colour = product?.colours[colourIndex] ?? product?.colours[0];
  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [overlay, setOverlay] = useState({ scale: 1, x: 0, y: 0 });
  const [compare, setCompare] = useState(false);
  const [saved, setSaved] = useState<{ id: string; url: string } | null>(null);
  const [saveBusy, setSaveBusy] = useState(false);
  const [custom, setCustom] = useState<CustomGarment | null>(null);
  const [added, setAdded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("butterfly-tryon-design");
      if (!raw) return;
      const parsed = JSON.parse(raw) as CustomGarment;
      if (parsed?.image && parsed.productSlug) {
        setCustom(parsed);
        setProductSlug(parsed.productSlug);
        window.sessionStorage.removeItem("butterfly-tryon-design");
      }
    } catch {
      /* ignore malformed preview */
    }
  }, []);

  const overlayImage = useMemo(() => {
    if (custom && custom.productSlug === product?.slug) return custom.image;
    if (result?.garmentImage) return result.garmentImage;
    if (!product?.imageUrl || !colour) return null;
    return `${product.imageUrl}?transparent=1&colour=${encodeURIComponent(colour.hex)}`;
  }, [custom, product, result, colour]);

  useEffect(() => {
    setColourIndex(0);
    // Colour and size pickers were removed from the UI; cart defaults apply.
    setSize(product?.sizes.includes("M") ? "M" : product?.sizes[0] ?? "");
    setResult(null);
    setSaved(null);
    setAdded(false);
  }, [product]);

  async function onPhoto(file: File | undefined) {
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Use a photo under 5 MB.");
      return;
    }
    const data = await readFileAsDataUrl(file);
    setPhoto(data);
    setPhotoName(file.name);
    setResult(null);
    setSaved(null);
    setAdded(false);
    setOverlay({ scale: 1, x: 0, y: 0 });
  }

  async function generate() {
    setError("");
    if (!photo) {
      setError("Add a photo first.");
      return;
    }
    if (!consent) {
      setError("Confirm the consent checkbox to generate a preview.");
      return;
    }
    if (!product || !colour) return;
    setBusy(true);
    setSaved(null);
    try {
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo,
          productSlug: product.slug,
          colour: colour.name,
          consent,
        }),
      });
      const payload = (await response.json()) as Result & { error?: string; ok?: boolean };
      if (!response.ok) {
        setError(payload.error ?? "The preview could not be generated.");
        setBusy(false);
        return;
      }
      setResult({
        mode: payload.mode,
        image: payload.image,
        garmentImage: payload.garmentImage,
        provider: payload.provider,
        notice: payload.notice,
      });
      setOverlay({ scale: 1, x: 0, y: 0 });
    } catch {
      setError("Network error while generating the preview. Try again.");
    }
    setBusy(false);
  }

  async function saveLook() {
    if (!result || !product) return;
    setSaveBusy(true);
    setError("");
    try {
      let image = result.image ?? "";
      if (result.mode === "overlay" || !image.startsWith("data:")) {
        if (!photo || !overlayImage) throw new Error("compose");
        image = await composeLook(photo, overlayImage, overlay);
      }
      const response = await fetch("/api/looks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo: image, productSlug: product.slug, colour: colour?.name }),
      });
      const payload = (await response.json()) as { ok?: boolean; id?: string; url?: string; error?: string };
      if (!response.ok || !payload.id || !payload.url) {
        setError(payload.error ?? "Could not save the look.");
      } else {
        setSaved({ id: payload.id, url: payload.url });
      }
    } catch {
      setError("Could not prepare that look for saving. Try generating again.");
    }
    setSaveBusy(false);
  }

  async function deleteLook() {
    if (!saved) return;
    await fetch(`/api/looks/${saved.id}`, { method: "DELETE" });
    setSaved(null);
  }

  function addToCart() {
    if (!product || !colour) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      brandId: "brand-butterfly-original",
      brandName: product.brandName,
      category: product.category,
      fabric: product.fabric,
      composition: product.composition,
      size,
      colour: colour.name,
      colourHex: colour.hex,
      imageUrl: product.imageUrl,
      qty: 1,
      unitPrice: product.priceINR,
      fulfilment: "order-via-butterfly",
    });
    setAdded(true);
  }

  if (!products.length) {
    return (
      <div className="empty-state">
        <h2>No pieces are ready for try-on right now.</h2>
        <p>
          Try-on is only available for pieces we photograph ourselves — our Butterfly Originals.
        </p>
        <Link className="btn btn-sm mt-4" href="/shop">
          Browse the catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="studio-grid">
      <div className="studio-panel">
        <h2>1. Your photo</h2>
        <p className="hint mb-3">
          Front-facing, half or full body, one person, even light. A plain wall helps. You can retry
          with a different photo at any time.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          onChange={(event) => {
            void onPhoto(event.target.files?.[0]);
            event.target.value = "";
          }}
          aria-label="Upload your photo"
          className="sr-only"
        />
        {photo ? (
          <div className="photo-preview mb-3">
            <img src={photo} alt="Your uploaded photo" />
          </div>
        ) : (
          <div className="upload-box mb-3">
            <strong>Upload a photo</strong>
            <p className="hint mt-1">JPG, PNG or WebP up to 5 MB. Camera works on phones.</p>
            <button type="button" className="mini-btn mt-2" onClick={() => fileRef.current?.click()}>
              Choose a photo
            </button>
          </div>
        )}
        {photo && (
          <div className="cta-row mb-3">
            <button type="button" className="mini-btn" onClick={() => fileRef.current?.click()}>
              Choose a different photo
            </button>
            <button
              type="button"
              className="mini-btn"
              onClick={() => {
                setPhoto(null);
                setPhotoName("");
                setResult(null);
                setSaved(null);
                setAdded(false);
              }}
            >
              Remove photo
            </button>
          </div>
        )}
        {photoName && <p className="micro muted mb-3">{photoName}</p>}

        <label className="check mb-3">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>
            I'm happy for my photo to be used to create the preview, and I have the right to use it.
            I have read the{" "}
            <Link className="link-under" href="/privacy">
              privacy notice
            </Link>
            .
          </span>
        </label>

        <div className="privacy-note">
          <strong>Photo privacy</strong>
          Your photo is only used to make your preview. We don't keep it unless you press
          “Save this look”, and we never use it for marketing. Saved looks can be deleted in one click.
        </div>

        <h2 className="mt-5">2. The garment</h2>
        <div className="grid gap-1.5 max-h-[260px] overflow-y-auto pr-1" role="radiogroup" aria-label="Choose a garment">
          {products.map((entry) => {
            const active = entry.slug === product?.slug;
            return (
              <button
                key={entry.slug}
                type="button"
                role="radio"
                aria-checked={active}
                className={`flex items-center gap-3 rounded-xl border px-2 py-2 text-left ${active ? "border-[#677E61]" : "border-[rgba(61,60,66,0.15)]"}`}
                style={active ? { background: "rgba(115,151,106,0.12)" } : undefined}
                onClick={() => setProductSlug(entry.slug)}
              >
                <span
                  className="w-11 h-14 rounded-md overflow-hidden shrink-0"
                  style={{ background: entry.colours[0]?.hex ?? "#F1DEC4" }}
                >
                  {entry.photoUrl && <img src={entry.photoUrl} alt="" className="w-full h-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.83rem] font-semibold leading-tight">{entry.name}</span>
                  <span className="block micro muted">{entry.composition}</span>
                  <span className="block micro" style={{ color: "#677E61" }}>
                    {formatINR(entry.priceINR)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {error && <p className="error-text mt-3" role="alert">{error}</p>}
        <button type="button" className="btn btn-block mt-4" onClick={generate} disabled={busy || !photo || !consent}>
          {busy ? (
            <>
              <span className="loading-line" aria-hidden="true" /> Creating your preview — usually 1–2 minutes…
            </>
          ) : result ? (
            "Generate again"
          ) : (
            "Try it on with AI"
          )}
        </button>
        <p className="hint mt-2">
          {photo
            ? "Your preview is made just for this visit — it isn't kept unless you save the look."
            : "Add a photo and tick the box above to begin."}
        </p>
      </div>

      <div>
        <div className="studio-stage">
          {!photo ? (
            <div className="studio-placeholder">
              <div style={{ width: 60, margin: "0 auto 10px" }}>
                <svg viewBox="0 0 64 64" fill="none" stroke="#677E61" strokeWidth="2" aria-hidden="true">
                  <rect x="8" y="10" width="48" height="44" rx="6" />
                  <circle cx="24" cy="26" r="5" />
                  <path d="M12 46l13-12 9 8 8-7 10 11" />
                </svg>
              </div>
              <strong className="block mb-1">Your preview appears here.</strong>
              Upload a photo, pick a piece, then tap “Try it on”. If our try-on service is busy,
              you'll get a quick preview instead — just move and resize the garment until it looks
              right on you.
            </div>
          ) : (
            <div className="studio-stage-inner">
              <img className="studio-photo" src={result?.mode === "image" && result.image ? result.image : photo} alt="Try-on preview" />
              {result?.mode === "overlay" && overlayImage && (
                <img
                  className="garment-overlay"
                  src={overlayImage}
                  alt={`${product?.name ?? "Garment"} overlaid on your photo`}
                  style={{
                    left: "50%",
                    top: "58%",
                    width: `${52 * overlay.scale}%`,
                    transform: `translate(-50%, -50%) translate(${overlay.x}%, ${overlay.y}%)`,
                  }}
                />
              )}
              {custom && custom.productSlug === product?.slug && (
                <span className="tag tag-solid" style={{ position: "absolute", top: 12, left: 12 }}>
                  Custom design preview
                </span>
              )}
            </div>
          )}
        </div>

        {result && (
          <>
            <div className="notice mt-3" role="status">
              {result.notice}
              {result.provider === "local-overlay" && " Use the sliders to place the garment on your photo."}
            </div>

            {result.mode === "overlay" && (
              <div className="studio-panel mt-3">
                <h3>Place the garment</h3>
                {[
                  { key: "scale" as const, label: "Size", min: 0.5, max: 1.8, step: 0.05, value: overlay.scale },
                  { key: "y" as const, label: "Up / down", min: -40, max: 40, step: 1, value: overlay.y },
                  { key: "x" as const, label: "Left / right", min: -30, max: 30, step: 1, value: overlay.x },
                ].map((control) => (
                  <label className="control-row" key={control.key}>
                    <span>{control.label}</span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={control.value}
                      onChange={(event) =>
                        setOverlay((current) => ({ ...current, [control.key]: Number(event.target.value) }))
                      }
                    />
                    <output>{control.key === "scale" ? `${Math.round(control.value * 100)}%` : control.value}</output>
                  </label>
                ))}
                <p className="hint mt-2">
                  This quick preview places the garment on your photo but doesn't fit it to your
                  body. Try again in a minute for the full preview.
                </p>
              </div>
            )}

            <div className="studio-panel mt-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="mb-0">What next?</h3>
                <label className="check" style={{ fontSize: "0.8rem" }}>
                  <input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />
                  Compare side by side
                </label>
              </div>
              {compare && photo && (
                <div className="compare-grid mt-3">
                  <figure>
                    <img src={photo} alt="Your original photo" />
                    <figcaption>Your photo</figcaption>
                  </figure>
                  <figure>
                    <img
                      src={result.mode === "image" && result.image ? result.image : photo}
                      alt="Preview with garment"
                    />
                    {result.mode === "overlay" && overlayImage && (
                      <img
                        className="garment-overlay"
                        src={overlayImage}
                        alt=""
                        style={{
                          left: "50%",
                          top: "58%",
                          width: `${52 * overlay.scale}%`,
                          transform: `translate(-50%, -50%) translate(${overlay.x}%, ${overlay.y}%)`,
                        }}
                      />
                    )}
                    <figcaption>With {product?.name}</figcaption>
                  </figure>
                </div>
              )}
              <div className="cta-row mt-4">
                <button type="button" className="btn btn-sm" onClick={addToCart}>
                  {added ? "Added to cart" : "Add to cart"}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={saveLook} disabled={saveBusy}>
                  {saveBusy ? "Saving…" : saved ? "Look saved" : "Save this look"}
                </button>
                {result?.mode === "image" && result.image && (
                  <a
                    className="btn btn-secondary btn-sm"
                    href={result.image}
                    download={`butterfly-tryon-${product?.slug ?? "look"}.png`}
                  >
                    Download image
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setResult(null);
                    setSaved(null);
                    setAdded(false);
                    setOverlay({ scale: 1, x: 0, y: 0 });
                  }}
                >
                  Retry with another photo
                </button>
              </div>
              {added && (
                <p className="hint mt-2">
                  Added {product?.name} in {colour?.name}, size {size}.{" "}
                  <Link className="link-under" href="/cart">
                    View cart
                  </Link>
                </p>
              )}
              {saved && (
                <div className="success-panel mt-3">
                  <p className="text-[0.85rem]">
                    Look saved. {" "}
                    <Link className="link-under" href="/account">
                      Find it in your account
                    </Link>
                    .
                  </p>
                  <button type="button" className="remove-link" onClick={deleteLook}>
                    Delete this saved look now
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="studio-panel mt-3">
          <h3>Why do only some pieces have try-on?</h3>
          <p className="text-[0.83rem] muted">
            Try-on uses the garment's photo, so we only offer it for pieces whose photos we own or
            that a brand has approved. You'll see it on our own Butterfly Originals — never on
            partner photography without permission.
          </p>
          <Link className="link-arrow mt-3 inline-flex" href="/shop">
            Browse all pieces
          </Link>
        </div>
      </div>
    </div>
  );
}
