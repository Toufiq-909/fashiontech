import { NextResponse } from "next/server";
import { getDb, updateDb } from "@/lib/db";
import { deleteUpload } from "@/lib/uploads";

/** One-click deletion of a saved look and its stored image. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = getDb().looks.find((entry) => entry.id === id);
  if (!look) return NextResponse.json({ error: "Not found." }, { status: 404 });

  deleteUpload(look.imageFile);
  updateDb((db) => {
    db.looks = db.looks.filter((entry) => entry.id !== id);
  });
  return NextResponse.json({ ok: true });
}
