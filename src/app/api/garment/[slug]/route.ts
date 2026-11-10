import { productBySlug } from "@/lib/catalog";
import { garmentSvg } from "@/lib/garment";

/**
 * Serves the illustrated garment mockup. Butterfly Originals mockups are our own
 * artwork, so they are the only feed images cleared for try-on and customisation.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const colourParam = url.searchParams.get("colour");
  const colour =
    product.colours.find((option) => option.hex.toLowerCase() === colourParam?.toLowerCase())?.hex ??
    product.colours[0]?.hex ??
    "#F1DEC4";
  const transparent = url.searchParams.get("transparent") === "1";

  return new Response(garmentSvg(product.category, colour, transparent), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
