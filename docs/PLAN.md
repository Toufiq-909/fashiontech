# Butterfly — build plan

## 1. Site map

```
/                          Home — hero, latest work, story, fabric strip, brands, feedback, try-on banner
/latest                    New arrivals + latest-drop timeline + Butterfly Picks
/shop                      Catalogue with filters (category, fabric, brand, tier, size, colour, easy care)
/shop/[slug]               Product page — gallery, brand credit, composition, sizes, care, reviews, try-on CTA
/brands                    Brand Directory
/brands/[slug]             Partner brand page — story, fabrics, delivery, terms, products
/fabrics                   Merino vs Lyocell, six property badges, why natural fibres
/try-on                    Virtual Try-On (upload → consent → garment → preview → colour → compare)
/design                    Design Your Own (Butterfly Originals only)
/feedback                  Feedback form + "Share your Butterfly look" gallery
/about                     Our Story, clothing gap, founders
/cart                      Cart, mixed fulfilment modes
/checkout                  Guest or account, address, payment (UPI / card / COD)
/order/[code]              Confirmation + tracking timeline + invoice-style summary
/track                     Track an order with order ID + email
/account                   Sign in / register, order history, wishlist, saved addresses
/faq  /shipping-returns  /size-guide  /contact  /privacy  /terms
/admin                     Dashboard
/admin/products            Imported product review: approve / reject / verify fabric
/admin/brands              Partner brands, terms notes, fulfilment mode
/admin/feeds               Source feeds, adapter type, enable + run sync
/admin/orders              Orders, forward to brand, status updates
/admin/feedback            Feedback + review photos, feature on home
/admin/settings            Tier price guide, try-on provider status
/sitemap.xml  /robots.txt
```

## 2. Data model

```
Brand           id, slug, name, country, website, logoMark, story, founded,
                fabricTypes[merino|lyocell], shipsToIndia, indiaNote, storesInIndia,
                fulfilment: buy-at-brand | order-via-butterfly,
                affiliateDisclosure, termsNote (admin-only), featured, paletteTone

Feed            id, brandId, adapter: json|csv|affiliate|api, label, endpoint,
                enabled, lastRunAt, importedCount, credentialEnvVars[]

Product         id, slug, brandId, name, category, fabric, fabricPercent,
                composition, gsm, tier (luxury-comfort | everyday-value),
                priceINR, sourcePrice, sourceCurrency, fxRateUsed,
                sizes[], colours[{name,hex}], images[{url|null,kind,credit,allowedForTryOn}],
                sourceUrl, availability, lastSyncedAt, status(pending|approved|rejected),
                fabricVerified (true only when composition came from brand product data),
                isNew, butterflyPick, easyCare, tryOnEligible, styleWith[productId],
                care, description, fit, reviewCount

User            id, name, email, passwordHash(scrypt), role(customer|admin),
                wishlist[productId], addresses[{label,line1,line2,city,state,pin,phone}],
                createdAt

Order           code (BFL-XXXXXX), userId|null, email, items[{productId, name, brand,
                size, colour, qty, unitPrice, fulfilment, customDesignId?}],
                subtotal, shipping, total, address, payment{method,status,providerRef},
                status(placed|confirmed|forwarded|shipped|delivered|cancelled),
                timeline[{at,label}], affiliateItems[] (buy-at-brand hand-offs), createdAt

CustomDesign    id, garmentProductId, fabric, colour, text, artworkFile, transform{scale,
                rotation, x, y}, price, status(approved|pending-review|rejected),
                moderationNote

Review          id, productId, userId, name, rating, body, photo?, verified, featured, createdAt
Feedback        id, name, email, rating, message, photo?, featured, createdAt
Look            id, userId|null, imageFile, garmentProductId, createdAt, deletedAt
```

Persistence: a small JSON store (`.data/db.json`) behind a repository layer, seeded from
`data/brands.json` + `data/feeds/*.json`. Swapping to Postgres/Supabase means replacing
`src/lib/db.ts` only. Passwords use scrypt; sessions are httpOnly cookies stored in the DB.

### Feed adapters

`src/lib/feeds/` exposes one `normalise()` step and four adapters: `json`, `csv`, `affiliate`,
`api`. Every import is staged as `status: "pending"` so an admin approves it, and
`fabricVerified` is only set when the feed carries a `compositionSource` pointing at the
brand's own product data. No scraping and no photography reuse.

## 3. Design system

### Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `--cream` | `#FEFBF6` | Page background, text on dark green |
| `--ink` | `#3D3C42` | Body text, dark surfaces |
| `--forest` | `#677E61` | Primary: header, footer, buttons, frames |
| `--sage` | `#73976A` | Lighter partner green, hover, swatches |
| `--sand` | `#F1DEC4` | Secondary surface |
| `--sky` | `#A6D1E6` | Secondary surface, lyocell cue |
| `--plum` | `#7F5283` | Accent, highlights |
| `--flame` | `#FB6C00` | Accent badges, hover |
| `--amber` | `#F9B637` | Highlight / New badge |
| `--peach` | `#FFDD9C` | Soft highlight |
| `--ember` | `#E73F1E` | Latest tag |
| `--brick` | `#BD4444` | Errors, rare emphasis |

Only these values appear in UI chrome. Product colour swatches use the real product colours
from source data. Contrast pairs follow the brief: cream/white only on forest, plum, ink or
brick (bold or large on forest); ink on flame, amber, peach, sky and sand.

### Type

Inter Tight (display) + Inter (text), both self-hosted through `next/font`. Fluid scale:

```
display  clamp(3.4rem, 10vw, 8.5rem) / 0.92, weight 800, tracking -0.04em
h1       clamp(2.6rem, 6vw, 4.6rem)  / 0.98
h2       clamp(1.9rem, 4vw, 3.2rem)  / 1.02
h3       1.35rem / 1.25
body     1rem / 1.6      small 0.875rem / 1.5      micro 0.75rem / 1.4
```

Left aligned, max line length 68ch. Sentence case throughout; no tracked all-caps eyebrows.

### Layout & components

- 12-column grid, 1360px max, asymmetric editorial splits (7/5, 5/7), generous vertical rhythm
  (`clamp(4rem, 9vw, 8rem)` between sections).
- Rounded frames: 20px corners on imagery, a 1px forest frame with 8px inset on key sections.
- Signature: the flight path — a dashed curve with drifting butterfly glyphs across the hero,
  and a chrysalis → wings storytelling sequence. One orchestrated motion, not per-section fades.
- Components: AnnouncementBar, Header (mega-ish nav + cart count), Footer, Button, Field, Badge,
  ProductCard, GarmentArt (studio/try-on mockup), FabricBadge, PropertyBadges,
  BrandCard, FilterBar, EmptyState, Toast, Dialog, Timeline, StarRating, Accordion, Tabs.
- Partner products show the brand's official image as a credited reference (`brand-reference`,
  source in `data/image-sources.json`); they are never marked as try-on-cleared. The retail
  catalogue only lists photo-backed partner products.
- Own-label Butterfly Originals use our own mockups for try-on and design; with no real photography
  they stay out of `/shop`, `/latest` and home product rails rather than posing illustrations as
  product photos. A missing image on a future feed still falls back to labelled placeholder art.
- Motion honours `prefers-reduced-motion: reduce`; butterflies stop and the hero art is static.
