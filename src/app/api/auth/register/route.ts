import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { updateDb } from "@/lib/db";
import { SESSION_COOKIE, createSession, normaliseEmail } from "@/lib/auth";
import type { User } from "@/lib/types";

export async function POST(request: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = (body.name ?? "").trim().slice(0, 80);
  const email = normaliseEmail(body.email ?? "");
  const password = body.password ?? "";

  if (name.length < 2) return NextResponse.json({ error: "Tell us your name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Use a password of at least 8 characters." }, { status: 400 });
  }
  let duplicate = false;
  let created: User | null = null;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  updateDb((database) => {
    if (database.users.some((user) => user.email.toLowerCase() === email)) {
      duplicate = true;
      return;
    }
    created = {
      id: `user-${crypto.randomUUID()}`,
      name,
      email,
      passwordHash: `scrypt:${salt}:${hash}`,
      role: "customer",
      wishlist: [],
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    database.users.push(created);
  });

  if (duplicate || !created) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in instead." },
      { status: 409 },
    );
  }

  const account = created as User;
  const { token, maxAge } = createSession(account.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });

  return NextResponse.json({ ok: true, role: account.role, name: account.name });
}
