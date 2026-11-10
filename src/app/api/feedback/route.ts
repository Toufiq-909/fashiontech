import { NextResponse } from "next/server";
import { updateDb } from "@/lib/db";
import { saveImageDataUrl } from "@/lib/uploads";

export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    rating?: number;
    message?: string;
    photo?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 80);
  const email = (body.email ?? "").trim().toLowerCase().slice(0, 160);
  const message = (body.message ?? "").trim();
  const rating = Math.round(Number(body.rating));

  if (name.length < 2) return NextResponse.json({ error: "Tell us your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json({ error: "Write a little more, at least 10 characters." }, { status: 400 });
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from 1 to 5." }, { status: 400 });
  }

  const photo = body.photo ? saveImageDataUrl(body.photo, "feedback") : null;
  if (body.photo && !photo) {
    return NextResponse.json({ error: "That photo could not be accepted. Use JPG, PNG or WebP under 2 MB." }, { status: 400 });
  }

  updateDb((db) => {
    db.feedback.push({
      id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      email,
      rating,
      message: message.slice(0, 1200),
      photo,
      featured: false,
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({ ok: true });
}
