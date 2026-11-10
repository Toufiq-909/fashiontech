import type { MetadataRoute } from "next";
import { retailProducts, brands } from "@/lib/catalog";
import { site } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const staticRoutes = [
    "",
    "/shop",
    "/latest",
    "/brands",
    "/fabrics",
    "/try-on",
    "/design",
    "/feedback",
    "/about",
    "/faq",
    "/shipping-returns",
    "/size-guide",
    "/contact",
    "/privacy",
    "/terms",
  ];
  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: (route === "" || route === "/shop" ? "daily" : "monthly") as "daily" | "monthly",
      priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.6,
    })),
    ...retailProducts().map((product) => ({
      url: `${base}/shop/${product.slug}`,
      lastModified: new Date(product.lastSyncedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...brands().map((brand) => ({
      url: `${base}/brands/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
