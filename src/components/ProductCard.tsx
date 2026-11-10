import Link from "next/link";
import { ProductVisual } from "./ProductVisual";
import { formatINR } from "@/lib/format";
import type { Brand, Product } from "@/lib/types";

export function ProductCard({
  product,
  brand,
  priority = false,
  compact = false,
}: {
  product: Product;
  brand: Brand;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <article className="product-card">
      <Link
        href={`/shop/${product.slug}`}
        className="block relative"
        aria-label={`${product.name} from ${brand.name}`}
      >
        <div className="product-art" style={{ background: brand.tone }}>
          <div className="badge-row">
            {product.isNew && <span className="badge badge-new">New</span>}
            {product.butterflyPick && <span className="badge badge-pick">Butterfly Pick</span>}
            {!product.isNew && product.fabric === "merino" && (
              <span className="badge badge-merino">Luxury comfort</span>
            )}
          </div>
          <ProductVisual product={product} brandTone={brand.tone} priority={priority} showNote={false} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="product-meta">
          <div>
            <Link
              href={`/shop/${product.slug}`}
              className="h3 block hover:underline decoration-1 underline-offset-4"
            >
              {product.name}
            </Link>
            <p className="text-[0.8rem] muted">From {brand.name}</p>
          </div>
          <p className="product-price">{formatINR(product.priceINR)}</p>
        </div>
        {!compact && (
          <p className="text-[0.78rem] leading-snug muted">
            {product.composition}
            {product.fabricVerified && <span className="badge badge-verified ml-2">Fabric verified</span>}
          </p>
        )}
        <p className="micro muted">
          {brand.fulfilment === "buy-at-brand"
            ? "Buy at the brand · Butterfly may earn a commission"
            : "Order via Butterfly · we forward it to the brand"}
        </p>
      </div>
    </article>
  );
}
