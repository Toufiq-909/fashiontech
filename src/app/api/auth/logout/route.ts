import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, clearSession } from "@/lib/auth";

export async function POST() {
  const store = await cookies();
  clearSession(store.get(SESSION_COOKIE)?.value);
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
