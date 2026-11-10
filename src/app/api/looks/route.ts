import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import { productBySlug } from "@/lib/catalog";
import { saveImageDataUrl } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await sessionUser();
  let body: { photo?: string; productSlug?: string; colour?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const product = body.productSlug ? productBySlug(body.productSlug) : null;
  if (!product || !product.tryOnEligible) {
    return NextResponse.json({ error: "Choose a try-on piece first." }, { status: 400 });
  }
  if (!body.photo?.startsWith("data:image/")) {
    return NextResponse.json({ error: "No preview to save." }, { status: 400 });
  }

  const imageFile = saveImageDataUrl(body.photo, "look");
  if (!imageFile) {
    return NextResponse.json({ error: "That image could not be saved. Use a JPG, PNG or WebP under 3 MB." }, { status: 400 });
  }

  const id = `look-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  updateDb((db) => {
    db.looks.push({
      id,
      userId: user?.id ?? null,
      imageFile,
      garmentProductId: product.id,
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ ok: true, id, url: `/api/uploads/${imageFile}` });
}
