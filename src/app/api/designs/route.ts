import { NextResponse } from "next/server";
import { productById } from "@/lib/catalog";
import { updateDb } from "@/lib/db";
import { saveImageDataUrl } from "@/lib/uploads";
import { customisationFee } from "@/lib/config";

const BLOCKED = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "slut",
  "nazi",
  "rape",
  "cocaine",
  "heroin",
];

export async function POST(request: Request) {
  let body: {
    garmentProductId?: string;
    colour?: string;
    text?: string;
    artwork?: string | null;
    transform?: { scale?: number; rotation?: number; x?: number; y?: number };
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const product = body.garmentProductId ? productById(body.garmentProductId) : null;
  if (!product || !product.customisable || product.status !== "approved") {
    return NextResponse.json(
      { error: "Customisation is available on Butterfly Original blanks only." },
      { status: 400 },
    );
  }
  const colour = product.colours.find((option) => option.name === body.colour);
  if (!colour) return NextResponse.json({ error: "Choose a garment colour." }, { status: 400 });

  const text = (body.text ?? "").trim().slice(0, 60);
  if (!text && !body.artwork) {
    return NextResponse.json({ error: "Add some text or artwork to your design." }, { status: 400 });
  }
  const lower = text.toLowerCase();
  if (BLOCKED.some((word) => lower.includes(word))) {
    return NextResponse.json(
      { error: "That text breaks our moderation rules. Please choose different wording." },
      { status: 400 },
    );
  }

  let artworkFile: string | null = null;
  if (body.artwork) {
    artworkFile = saveImageDataUrl(body.artwork, "design");
    if (!artworkFile) {
      return NextResponse.json(
        { error: "Artwork must be a JPG, PNG or WebP under 2 MB. SVG uploads are not accepted." },
        { status: 400 },
      );
    }
  }

  const transform = {
    scale: Math.min(2.5, Math.max(0.3, Number(body.transform?.scale) || 1)),
    rotation: Math.min(45, Math.max(-45, Number(body.transform?.rotation) || 0)),
    x: Math.min(35, Math.max(-35, Number(body.transform?.x) || 0)),
    y: Math.min(35, Math.max(-35, Number(body.transform?.y) || 0)),
  };

  const design = {
    id: `design-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    garmentProductId: product.id,
    fabric: product.fabric,
    colour: colour.name,
    text,
    artworkFile,
    transform,
    price: product.priceINR + customisationFee,
    status: "approved" as const,
    moderationNote:
      "Automatic moderation passed: text and file type checked. Admin spot-checks may follow.",
  };

  updateDb((db) => {
    db.designs.push(design);
  });

  return NextResponse.json({ ok: true, design });
}
