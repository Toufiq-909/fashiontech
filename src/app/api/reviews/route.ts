import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/auth";
import { getDb, updateDb } from "@/lib/db";
import { saveImageDataUrl } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { productId?: string; rating?: number; body?: string; photo?: string | null };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const productId = body.productId ?? "";
  const rating = Math.round(Number(body.rating));
  const text = (body.body ?? "").trim();
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  }
  if (text.length < 10) {
    return NextResponse.json({ error: "Write at least 10 characters." }, { status: 400 });
  }

  const db = getDb();
  const verified = db.orders.some(
    (order) =>
      order.userId === user.id &&
      order.payment.status !== "failed" &&
      order.items.some((item) => item.productId === productId),
  );
  if (!verified) {
    return NextResponse.json(
      { error: "Reviews are open to verified buyers only." },
      { status: 403 },
    );
  }

  const photo = body.photo ? saveImageDataUrl(body.photo, "review") : null;

  updateDb((database) => {
    database.reviews.push({
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId,
      userId: user.id,
      name: user.name,
      rating,
      body: text.slice(0, 1200),
      photo,
      verified: true,
      featured: false,
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ ok: true });
}
