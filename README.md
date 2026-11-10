# Butterfly — Live to Love

Butterfly is a complete, responsive e-commerce brand site for an Indian fashion label that curates
Merino wool and Lyocell clothing from named partner brands, plus a small own-label range
(“Butterfly Original”) made with a manufacturing partner in India.

Built with Next.js 15 (App Router), React 19, TypeScript and Tailwind CSS v4. Data is seeded from
feed-shaped JSON files into a local JSON store; there is no external database required to run it.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production:

```bash
npm run build
npm start
```

The first request creates `.data/db.json` from `data/brands.json` and `data/feeds/*.json`.
To reset the demo store, stop the server and delete `.data/` (uploads included).

### Demo accounts

Created by the seed unless overridden with environment variables:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@butterfly.test` | `butterfly-admin` |
| Customer | `demo@butterfly.test` | `live-to-love` |

**Change both before any real use.** Admin is at `/admin`.

---

## What is in the build

| Area | Routes |
| --- | --- |
| Home | `/` — hero, latest work, brand story, chrysalis sequence, Picks, mix-and-match looks, fabric strip, six property badges, featured brands, feedback, try-on banner |
| New arrivals | `/latest` — newest pieces, latest-drop timeline, pinned Picks |
| Shop | `/shop` — category chips + filters (category, fabric, brand, price tier, size, colour, easy care, Picks, search, sort) |
| Product | `/shop/[slug]` — colour gallery, brand credit, composition, verified badge, sizes, care, source price, delivery/returns by mode, reviews, “Style it with”, size guide |
| Brands | `/brands`, `/brands/[slug]` — directory, story, fabrics, India delivery, ordering mode, affiliate disclosure |
| Fabrics | `/fabrics` — Merino vs Lyocell comparison, swatches, care, six property badges |
| Cart | `/cart` — order-via-Butterfly pieces only |
| Checkout | `/checkout` — guest or account, address, UPI/card/COD, test-mode labelling |
| Orders | `/order/[code]`, `/track` — confirmation, timeline, tracking by ID + email |
| Account | `/account` — sign in/register, order history, wishlist, saved addresses, saved looks |
| Try-on | `/try-on` — upload, consent, garment/colour, generate, compare, save/delete, add to cart |
| Design | `/design` — blank, fabric/colour, text/artwork, placement/scale/rotation, live price, moderation, try-on preview, custom cart item |
| Feedback | `/feedback` — general form, featured notes, community look gallery |
| About | `/about` — mission, clothing gap, audience, founders |
| Static | `/faq`, `/shipping-returns`, `/size-guide`, `/contact`, `/privacy`, `/terms` |
| Admin | `/admin`, `/admin/products`, `/admin/orders`, `/admin/brands`, `/admin/feeds`, `/admin/feedback`, `/admin/designs`, `/admin/settings` |
| SEO | `/sitemap.xml`, `/robots.txt`, metadata + Open Graph, Product JSON-LD |

## Data model and seed

- `data/brands.json` — the partner + own-label seed directory.
- `data/feeds/merino-brands.json`, `lyocell-brands.json`, `butterfly-originals.json` — sample payloads
  shaped like permitted partner feeds.
- `src/lib/feeds/normalise.ts` — one normalisation step (price conversion, tier, verification,
  images, try-on eligibility) shared by all adapters.
- `src/lib/db.ts` — JSON repository, seeded on first run, with scrypt password hashing.
- `src/lib/catalog.ts` — read queries used by pages.
- `docs/PLAN.md` — site map, data model and design-system summary.

Each product stores: brand, name, category, exact composition + main-fibre percentage, source price
and currency, INR price and FX rate used, sizes, colours, image permission/metadata, source URL,
availability, last-synced timestamp, review status, fabric-verification flag, Picks flag, easy-care,
try-on eligibility, customisation eligibility and style pairings.

Seed products come from real brand product pages checked in November 2026.

### Product images

Partner products use each brand's **official product image**, downloaded from the brand's own CDN into
`public/images/products/` and recorded with its product-page source in `data/image-sources.json`. These
are credited **reference images** (`imageRights: "reference"`, `imagePermission: false`): the brands
own the photographs, and Butterfly does not claim an image licence. Confirm each brand's affiliate or
partner image terms before publishing, and remove an image on request. They are deliberately **not**
cleared for virtual try-on.

Butterfly Originals use our own SVG mockups, which are cleared for both try-on and customisation. Those
concepts have no real product photography yet, so the retail catalogue (`/shop`, `/latest`, home) is
filtered to photo-backed partner products. The Originals remain approved for the try-on and design
studios, where a digital mockup is the intended output, but they are not presented as shoppable
photographs. The fetch script is `scripts/fetch-product-images.mjs`; non-commercial demonstration use
only.

If a future feed supplies photography with permission, set `imagePermission: true` and `imageUrl`; the
normaliser then labels it as supplied rather than as a reference.

### Price tiers

- Luxury comfort (Merino): ₹4,000–₹4,500 guide.
- Everyday value (Lyocell): ₹500–₹600 guide.
- The guide is editable at `/admin/settings`; partner prices are always displayed as their own INR
  price, never silently changed. The filters and labels use these ranges.

### Feed adapters and import

Supported: official affiliate/partner feeds (`affiliate`/`json`), permitted brand APIs (`api`), and
CSV/JSON upload from `/admin/feeds`.

CSV columns (JSON accepts the same keys; `sizes` may be an array and `colours` an array of
`{name, hex}`):

```
sku,name,category,fabric,composition,compositionPercent,compositionSource,gsm,price,currency,
sizes,colours,imageUrl,imagePermission,sourceUrl,availability,description,fit,care,isNew,easyCare
```

- `sizes`: `S|M|L` (pipe or comma separated).
- `colours`: `Forest:#677E61|Ink:#3D3C42`.
- `imagePermission`: `true` only when the source explicitly allows this use. Unpermitted images are
  stripped and replaced with a labelled placeholder.
- Every upload is staged as `pending`; approve it in `/admin/products`.
- Duplicate SKUs are skipped. Max 300 products / 2 MB per upload.

No scraping and no unlicensed photography.

## Environment variables

Create `.env.local` (or `.env`) — never commit it.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | for SEO | Canonical origin, e.g. `https://butterfly.example` |
| `ADMIN_EMAIL` | optional | Seeds the admin email instead of the demo value |
| `ADMIN_PASSWORD` | optional | Seeds the admin password instead of the demo value |
| `BUTTERFLY_DATA_DIR` | optional | Data store directory (default `.data`) |
| `TRYON_API_URL` | optional | Virtual try-on provider endpoint |
| `TRYON_API_KEY` | optional | Provider bearer token |
| `RAZORPAY_KEY_ID` | optional | Enables Razorpay order creation |
| `RAZORPAY_KEY_SECRET` | optional | Razorpay secret (server only) |
| `RAZORPAY_MODE` | optional | `test` (default) or `live` |
| `UNBOUND_FEED_URL`, `UNBOUND_FEED_TOKEN` | optional | Example feed credentials surfaced in admin |
| `MSINDIA_FEED_URL`, `MSINDIA_FEED_TOKEN` | optional | Example feed credentials surfaced in admin |

### Virtual try-on provider contract

`src/lib/tryon.ts` posts:

```json
{
  "image": "data:image/jpeg;base64,…",
  "garment_image_url": "https://your-site/api/garment/everyday-merino-tee?transparent=1&colour=%23677E61",
  "category": "t-shirts",
  "colour": "#677E61",
  "preserve_background": true
}
```

with `Authorization: Bearer $TRYON_API_KEY`. It accepts `{ "image" | "image_url" | "output": [url] }`.
Without both variables it returns `mode: "overlay"` and the client draws an adjustable 2D garment
overlay. The fallback is always labelled as a 2D overlay, never as an AI render. Photos are not stored
unless the customer presses “Save this look”.

### Payments

`src/lib/payments.ts` is an adapter:

- No keys → labelled **test mode**; no money is collected. UPI/card orders are marked paid for the
  demo; COD stays pending.
- Razorpay keys → a real order is created server-side (INR paise) and the payment stays **pending**
  until the Razorpay checkout and webhook signature verification are wired. That handshake is the
  remaining production integration step; the adapter and order model are in place.

Card/UPI secrets never reach the browser and are never rendered in admin.

---

## Brand and legal rules encoded in the build

- Every card and product page credits the brand (“From [Brand]”).
- Butterfly never claims partner products as its own. Own-label goods are marked “Butterfly Original”.
- Only products whose main fibre is Merino or Lyocell (≥50%) are listed.
- “Fabric verified” only appears when the composition came from brand product data or our tech pack.
- Lyocell is always labelled Lyocell (or Tencel), never “Lyocell wool”.
- Affiliate links are labelled and carry `rel="sponsored nofollow"`.
- Ordering mode, delivery note and returns owner are shown per brand and per product.
- Brand terms are internal notes per partner in `/admin/brands`.
- Partner photography is credited to the brand and recorded as a reference, never as an owned asset or as try-on clearance. Replace it with permissioned feed images before launch.

## Design system

Palette tokens and usage follow the brief exactly: cream `#FEFBF6` page, ink `#3D3C42` text, forest
`#677E61` primary, sage `#73976A`, sand `#F1DEC4`, sky `#A6D1E6`, plum `#7F5283`, and warm accents
`#FB6C00`, `#F9B637`, `#FFDD9C`, `#E73F1E`, with brick `#BD4444` for errors. Product swatches may use
real product colours. Type is Inter Tight (display) + Inter (body) via `next/font`. See
`src/app/globals.css` + `src/app/site.css` and `docs/PLAN.md`.

Accessibility: semantic landmarks, skip link, labelled fields, visible focus rings, keyboardable
menus and custom controls, WCAG-AA contrast pairings from the brief, alt text on content images,
`aria-live` for cart/preview status, and `prefers-reduced-motion` stops the butterflies, ticker and
fades. Performance: local WebP photography for the catalogue, lazy-loaded below the fold, SVG/CSS art
confined to the try-on and design studios, system-adjacent font loading with `display: swap`, no
layout-shift hero, no client library beyond React.

## Deployment notes

This build uses the Node runtime and a writable local data directory for orders, uploads and the JSON
store. Deploy to a Node host with a persistent disk (or swap `src/lib/db.ts` for PostgreSQL/Supabase
and object storage for uploads). It is **not** a static export and is not ready for an edge/Workers
host as-is because of `node:fs` and the JSON store. Ensure `/api/uploads` is served privately in
production, add rate limiting to auth/try-on/feedback, add email delivery for confirmations and a
Razorpay webhook with signature verification.

## Limitations / honest notes

- Payments are in labelled test mode unless Razorpay keys are supplied; the live checkout handshake is
  not completed.
- No transactional email is sent; the confirmation page is the record.
- Catalogue sample data is static and was verified against brand pages at seed time; prices and stock
  change. Re-sync real feeds before launch.
- Partner photography uses official brand images as credited references, not permission-cleared
  catalogue assets; confirm image/affiliate terms and replace on request before launch.
- Butterfly Originals are studio concepts without real photography, so they are excluded from retail
  listings; only the try-on and design tools show their illustrations.
- Try-on falls back to a 2D overlay unless a provider key is set; the overlay is an approximation.
- The local JSON store is single-process and not suitable for production concurrency; it is a
  deliberate, swappable demo repository.
- No newsletter or marketing automation is included.
