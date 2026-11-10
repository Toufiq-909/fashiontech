import "server-only";
import type { Product } from "@/lib/types";

export interface TryOnResult {
  mode: "image" | "overlay";
  provider: string;
  image?: string;
  garmentImage: string | null;
  notice: string;
}

/**
 * tryOn service interface. When TRYON_API_URL and TRYON_API_KEY are set, the
 * request is forwarded to the configured virtual try-on provider. The provider
 * contract is documented in the README. Without keys, the client falls back to
 * a 2D garment overlay so the flow still works locally.
 */
export async function generateTryOn(input: {
  photo: string;
  product: Product;
  colourHex: string;
  origin: string;
}): Promise<TryOnResult> {
  const image = input.product.images.find((entry) => entry.allowedForTryOn && entry.url);
  if (!image?.url) {
    throw new Error("NO_TRIABLE_IMAGE");
  }
  const garmentImage = image.url.startsWith("http")
    ? image.url
    : `${input.origin}${image.url}${image.url.includes("?") ? "&" : "?"}transparent=1&colour=${encodeURIComponent(input.colourHex)}`;

  const url = process.env.TRYON_API_URL;
  const key = process.env.TRYON_API_KEY;
  if (!url || !key) {
    return {
      mode: "overlay",
      provider: "local-overlay",
      garmentImage,
      notice:
        "No try-on model key is configured, so this is a client-side 2D overlay preview, not an AI render. Add TRYON_API_URL and TRYON_API_KEY to enable the model.",
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: input.photo,
      garment_image_url: garmentImage,
      category: input.product.category,
      colour: input.colourHex,
      preserve_background: true,
    }),
  });

  if (!response.ok) {
    console.error("Try-on provider failed", response.status, (await response.text()).slice(0, 400));
    throw new Error("TRYON_PROVIDER_ERROR");
  }

  const payload = (await response.json()) as {
    image?: string;
    image_url?: string;
    output?: string[];
    provider?: string;
  };
  const rendered = payload.image ?? payload.image_url ?? payload.output?.[0];
  if (!rendered) throw new Error("TRYON_PROVIDER_EMPTY");

  return {
    mode: "image",
    provider: payload.provider ?? "configured-provider",
    image: rendered,
    garmentImage,
    notice: "Preview generated for this session. It is not stored unless you save the look.",
  };
}
