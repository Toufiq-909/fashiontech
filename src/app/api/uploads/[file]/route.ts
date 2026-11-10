import fs from "node:fs";
import path from "node:path";
import { uploadsDir } from "@/lib/db";

const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const safe = path.basename(file);
  const extension = path.extname(safe).toLowerCase();
  const type = TYPES[extension];
  if (!type) return new Response("Not found", { status: 404 });

  const target = path.join(uploadsDir(), safe);
  if (!target.startsWith(uploadsDir()) || !fs.existsSync(target)) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = fs.readFileSync(target);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": type,
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, max-age=600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
