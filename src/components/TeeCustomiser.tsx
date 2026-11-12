"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { customisationFee } from "@/lib/config";
import { formatINR } from "@/lib/format";
import type { Fabric } from "@/lib/types";

const MOCKUPS = {
  white: { src: "/images/mockups/tee-white.jpg", label: "White", hex: "#FEFBF6", text: "#3D3C42" },
  black: { src: "/images/mockups/tee-black.jpg", label: "Black", hex: "#3D3C42", text: "#FEFBF6" },
  blue: { src: "/images/mockups/tee-blue.jpg", label: "Blue", hex: "#2456A4", text: "#FEFBF6" },
} as const;

const FABRICS = {
  merino: { label: "Merino wool", price: 4200, composition: "100% Merino wool, 180 gsm" },
  lyocell: { label: "Lyocell", price: 550, composition: "100% Lyocell, 160 gsm" },
} as const;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const MAX_FILE_BYTES = 2 * 1024 * 1024;

interface Position {
  x: number;
  y: number;
}

function clampPos(value: number) {
  return Math.max(8, Math.min(92, value));
}

export function TeeCustomiser() {
  const cart = useCart();
  const [colour, setColour] = useState<keyof typeof MOCKUPS>("white");
  const [fabric, setFabric] = useState<Fabric>("merino");
  const [size, setSize] = useState("M");
  const [side, setSide] = useState<"front" | "back">("front");

  const [text, setText] = useState("");
  const [textPos, setTextPos] = useState<Position>({ x: 50, y: 45 });
  const [textScale, setTextScale] = useState(1);

  const [art, setArt] = useState<string | null>(null);
  const [artPos, setArtPos] = useState<Position>({ x: 50, y: 50 });
  const [artScale, setArtScale] = useState(1);
  const [artError, setArtError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);

  const mockup = MOCKUPS[colour];
  const customised = text.trim().length > 0 || art !== null;
  const base = FABRICS[fabric];
  const total = base.price + (customised ? customisationFee : 0);

  function startDrag(event: React.PointerEvent, current: Position, apply: (next: Position) => void) {
    const box = previewRef.current?.getBoundingClientRect();
    if (!box) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic or stale pointer: window listeners below still handle the drag */
    }
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, startX: current.x, startY: current.y };
    const onMove = (move: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      apply({
        x: clampPos(drag.startX + ((move.clientX - drag.pointerX) / box.width) * 100),
        y: clampPos(drag.startY + ((move.clientY - drag.pointerY) / box.height) * 100),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onArtFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setArtError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setArtError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setArtError("That file is over 2 MB. Please choose a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setArt(String(reader.result));
      setArtPos({ x: 50, y: 40 });
      setAdded(false);
    };
    reader.readAsDataURL(file);
  }

  function addToCart() {
    const summary = [
      `${mockup.label} tee`,
      base.label,
      size,
      text.trim() ? `front text "${text.trim()}"` : null,
      art ? "back artwork" : null,
    ]
      .filter(Boolean)
      .join(" · ");
    cart.add({
      productId: "prod-custom-tee",
      slug: "design-your-own-tee",
      name: "Design your own tee",
      brandId: "brand-butterfly-original",
      brandName: "Butterfly Original",
      category: "t-shirts",
      fabric,
      composition: base.composition,
      size,
      colour: mockup.label,
      colourHex: mockup.hex,
      imageUrl: mockup.src,
      qty: 1,
      unitPrice: total,
      fulfilment: "order-via-butterfly",
      customSummary: summary,
    });
    setAdded(true);
  }

  return (
    <div className="shop-layout" style={{ gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1fr)" }}>
      {/* Preview */}
      <div>
        <div className="chip-row" role="group" aria-label="Side">
          <button type="button" className={`chip ${side === "front" ? "chip-active" : ""}`} onClick={() => setSide("front")}>
            Front {text.trim() ? "· text" : ""}
          </button>
          <button type="button" className={`chip ${side === "back" ? "chip-active" : ""}`} onClick={() => setSide("back")}>
            Back {art ? "· artwork" : ""}
          </button>
        </div>
        <div
          ref={previewRef}
          className="card overflow-hidden"
          style={{ containerType: "inline-size", position: "relative", touchAction: "none" }}
        >
          <img
            src={mockup.src}
            alt={`Blank ${mockup.label.toLowerCase()} t-shirt, ${side} view`}
            className="block w-full h-auto select-none"
            draggable={false}
            style={{ transform: side === "back" ? "scaleX(-1)" : undefined }}
          />
          {side === "front" && text.trim() ? (
            <div
              role="button"
              aria-label={`Text: ${text}. Drag to move.`}
              onPointerDown={(event) => startDrag(event, textPos, setTextPos)}
              className="absolute cursor-move select-none"
              style={{
                left: `${textPos.x}%`,
                top: `${textPos.y}%`,
                transform: "translate(-50%, -50%)",
                fontSize: `calc(${textScale} * 6cqi)`,
                fontWeight: 800,
                letterSpacing: "0.04em",
                color: mockup.text,
                textShadow: colour === "white" ? "none" : "0 0 2px rgba(0,0,0,0.35)",
                whiteSpace: "nowrap",
              }}
            >
              {text.trim()}
            </div>
          ) : null}
          {side === "back" && art ? (
            <img
              src={art}
              alt="Your artwork. Drag to move."
              onPointerDown={(event) => startDrag(event, artPos, setArtPos)}
              className="absolute cursor-move select-none"
              draggable={false}
              style={{
                left: `${artPos.x}%`,
                top: `${artPos.y}%`,
                transform: "translate(-50%, -50%)",
                width: `calc(${artScale} * 22cqi)`,
              }}
            />
          ) : null}
        </div>
        <p className="hint mt-2">
          {side === "front"
            ? "Your text sits on the chest. Drag it on the shirt to move it."
            : "Your artwork sits on the back. Drag it on the shirt to move it."}
        </p>
      </div>

      {/* Controls */}
      <div className="card p-5">
        <div className="filter-group">
          <span className="filter-group-label">1. Colour</span>
          <div className="chip-row mb-0">
            {(Object.keys(MOCKUPS) as (keyof typeof MOCKUPS)[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`chip ${colour === key ? "chip-active" : ""}`}
                onClick={() => setColour(key)}
              >
                {MOCKUPS[key].label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">2. Fabric</span>
          <div className="chip-row mb-0">
            {(Object.keys(FABRICS) as Fabric[]).map((key) => (
              <button
                key={key}
                type="button"
                className={`chip ${fabric === key ? "chip-active" : ""}`}
                onClick={() => setFabric(key)}
              >
                {FABRICS[key].label} · {formatINR(FABRICS[key].price)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">3. Size</span>
          <div className="size-options" role="group" aria-label="Size">
            {SIZES.map((option) => (
              <button
                key={option}
                type="button"
                className={`size-option ${size === option ? "is-selected" : ""}`}
                onClick={() => setSize(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">4. Front text</span>
          <input
            className="input"
            value={text}
            maxLength={24}
            placeholder="Your words, e.g. Live to Love"
            onChange={(event) => {
              setText(event.target.value);
              setAdded(false);
            }}
          />
          {text.trim() ? (
            <label className="hint mt-2 flex items-center gap-2">
              Text size
              <input
                type="range"
                min={0.6}
                max={2}
                step={0.05}
                value={textScale}
                onChange={(event) => setTextScale(Number(event.target.value))}
              />
            </label>
          ) : null}
        </div>

        <div className="filter-group">
          <span className="filter-group-label">5. Back artwork</span>
          <input type="file" accept="image/*" className="input" onChange={onArtFile} />
          {art ? (
            <>
              <label className="hint mt-2 flex items-center gap-2">
                Artwork size
                <input
                  type="range"
                  min={0.5}
                  max={2.4}
                  step={0.05}
                  value={artScale}
                  onChange={(event) => setArtScale(Number(event.target.value))}
                />
              </label>
              <button type="button" className="filter-reset mt-2" onClick={() => setArt(null)}>
                Remove artwork
              </button>
            </>
          ) : null}
          {artError ? <p className="hint mt-2" style={{ color: "#BD4444" }}>{artError}</p> : null}
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Price</span>
          <div className="flex items-center justify-between text-[0.86rem]">
            <span>
              Blank tee · {base.label}
            </span>
            <span>{formatINR(base.price)}</span>
          </div>
          <div className="flex items-center justify-between text-[0.86rem] mt-1">
            <span>Customisation{customised ? "" : " (when you add text or artwork)"}</span>
            <span>{customised ? formatINR(customisationFee) : "—"}</span>
          </div>
          <div
            className="flex items-center justify-between mt-3 pt-3"
            style={{ borderTop: "1px solid rgba(61,60,66,0.15)" }}
          >
            <strong>Total</strong>
            <strong>{formatINR(total)}</strong>
          </div>
        </div>

        <button type="button" className="btn w-full" onClick={addToCart}>
          {added ? "Added to cart ✓" : `Add to cart · ${formatINR(total)}`}
        </button>
        {added ? (
          <p className="hint mt-2 text-center">
            Saved in your cart. <Link className="link-under" href="/cart">Go to cart</Link>
          </p>
        ) : null}
        <p className="hint mt-3">
          Made to order in 5–8 working days. Custom pieces can only be returned if faulty.{" "}
          <Link className="link-under" href="/shipping-returns">
            Returns rules
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
