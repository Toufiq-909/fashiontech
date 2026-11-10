/**
 * One-time catalogue image fetch.
 *
 * Downloads each partner product's official image from the brand's own CDN and
 * records the source page in data/image-sources.json.
 *
 * These are credited REFERENCE images, not permission-cleared assets:
 * call imageRights "reference" so the UI never treats them as try-on-cleared.
 * Confirm affiliate/partner usage rights before publishing.
 *
 * Run with: node scripts/fetch-product-images.mjs
 */
import fs from "node:fs";
import path from "node:path";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36";
const OUT_DIR = path.join(process.cwd(), "public", "images", "products");

const images = [
  {
    feed: "merino-brands.json",
    sku: "UM-ACTIVE-TEE",
    brand: "Unbound Merino",
    page: "https://unboundmerino.com/products/active-t-shirt",
    image:
      "https://cdn.shopify.com/s/files/1/1491/5166/files/Unbound-Merino-Mens-Active-Merino-T-Shirt-Charcoal-1.jpg?v=1776494235",
  },
  {
    feed: "merino-brands.json",
    sku: "UM-SLEEP-CREW",
    brand: "Unbound Merino",
    page: "https://unboundmerino.com/products/mens-ultrafine-merino-sleep-crew",
    image:
      "https://cdn.shopify.com/s/files/1/1491/5166/files/Unbound-Merino-Mens-Ultrafine-Merino-Sleep-Crew-Black-1_21d3a1af-0a9c-4305-be7b-1588aefd2bcb.jpg?v=1783996364",
  },
  {
    feed: "merino-brands.json",
    sku: "WP-100-CREW",
    brand: "Wool&Prince",
    page: "https://woolandprince.com/products/crew-neck-tee-100-washed-navy",
    image:
      "https://cdn.shopify.com/s/files/1/0236/4195/files/20260326_WP_00117_100WoolCrewNeckTee_WashedNavy-LR.jpg?v=1777913172",
  },
  {
    feed: "merino-brands.json",
    sku: "WP-SIGNATURE-CREW",
    brand: "Wool&Prince",
    page: "https://woolandprince.com/products/crew-neck-t-shirt-natural-white",
    image:
      "https://cdn.shopify.com/s/files/1/0236/4195/files/20260326_WP_00231_SignatureCrewNeckTee_NaturalWhite-LR.jpg?v=1778187439",
  },
  {
    feed: "merino-brands.json",
    sku: "WC-EVERYDAY-CREW",
    brand: "Woolly Clothing Co.",
    page: "https://www.woolly.clothing/products/mens-merino-crew-tee",
    image:
      "https://cdn.shopify.com/s/files/1/1204/3948/products/studio-2022-m-everyday-shortsleeve-crewneck-black-front-trent-1.jpg?v=1762882783",
  },
  {
    feed: "merino-brands.json",
    sku: "WC-POLO",
    brand: "Woolly Clothing Co.",
    page: "https://www.woolly.clothing/products/mens-merino-polo",
    image:
      "https://cdn.shopify.com/s/files/1/1204/3948/files/studio-2026-m-everyday-ss-polo-fir-front-doug-1.jpg?v=1781113376",
  },
  {
    feed: "merino-brands.json",
    sku: "WC-VNECK-W",
    brand: "Woolly Clothing Co.",
    page: "https://www.woolly.clothing/products/womens-merino-vneck-tee",
    image:
      "https://cdn.shopify.com/s/files/1/1204/3948/files/studio-w-everyday-ss-vneck-tannin-front-xs-2025-katya-3_de8db918-36c5-4cc2-a273-84b3d74150c2.jpg?v=1762894253",
  },
  {
    feed: "merino-brands.json",
    sku: "MC-111-LS",
    brand: "Merino Country",
    page: "https://www.merinocountry.com/products/111-long-sleeve-crew-neck-merino-t-shirt-175gsm",
    image:
      "https://cdn.shopify.com/s/files/1/0084/0047/0082/files/111-long-sleeve-crew-Latte_unisexSQ_b93763ce-176d-4339-9be5-b3aeb4991712.png?v=1785984588",
  },
  {
    feed: "merino-brands.json",
    sku: "MC-121L-SCOOP",
    brand: "Merino Country",
    page: "https://www.merinocountry.com/products/long-sleeve-scoop-neck-merino-t-shirt",
    image:
      "https://cdn.shopify.com/s/files/1/0084/0047/0082/products/121L-Scoop-Long-Sleeve-Shirt-black2.jpg?v=1765160494",
  },
  {
    feed: "merino-brands.json",
    sku: "MC-112-RAGLAN",
    brand: "Merino Country",
    page: "https://www.merinocountry.com/products/raglan-long-sleeve-merino-tshirt-275gsm",
    image:
      "https://cdn.shopify.com/s/files/1/0084/0047/0082/files/112-oliveWEB_72d0b05c-3fa3-4f79-8d52-72cc508343c1.jpg?v=1776399964",
  },
  {
    feed: "lyocell-brands.json",
    sku: "MS-P60723313",
    brand: "Marks & Spencer India",
    page: "https://www.marksandspencer.in/lyocell-rich-printed-crew-neck-blouse/p/P60723313.html",
    image:
      "https://assets.digitalcontent.marksandspencer.app/image/upload/w_1008,h_1319,q_auto,f_auto,e_sharpen/SD_01_T43_3002W_N4_X_EC_0",
  },
  {
    feed: "lyocell-brands.json",
    sku: "MS-P60723342",
    brand: "Marks & Spencer India",
    page: "https://www.marksandspencer.in/lyocell-rich-textured-bubble-hem-blouse/p/P60723342.html",
    image:
      "https://assets.digitalcontent.marksandspencer.app/image/upload/w_1008,h_1319,q_auto,f_auto,e_sharpen/SD_01_T43_3058W_J1_X_EC_0",
  },
  {
    feed: "lyocell-brands.json",
    sku: "MS-P60789287",
    brand: "Marks & Spencer India",
    page: "https://www.marksandspencer.in/lyocell-rich-embroidered-notch-neck-blouse/p/P60789287.html",
    image:
      "https://assets.digitalcontent.marksandspencer.app/image/upload/w_1008,h_1319,q_auto,f_auto,e_sharpen/SD_01_T53_2692U_OO_X_EC_0",
  },
  {
    feed: "lyocell-brands.json",
    sku: "WS-301086760",
    brand: "Westside",
    page: "https://www.westside.com/products/eta-off-white-striped-pattern-relaxed-fit-shirt-301086760",
    image:
      "https://cdn.shopify.com/s/files/1/0266/6276/4597/files/301086760OFFWHITE_1.jpg?v=1793169039",
  },
  {
    feed: "lyocell-brands.json",
    sku: "W-23FEW62400",
    brand: "W for Woman",
    page: "https://www.wforwoman.com/products/blue-denim-tencel-pleated-pants-23few62400-704256",
    image:
      "https://cdn.shopify.com/s/files/1/0776/0419/2550/files/23FEW62400-704256_1.jpg?v=1721332523",
  },
  {
    feed: "lyocell-brands.json",
    sku: "W-PINTUCK-TUNIC",
    brand: "W for Woman",
    page: "https://www.wforwoman.com/products/blue-pintuck-denim-tunic-24few30911-704256",
    image:
      "https://cdn.shopify.com/s/files/1/0776/0419/2550/files/24FEW30911-704256_1.jpg?v=1721331510",
  },
  {
    feed: "lyocell-brands.json",
    sku: "AND-AZURE-LYOCELL",
    brand: "Andamen",
    page: "https://www.andamen.com/products/azure-blue-lyocell-linen-shirt",
    image:
      "https://cdn.shopify.com/s/files/1/0618/3183/9957/files/01_bd4aba32-131c-476e-9a0b-2f585e39d3fb.jpg?v=1786711919",
  },
  {
    feed: "lyocell-brands.json",
    sku: "AND-CLOUD-LYOCELL",
    brand: "Andamen",
    page: "https://www.andamen.com/products/cloud-white-linen-shirt",
    image:
      "https://cdn.shopify.com/s/files/1/0618/3183/9957/files/01_15e93895-3184-4ce5-8b65-e68c5e63be44.jpg?v=1787307759",
  },
  {
    feed: "lyocell-brands.json",
    sku: "AND-DRIFT-LYOCELL",
    brand: "Andamen",
    page: "https://www.andamen.com/products/drift-brown-linen-shirt",
    image:
      "https://cdn.shopify.com/s/files/1/0618/3183/9957/files/01_a93945c2-c195-40d4-beb0-dca133957995.jpg?v=1787834455",
  },
  {
    feed: "lyocell-brands.json",
    sku: "VIR-XITI-DRESS",
    brand: "VIRGIO",
    page: "https://www.virgio.com/products/square-neck-sunshine-dress",
    image:
      "https://cdn.shopify.com/s/files/1/0785/1674/8585/files/26th_July_Virgio-2362.jpg?v=1749548268",
  },
  {
    feed: "lyocell-brands.json",
    sku: "CW-M-SHIRT-10521",
    brand: "Cottonworld",
    page: "https://cottonworld.net/products/mens-cotton-lyocell-regular-fit-shirt-blue",
    image:
      "https://cdn.shopify.com/s/files/1/1231/6442/files/M-SHIRTS-10521-21390-BLUE_1.jpg?v=1762240434",
  },
  {
    feed: "lyocell-brands.json",
    sku: "CW-W-BLOUSE-DENIM",
    brand: "Cottonworld",
    page: "https://cottonworld.net/products/womens-tencel-regular-fit-sleeveless-blouse-denim",
    image:
      "https://cdn.shopify.com/s/files/1/1231/6442/files/L-BLOUSE-17751-21497-DENIM_1.jpg?v=1766558020",
  },
  {
    feed: "lyocell-brands.json",
    sku: "CW-W-BLOUSE-RUST",
    brand: "Cottonworld",
    page: "https://cottonworld.net/products/womens-tencel-linen-regular-fit-blouse-rust",
    image:
      "https://cdn.shopify.com/s/files/1/1231/6442/files/COTTONWORLDMODEL04521.jpg?v=1785157165",
  },
];

function withWidth(url) {
  if (!url.includes("cdn.shopify.com")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}width=1200`;
}

function extensionFor(contentType, url) {
  if (/png/i.test(contentType) || /\.png(\?|$)/i.test(url)) return "png";
  if (/webp/i.test(contentType)) return "webp";
  return "jpg";
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const manifest = [];
const skipped = [];

for (const entry of images) {
  if (!entry.image) {
    skipped.push({ sku: entry.sku, reason: "No official image URL captured yet." });
    continue;
  }
  const source = withWidth(entry.image);
  try {
    const response = await fetch(source, {
      headers: { "User-Agent": UA, Accept: "image/jpeg,image/png,image/webp,image/*" },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const type = response.headers.get("content-type") ?? "";
    if (!type.startsWith("image/")) throw new Error(`Unexpected content type ${type}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 8_000) throw new Error(`Image too small (${bytes.length} bytes)`);
    const ext = extensionFor(type, source);
    const filename = `${entry.sku.toLowerCase()}.${ext}`;
    fs.writeFileSync(path.join(OUT_DIR, filename), bytes);
    manifest.push({
      sku: entry.sku,
      brand: entry.brand,
      productPage: entry.page,
      imageUrl: source,
      localFile: `/images/products/${filename}`,
      bytes: bytes.length,
      contentType: type,
      rights: "reference",
      note: "Official brand image used as a credited reference. Confirm permission or affiliate image terms before publishing. Not cleared for virtual try-on.",
    });
    console.log(`ok   ${entry.sku.padEnd(20)} ${ext} ${Math.round(bytes.length / 1024)} KB`);
    await new Promise((resolve) => setTimeout(resolve, 120));
  } catch (error) {
    skipped.push({ sku: entry.sku, reason: error instanceof Error ? error.message : String(error) });
    console.log(`FAIL ${entry.sku.padEnd(20)} ${error instanceof Error ? error.message : error}`);
  }
}

for (const feedName of ["merino-brands.json", "lyocell-brands.json"]) {
  const file = path.join(process.cwd(), "data", "feeds", feedName);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const feed of data.feeds) {
    for (const product of feed.products) {
      const found = manifest.find((entry) => entry.sku === product.sku);
      if (!found) continue;
      product.imageUrl = found.localFile;
      product.imagePermission = false;
      product.imageRights = "reference";
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

fs.writeFileSync(
  path.join(process.cwd(), "data", "image-sources.json"),
  `${JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      rights: "reference",
      note: "Official product images downloaded from each brand's own CDN for this demonstration catalogue. They remain the property of the brand. Confirm affiliate/partner image permissions before publishing; they are not cleared for virtual try-on.",
      images: manifest,
      skipped,
    },
    null,
    2,
  )}\n`,
);

console.log(`\nDownloaded ${manifest.length}; skipped ${skipped.length}.`);
