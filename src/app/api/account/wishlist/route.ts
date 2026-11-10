import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";

export async function POST(request: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: { productId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const productId = body.productId;
  if (!productId) return NextResponse.json({ error: "Missing product." }, { status: 400 });

  let inWishlist = false;
  updateDb((db) => {
    const target = db.users.find((candidate) => candidate.id === user.id);
    if (!target) return;
    if (target.wishlist.includes(productId)) {
      target.wishlist = target.wishlist.filter((id) => id !== productId);
      inWishlist = false;
    } else {
      target.wishlist.push(productId);
      inWishlist = true;
    }
  });

  return NextResponse.json({ ok: true, inWishlist });
}
