import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import type { Address } from "@/lib/types";

const FIELDS: (keyof Address)[] = ["label", "line1", "line2", "city", "state", "pin", "phone"];

export async function POST(request: Request) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: Partial<Address>;
  try {
    body = (await request.json()) as Partial<Address>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const address = Object.fromEntries(
    FIELDS.map((field) => [field, (body[field] ?? "").toString().trim().slice(0, 160)]),
  ) as unknown as Address;

  if (!address.line1 || !address.city || !address.state || !/^\d{6}$/.test(address.pin)) {
    return NextResponse.json(
      { error: "Add a street address, city, state and a 6-digit PIN code." },
      { status: 400 },
    );
  }
  address.label = address.label || "Home";

  updateDb((db) => {
    const target = db.users.find((candidate) => candidate.id === user.id);
    if (target) target.addresses.push(address);
  });

  return NextResponse.json({ ok: true });
}
