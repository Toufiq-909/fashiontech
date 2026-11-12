import "server-only";
import fs from "node:fs";
import path from "node:path";
import { client } from "@gradio/client";

const HF_SPACE = "yisol/IDM-VTON";
const SPACE_URL = "https://yisol-idm-vton.hf.space";
const DENOISE_STEPS = 30;
const TIMEOUT_MS = 300_000;

function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("BAD_DATA_URL");
  return new Blob([Buffer.from(match[2], "base64")], { type: match[1] });
}

/** Reads a site-public image path (e.g. /images/products/x.jpg) into a Blob. */
function publicImageToBlob(imagePath: string): Blob {
  const relative = imagePath.split("?")[0];
  const file = path.join(process.cwd(), "public", relative);
  const bytes = fs.readFileSync(file);
  const type = relative.endsWith(".png")
    ? "image/png"
    : relative.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  return new Blob([bytes], { type });
}

async function toDataUrl(value: string): Promise<string> {
  if (value.startsWith("data:")) return value;
  const url = value.startsWith("http") ? value : `${SPACE_URL}${value.startsWith("/") ? "" : "/"}${value}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error("VTON_FETCH_RESULT");
  const type = response.headers.get("content-type") ?? "image/png";
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${type};base64,${bytes.toString("base64")}`;
}

/**
 * Gradio image outputs arrive either as a URL string or a file object
 * ({ path, url, ... }) depending on the client version and Space config.
 */
async function outputToDataUrl(value: unknown): Promise<string> {
  if (typeof value === "string") return toDataUrl(value);
  if (value && typeof value === "object") {
    const file = value as { url?: string; path?: string };
    if (file.url) return toDataUrl(file.url);
    if (file.path) return toDataUrl(file.path);
  }
  throw new Error("VTON_EMPTY");
}

function predictOnce(app: Awaited<ReturnType<typeof client>>, humanBlob: Blob, garmentBlob: Blob, description: string) {
  return app.predict("/tryon", [
    { background: humanBlob, layers: [], composite: null },
    garmentBlob,
    description,
    true, // auto-generate the human mask
    true, // crop and resize the garment
    DENOISE_STEPS,
    Math.floor(Math.random() * 1_000_000),
  ]) as Promise<{ data: unknown[] }>;
}

/**
 * Runs the Hugging Face IDM-VTON Space (yisol/IDM-VTON) to render the garment
 * onto the shopper's photo. Returns the generated image as a data URL.
 */
export async function generateIdmVton(input: {
  photoDataUrl: string;
  garmentImagePath: string;
  description: string;
}): Promise<string> {
  const humanBlob = dataUrlToBlob(input.photoDataUrl);
  const garmentBlob = publicImageToBlob(input.garmentImagePath);

  const token = process.env.HF_TOKEN;
  const app = await client(HF_SPACE, token ? { hf_token: token as `hf_${string}` } : undefined);

  // ZeroGPU sessions occasionally drop ("Session not found"); one retry covers it.
  // A timeout is not retried: re-queuing just doubles the wait.
  let prediction: { data: unknown[] };
  try {
    prediction = await Promise.race([
      predictOnce(app, humanBlob, garmentBlob, input.description),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("VTON_TIMEOUT")), TIMEOUT_MS)),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === "VTON_TIMEOUT") throw error;
    prediction = await Promise.race([
      predictOnce(app, humanBlob, garmentBlob, input.description),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("VTON_TIMEOUT")), TIMEOUT_MS)),
    ]);
  }
  return outputToDataUrl(prediction.data?.[0]);
}
