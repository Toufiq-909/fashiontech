import { NextResponse } from "next/server";
import { productBySlug } from "@/lib/catalog";
import { generateTryOn } from "@/lib/tryon";

// The IDM-VTON Space can sit in the ZeroGPU queue for a while; allow up to 5 min
// on hosts that enforce a function timeout (Vercel: check your plan's limit).
export const maxDuration = 300;

const MAX_PHOTO_CHARS = 7_500_000; // about 5.5 MB binary

export async function POST(request: Request) {
  let body: {
    photo?: string;
    productSlug?: string;
    colour?: string;
    consent?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.consent) {
    return NextResponse.json(
      { error: "Please confirm you have the right to use this photo and consent to the preview." },
      { status: 400 },
    );
  }
  if (!body.photo || !body.photo.startsWith("data:image/")) {
    return NextResponse.json({ error: "Upload a photo to preview." }, { status: 400 });
  }
  if (body.photo.length > MAX_PHOTO_CHARS) {
    return NextResponse.json(
      { error: "That photo is too large. Use one under 5 MB." },
      { status: 413 },
    );
  }

  const product = body.productSlug ? productBySlug(body.productSlug) : null;
  if (!product || product.status !== "approved" || !product.tryOnEligible) {
    return NextResponse.json(
      { error: "Sorry, try-on isn't available for this piece." },
      { status: 400 },
    );
  }

  const colour =
    product.colours.find((option) => option.hex === body.colour || option.name === body.colour) ??
    product.colours[0];
  if (!colour) {
    return NextResponse.json({ error: "Choose a colour." }, { status: 400 });
  }

  try {
    const origin = new URL(request.url).origin;
    const result = await generateTryOn({
      photo: body.photo,
      product,
      colourHex: colour.hex,
      origin,
    });
    return NextResponse.json({
      ok: true,
      mode: result.mode,
      image: result.image ?? null,
      garmentImage: result.garmentImage,
      provider: result.provider,
      notice: result.notice,
      colour: { name: colour.name, hex: colour.hex },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "TRYON_ERROR";
    if (code === "NO_TRIABLE_IMAGE") {
      return NextResponse.json(
        { error: "Try-on isn't available for this piece right now." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "The try-on service could not generate a preview. Try a different photo or retry in a moment." },
      { status: 502 },
    );
  }
}
