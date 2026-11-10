import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { tierConfig } from "./config";
import { normaliseProduct, slugify, type RawFeedProduct } from "./feeds/normalise";
import type { Brand, Database, Feed, Product, Review, Feedback, Order } from "./types";

const DATA_DIR = process.env.BUTTERFLY_DATA_DIR ?? path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SEED_DIR = path.join(process.cwd(), "data");

const FEED_FILES = ["merino-brands.json", "lyocell-brands.json", "butterfly-originals.json"];
const PARTNER_APPROVED = new Set([
  "UM-ACTIVE-TEE",
  "UM-SLEEP-CREW",
  "WP-100-CREW",
  "WP-SIGNATURE-CREW",
  "WC-EVERYDAY-CREW",
  "WC-POLO",
  "WC-VNECK-W",
  "MC-111-LS",
  "MC-121L-SCOOP",
  "MC-112-RAGLAN",
  "MS-P60723313",
  "MS-P60723342",
  "WS-301086760",
  "W-23FEW62400",
  "W-PINTUCK-TUNIC",
  "AND-AZURE-LYOCELL",
  "AND-CLOUD-LYOCELL",
  "AND-DRIFT-LYOCELL",
  "CW-M-SHIRT-10521",
  "CW-W-BLOUSE-DENIM",
  "CW-W-BLOUSE-RUST",
]);
const PICKS = new Set([
  "everyday-merino-tee",
  "everyday-lyocell-tee",
  "100-wool-crew-neck-tee",
  "drift-brown-lyocell-linen-shirt",
  "eta-off-white-striped-relaxed-fit-shirt",
  "blue-denim-tencel-pleated-pants",
]);

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

function readFeedFile(file: string) {
  return JSON.parse(fs.readFileSync(path.join(SEED_DIR, "feeds", file), "utf8")) as {
    generatedAt: string;
    feeds: {
      feedId: string;
      brandSlug: string;
      adapter: Feed["adapter"];
      label: string;
      endpoint: string;
      credentialEnvVars: string[];
      products: RawFeedProduct[];
    }[];
  };
}

function pairStyle(products: Product[]) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  for (const product of products) {
    const candidates = products.filter(
      (other) =>
        other.id !== product.id &&
        other.status === "approved" &&
        other.category !== product.category &&
        other.brandId !== product.brandId,
    );
    const hash = [...product.slug].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    product.styleWith = [0, 1]
      .map((offset) => candidates[(hash + offset * 3) % Math.max(candidates.length, 1)]?.slug)
      .filter((slug): slug is string => Boolean(slug && bySlug.has(slug)));
  }
}

function seed(): Database {
  const brands = JSON.parse(fs.readFileSync(path.join(SEED_DIR, "brands.json"), "utf8")) as Brand[];
  const brandBySlug = new Map(brands.map((brand) => [brand.slug, brand]));
  const feeds: Feed[] = [];
  const products: Product[] = [];
  const seenSlugs = new Set<string>();

  for (const file of FEED_FILES) {
    const payload = readFeedFile(file);
    for (const feed of payload.feeds) {
      const brand = brandBySlug.get(feed.brandSlug);
      if (!brand) throw new Error(`Unknown brand in feed: ${feed.brandSlug}`);
      feeds.push({
        id: feed.feedId,
        brandId: brand.id,
        adapter: feed.adapter,
        label: feed.label,
        endpoint: feed.endpoint,
        enabled: true,
        lastRunAt: payload.generatedAt,
        importedCount: feed.products.length,
        credentialEnvVars: feed.credentialEnvVars,
      });
      for (const raw of feed.products) {
        const product = normaliseProduct(raw, brand, feed.feedId, payload.generatedAt);
        if (seenSlugs.has(product.slug)) product.slug = `${product.slug}-${slugify(raw.sku)}`;
        seenSlugs.add(product.slug);
        if (brand.kind === "partner") {
          product.status = PARTNER_APPROVED.has(raw.sku) ? "approved" : "pending";
        }
        product.butterflyPick = PICKS.has(product.slug);
        products.push(product);
      }
    }
  }

  pairStyle(products);

  const now = new Date("2026-11-08T06:00:00.000Z").toISOString();
  const demoUserId = "user-demo";
  const adminId = "user-admin";
  const firstProduct = products.find((p) => p.slug === "everyday-merino-tee")!;
  const secondProduct = products.find((p) => p.slug === "everyday-lyocell-tee")!;
  const reviews: Review[] = [
    {
      id: "rev-1",
      productId: firstProduct.id,
      userId: demoUserId,
      name: "Ananya R.",
      rating: 5,
      body: "Wore this through a nine-hour college day and a bus ride home. No creases, no itch, and it still smells fine the next morning, which feels illegal.",
      photo: null,
      verified: true,
      featured: true,
      createdAt: "2026-10-22T10:00:00.000Z",
    },
    {
      id: "rev-2",
      productId: secondProduct.id,
      userId: demoUserId,
      name: "Kabir M.",
      rating: 4,
      body: "Light and genuinely cool in Chennai humidity. The cream is slightly sheer in direct sun, so I wear it over a vest.",
      photo: null,
      verified: true,
      featured: false,
      createdAt: "2026-10-28T13:30:00.000Z",
    },
  ];
  const feedback: Feedback[] = [
    {
      id: "fb-1",
      name: "Sneha P.",
      email: "sneha@example.com",
      rating: 5,
      message:
        "I stopped wearing my school uniform last year and had no idea what my own style was. The mix-and-match suggestions actually helped me build five outfits from three pieces.",
      photo: null,
      featured: true,
      createdAt: "2026-10-30T09:15:00.000Z",
    },
    {
      id: "fb-2",
      name: "Rahul V.",
      email: "rahul@example.com",
      rating: 4,
      message:
        "The fabric composition is on every card, which is why I trusted it. Would love more colour options in the merino tees.",
      photo: null,
      featured: true,
      createdAt: "2026-11-02T17:40:00.000Z",
    },
    {
      id: "fb-3",
      name: "Meher J.",
      email: "meher@example.com",
      rating: 5,
      message: "The virtual try-on is the first one I have used that did not make me look like a paper cut-out. Saved the look and bought the hoodie.",
      photo: null,
      featured: false,
      createdAt: "2026-11-05T11:05:00.000Z",
    },
  ];

  const order: Order = {
    code: "BFL-8K2M4Q",
    userId: demoUserId,
    email: "demo@butterfly.test",
    name: "Demo Customer",
    items: [
      {
        productId: firstProduct.id,
        slug: firstProduct.slug,
        name: firstProduct.name,
        brandId: firstProduct.brandId,
        brandName: "Butterfly Original",
        fabric: "merino",
        composition: firstProduct.composition,
        size: "M",
        colour: "Oat",
        qty: 1,
        unitPrice: firstProduct.priceINR,
        fulfilment: "order-via-butterfly",
      },
      {
        productId: secondProduct.id,
        slug: secondProduct.slug,
        name: secondProduct.name,
        brandId: secondProduct.brandId,
        brandName: "Butterfly Original",
        fabric: "lyocell",
        composition: secondProduct.composition,
        size: "M",
        colour: "Steel Blue",
        qty: 1,
        unitPrice: secondProduct.priceINR,
        fulfilment: "order-via-butterfly",
      },
    ],
    subtotal: firstProduct.priceINR + secondProduct.priceINR,
    shipping: 0,
    total: firstProduct.priceINR + secondProduct.priceINR,
    address: {
      label: "Home",
      line1: "14, 12th Main",
      line2: "Indiranagar",
      city: "Bengaluru",
      state: "Karnataka",
      pin: "560038",
      phone: "+91 90000 00000",
    },
    payment: { method: "upi", status: "paid", providerRef: "test_pay_8K2M4Q", mode: "test" },
    status: "forwarded",
    timeline: [
      { at: "2026-11-06T08:30:00.000Z", label: "Order placed" },
      { at: "2026-11-06T08:31:00.000Z", label: "Payment confirmed (test mode)" },
      { at: "2026-11-06T11:00:00.000Z", label: "Forwarded to Butterfly Originals workshop" },
    ],
    createdAt: "2026-11-06T08:30:00.000Z",
  };

  return {
    brands,
    feeds,
    products,
    users: [
      {
        id: adminId,
        name: "Butterfly Admin",
        email: process.env.ADMIN_EMAIL ?? "admin@butterfly.test",
        passwordHash: hashPassword(process.env.ADMIN_PASSWORD ?? "butterfly-admin"),
        role: "admin",
        wishlist: [],
        addresses: [],
        createdAt: now,
      },
      {
        id: demoUserId,
        name: "Demo Customer",
        email: "demo@butterfly.test",
        passwordHash: hashPassword("live-to-love"),
        role: "customer",
        wishlist: [secondProduct.id],
        addresses: [
          {
            label: "Home",
            line1: "14, 12th Main",
            line2: "Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pin: "560038",
            phone: "+91 90000 00000",
          },
        ],
        createdAt: now,
      },
    ],
    sessions: [],
    orders: [order],
    reviews,
    feedback,
    designs: [],
    looks: [],
    settings: { tiers: tierConfig },
  };
}

declare global {
  var __butterflyDb: Database | undefined;
}

export function getDb(): Database {
  if (globalThis.__butterflyDb) return globalThis.__butterflyDb;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  let db: Database;
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database;
  } else {
    db = seed();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  globalThis.__butterflyDb = db;
  return db;
}

export function saveDb(db: Database) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  globalThis.__butterflyDb = db;
}

export function updateDb(mutator: (db: Database) => void) {
  const db = getDb();
  mutator(db);
  saveDb(db);
  return db;
}

export function resetDb() {
  if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);
  globalThis.__butterflyDb = undefined;
  return getDb();
}

export function publicFileUrl(file: string) {
  return `/api/uploads/${path.basename(file)}`;
}

export function uploadsDir() {
  const dir = path.join(DATA_DIR, "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}
