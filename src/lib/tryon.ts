import "server-only";
import type { Product } from "@/lib/types";
import { generateIdmVton } from "@/lib/tryon-vton";

export interface TryOnResult {
  mode: "image" | "overlay";
  provider: string;
  image?: string;
  garmentImage: string | null;
  notice: string;
}

/**
 * tryOn service interface. The request first goes to the Hugging Face IDM-VTON
 * Space (yisol/IDM-VTON), which renders the garment onto the shopper's photo.
 * When the Space is unreachable, rate-limited or out of quota, the flow falls
 * back to a 2D garment overlay so the experience still works locally.
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

  // IDM-VTON works from a real garment photograph, not our SVG mockup.
  const garmentPhoto = input.product.images.find(
    (entry) => entry.url && !entry.url.startsWith("/api/garment"),
  );
  if (garmentPhoto?.url) {
    try {
      const fabricLabel = input.product.fabric === "merino" ? "merino wool" : "lyocell";
      const rendered = await generateIdmVton({
        photoDataUrl: input.photo,
        garmentImagePath: garmentPhoto.url,
        description: `A ${input.colourHex} ${fabricLabel} ${input.product.category.replace("-", " ")}`,
      });
      return {
        mode: "image",
        provider: "idm-vton-hf",
        image: rendered,
        garmentImage,
        notice:
          "Your preview is ready. It isn't kept unless you save the look.",
      };
    } catch (error) {
      console.error(
        "IDM-VTON Space failed, falling back to 2D overlay:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return {
    mode: "overlay",
    provider: "local-overlay",
    garmentImage,
    notice:
      "Our try-on service is busy right now, so here's a quick preview instead. Try again in a minute for the full preview.",
  };
}
