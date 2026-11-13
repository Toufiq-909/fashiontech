import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Client } from "@gradio/client";

const HF_SPACE = process.env.TRYON_HF_SPACE ?? "yisol/IDM-VTON";
const SPACE_URL = `https://${HF_SPACE.toLowerCase().replace(/[/_]/g, "-")}.hf.space`;
const DENOISE_STEPS = 30;
const TIMEOUT_MS = Number(process.env.TRYON_TIMEOUT_MS ?? 120_000);

function dataUrlToBlob(dataUrl: string): Blob {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("BAD_DATA_URL");
  return new Blob([Buffer.from(match[2], "base64")], { type: match[1] });
}

/** Reads a site-public image path (e.g. /images/products/x.jpg) into a Blob. */
function publicImageToBlob(imagePath: string): Blob {
  const relative = imagePath.split("?")[0];
  const file = path.join(process.cwd(), "public", relative);
  if (!fs.existsSync(file)) throw new Error(`GARMENT_PHOTO_MISSING: ${relative}`);
  const bytes = fs.readFileSync(file);
  const type = relative.endsWith(".png")
    ? "image/png"
    : relative.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  return new Blob([bytes], { type });
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}_TIMEOUT`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/** Candidate download URLs for a Gradio output file, most likely first. */
function candidateUrls(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  const file = value as { url?: string | null; path?: string | null };
  const urls: string[] = [];
  if (file.url) urls.push(file.url);
  if (file.path) {
    const p = file.path.replace(/^\/+/, "");
    urls.push(`${SPACE_URL}/gradio_api/file=/${p}`, `${SPACE_URL}/file=/${p}`);
  }
  return urls;
}

async function downloadAsDataUrl(value: unknown): Promise<string> {
  const urls = candidateUrls(value);
  if (urls.length === 0) throw new Error(`VTON_EMPTY: ${JSON.stringify(value)}`);
  const token = process.env.HF_TOKEN;
  const tried: string[] = [];
  // The Space's file route can 404 for a short moment right after generation
  // (worker/ingress propagation), so retry the whole candidate list with backoff.
  for (let round = 0; round < 3; round++) {
    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: AbortSignal.timeout(30_000),
        });
        if (response.ok) {
          const type = response.headers.get("content-type") ?? "image/png";
          const bytes = Buffer.from(await response.arrayBuffer());
          return `data:${type};base64,${bytes.toString("base64")}`;
        }
        tried.push(`${response.status} ${url}`);
      } catch (error) {
        tried.push(`${error instanceof Error ? error.message : "error"} ${url}`);
      }
    }
    if (round < 2) await new Promise((resolve) => setTimeout(resolve, 2000 * (round + 1)));
  }
  throw new Error(`VTON_FETCH_RESULT: ${tried.join(" | ")}`);
}

/**
 * Runs the Hugging Face IDM-VTON Space to render the garment onto the shopper's photo.
 * Returns the generated image as a data URL.
 */
export async function generateIdmVton(input: {
  photoDataUrl: string;
  garmentImagePath: string;
  description: string;
}): Promise<string> {
  const humanBlob = dataUrlToBlob(input.photoDataUrl);
  const garmentBlob = publicImageToBlob(input.garmentImagePath);

  const token = process.env.HF_TOKEN;
  const app = await withTimeout(
    Client.connect(HF_SPACE, token ? { hf_token: token as `hf_${string}` } : undefined),
    30_000,
    "VTON_CONNECT",
  );

  const run = () =>
    withTimeout(
      app.predict("/tryon", [
        { background: humanBlob, layers: [], composite: null },
        garmentBlob,
        input.description,
        true, // auto-generate the human mask
        true, // crop and resize the garment
        DENOISE_STEPS,
        Math.floor(Math.random() * 1_000_000),
      ]) as Promise<{ data: unknown[] }>,
      TIMEOUT_MS,
      "VTON_PREDICT",
    );

  // ZeroGPU sessions occasionally drop; retry once, but never after a timeout.
  let prediction: { data: unknown[] };
  try {
    prediction = await run();
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("_TIMEOUT")) throw error;
    console.error("[tryon] first predict failed, retrying once:", error);
    prediction = await run();
  }
  console.log("[tryon] raw output:", JSON.stringify(prediction.data?.[0]));
  return downloadAsDataUrl(prediction.data?.[0]);
}
