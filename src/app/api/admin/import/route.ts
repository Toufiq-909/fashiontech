import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateDb } from "@/lib/db";
import { normaliseProduct, parseCSV, slugify, type RawFeedProduct } from "@/lib/feeds/normalise";
import type { Brand, Category, Feed } from "@/lib/types";

const ALLOWED_CATEGORIES: Category[] = [
  "shirts",
  "pants",
  "t-shirts",
  "hoodies",
  "shorts",
  "joggers",
  "accessories",
  "other",
];

type Input = Record<string, unknown>;

function readString(record: Input, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function parseSizes(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value ?? "")
    .split(/[|,]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseColours(value: unknown): { name: string; hex: string }[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (entry && typeof entry === "object") {
          const colour = entry as { name?: unknown; hex?: unknown };
          return { name: String(colour.name ?? "").trim(), hex: String(colour.hex ?? "").trim() };
        }
        return { name: String(entry), hex: "" };
      })
      .filter((colour) => colour.name && /^#[0-9a-fA-F]{6}$/.test(colour.hex));
  }
  return String(value ?? "")
    .split("|")
    .map((entry) => {
      const [name, hex] = entry.split(":");
      return { name: (name ?? "").trim(), hex: (hex ?? "").trim() };
    })
    .filter((colour) => colour.name && /^#[0-9a-fA-F]{6}$/.test(colour.hex));
}

function toRaw(record: Input, warnings: string[]): RawFeedProduct {
  const category = readString(record, ["category"]);
  const fabric = readString(record, ["fabric"]).toLowerCase();
  const price = Number(readString(record, ["price"]));
  const compositionPercent = Number(readString(record, ["compositionPercent", "composition_percent"]));
  const sizes = parseSizes(record.sizes);
  const colours = parseColours(record.colours);
  const imageUrl = readString(record, ["imageUrl", "image_url"]);
  const imagePermission =
    record.imagePermission === true ||
    String(record.imagePermission ?? record.image_permission ?? "").toLowerCase() === "true";

  if (!readString(record, ["sku"])) throw new Error("Missing sku.");
  if (!readString(record, ["name"])) throw new Error("Missing name.");
  if (!ALLOWED_CATEGORIES.includes(category as Category)) {
    throw new Error(`Category “${category}” is not in the Butterfly catalogue.`);
  }
  if (fabric !== "merino" && fabric !== "lyocell") {
    throw new Error("Fabric must be merino or lyocell.");
  }
  if (!Number.isFinite(price) || price <= 0) throw new Error("Price must be a positive number.");
  if (!Number.isFinite(compositionPercent) || compositionPercent < 50 || compositionPercent > 100) {
    throw new Error("Main fibre composition must be between 50% and 100%.");
  }
  if (!readString(record, ["composition"])) throw new Error("Missing composition.");
  if (!readString(record, ["sourceUrl", "source_url"])) throw new Error("Missing sourceUrl.");
  if (!sizes.length) throw new Error("At least one size is required.");
  if (!colours.length) throw new Error("At least one colour in Name:#hex format is required.");
  if (imageUrl && !imagePermission) {
    warnings.push(`Image for ${readString(record, ["name"])} was stripped: no explicit image permission.`);
  }

  return {
    sku: readString(record, ["sku"]),
    name: readString(record, ["name"]),
    category: category as Category,
    fabric,
    composition: readString(record, ["composition"]),
    compositionPercent,
    compositionSource: readString(record, ["compositionSource", "composition_source"]) || "admin-upload",
    gsm: Number(readString(record, ["gsm"])) || undefined,
    price,
    currency: readString(record, ["currency"]).toUpperCase() || "INR",
    sizes,
    colours,
    imageUrl: imageUrl && imagePermission ? imageUrl : null,
    imagePermission,
    sourceUrl: readString(record, ["sourceUrl", "source_url"]),
    availability:
      readString(record, ["availability"]) === "low-stock"
        ? "low-stock"
        : readString(record, ["availability"]) === "sold-out"
          ? "sold-out"
          : "in-stock",
    description: readString(record, ["description"]) || "Imported product awaiting editorial copy.",
    fit: readString(record, ["fit"]) || "Relaxed fit",
    care: readString(record, ["care"]) || "Follow the brand's care label.",
    isNew: String(record.isNew ?? "false").toLowerCase() === "true",
    easyCare: String(record.easyCare ?? "true").toLowerCase() !== "false",
    customisable: false,
    reviewNote: "Uploaded through the admin CSV/JSON adapter.",
  };
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  let body: { brandId?: string; adapter?: "csv" | "json"; text?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.text || !body.text.trim()) {
    return NextResponse.json({ error: "No file content received." }, { status: 400 });
  }
  if (body.text.length > 2_000_000) {
    return NextResponse.json({ error: "That file is too large. Keep imports under 2 MB." }, { status: 413 });
  }

  const db = updateDb(() => {}); // ensure the store exists before reading brands
  const brand = db.brands.find((entry) => entry.id === body.brandId);
  if (!brand) return NextResponse.json({ error: "Choose a valid brand." }, { status: 400 });

  let records: Input[] = [];
  try {
    if (body.adapter === "json") {
      const parsed = JSON.parse(body.text) as unknown;
      const list = Array.isArray(parsed) ? parsed : (parsed as { products?: unknown[] }).products;
      if (!Array.isArray(list)) throw new Error("JSON must be an array or an object with a products array.");
      records = list as Input[];
    } else {
      records = parseCSV(body.text) as Input[];
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not parse the file." },
      { status: 400 },
    );
  }

  if (!records.length) return NextResponse.json({ error: "The file contains no products." }, { status: 400 });
  if (records.length > 300) {
    return NextResponse.json({ error: "Import at most 300 products at a time." }, { status: 413 });
  }

  const warnings: string[] = [];
  const now = new Date().toISOString();
  const feedId = `feed-upload-${Date.now()}`;
  let imported = 0;
  let skipped = 0;

  updateDb((database) => {
    const currentBrand = database.brands.find((entry) => entry.id === brand.id) as Brand | undefined;
    if (!currentBrand) return;

    const feed: Feed = {
      id: feedId,
      brandId: brand.id,
      adapter: body.adapter === "json" ? "json" : "csv",
      label: `Admin ${body.adapter === "json" ? "JSON" : "CSV"} upload — ${now.slice(0, 10)}`,
      endpoint: "internal://admin-upload",
      enabled: true,
      lastRunAt: now,
      importedCount: 0,
      credentialEnvVars: [],
    };

    for (const record of records) {
      try {
        const raw = toRaw(record, warnings);
        const expectedId = `prod-${currentBrand.slug}-${raw.sku.toLowerCase()}`;
        if (database.products.some((product) => product.id === expectedId)) {
          skipped += 1;
          continue;
        }
        const product = normaliseProduct(raw, currentBrand, feedId, now);
        product.status = "pending";
        let slug = slugify(product.name);
        let suffix = 1;
        while (database.products.some((entry) => entry.slug === slug)) {
          slug = `${slugify(product.name)}-${suffix++}`;
        }
        product.slug = slug;
        database.products.push(product);
        imported += 1;
      } catch (error) {
        warnings.push(
          `${readString(record, ["sku"]) || "Row"}: ${error instanceof Error ? error.message : "invalid"}`,
        );
      }
    }

    if (imported > 0) {
      feed.importedCount = imported;
      database.feeds.push(feed);
    }
  });

  if (imported === 0) {
    return NextResponse.json(
      { error: warnings[0] ?? "Nothing was imported.", warnings },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, imported, skipped, warnings });
}
