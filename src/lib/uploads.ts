import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { uploadsDir } from "./db";

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/** Persist a base64 image data URL. SVG is deliberately rejected (script risk). */
export function saveImageDataUrl(dataUrl: string, prefix: string): string | null {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(dataUrl);
  if (!match) return null;
  const extension = TYPES[match[1]];
  if (!extension) return null;
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (buffer.length > 3 * 1024 * 1024) return null;
  const filename = `${prefix}-${randomUUID()}.${extension}`;
  fs.writeFileSync(path.join(uploadsDir(), filename), buffer);
  return filename;
}

export function deleteUpload(filename: string) {
  const target = path.join(uploadsDir(), path.basename(filename));
  if (fs.existsSync(target)) fs.unlinkSync(target);
}
