import { NextResponse } from "next/server";
import { brandById, retailProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

const CATEGORY_WORDS: Record<string, Product["category"]> = {
  shirt: "shirts",
  shirts: "shirts",
  tee: "t-shirts",
  tees: "t-shirts",
  tshirt: "t-shirts",
  "t-shirt": "t-shirts",
  hoodie: "hoodies",
  hoodies: "hoodies",
  pant: "pants",
  pants: "pants",
  trouser: "pants",
  trousers: "pants",
  short: "shorts",
  shorts: "shorts",
  jogger: "joggers",
  joggers: "joggers",
};

const VIBRANT_WORDS = ["vibrant", "bright", "colorful", "colourful", "coloured", "colored", "bold"];
const STOP_WORDS = new Set(["i", "want", "need", "the", "a", "an", "some", "something", "for", "with", "and", "that", "please", "show", "me", "find", "looking"]);

function levenshtein(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const saved = previous[column];
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + Number(left[row - 1] !== right[column - 1]),
      );
      diagonal = saved;
    }
  }
  return previous[right.length];
}

function fuzzyMatch(word: string, candidate: string) {
  if (word === candidate || candidate.includes(word) || word.includes(candidate)) return true;
  if (word.length < 4 || candidate.length < 4) return false;
  return levenshtein(word, candidate) <= Math.max(1, Math.floor(candidate.length * 0.27));
}

function hasFuzzyIntent(words: Set<string>, intents: string[]) {
  return [...words].some((word) => intents.some((intent) => fuzzyMatch(word, intent)));
}

function isVibrant(hex: string) {
  const value = hex.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return false;
  const channels = [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
  const high = Math.max(...channels);
  const low = Math.min(...channels);
  const lightness = (high + low) / 2;
  const saturation = high === low ? 0 : (high - low) / (1 - Math.abs(2 * lightness - 1));
  return saturation >= 0.42 && lightness >= 0.22 && lightness <= 0.78;
}

function shopUrl(product: Product) {
  return `/shop/${product.slug}`;
}

function getRecommendations(message: string) {
  const query = message.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  const words = new Set(query.split(/\s+/).filter(Boolean));
  const searchWords = [...words].filter((word) => !STOP_WORDS.has(word));
  const requestedCategory = Object.entries(CATEGORY_WORDS).find(([word]) => hasFuzzyIntent(words, [word]))?.[1];
  const requestedFabric = hasFuzzyIntent(words, ["merino", "wool"]) ? "merino" : hasFuzzyIntent(words, ["lyocell", "tencel"]) ? "lyocell" : null;
  const wantsEasyCare = /easy care|low maintenance|no iron|wrinkle|travel/.test(query);
  const wantsNew = /new|latest|recent|arrival/.test(query);
  const wantsPick = /best|favourite|favorite|recommend|popular|pick/.test(query);
  const wantsVibrant = hasFuzzyIntent(words, VIBRANT_WORDS);
  const priceMatch = query.match(/(?:under|below|less than|budget)\s*(?:₹|rs\.?|inr)?\s*(\d{3,5})/i);
  const budget = priceMatch ? Number(priceMatch[1]) : null;

  const ranked = retailProducts()
    .map((product) => {
      let score = 0;
      if (requestedCategory && product.category === requestedCategory) score += 9;
      if (requestedFabric && product.fabric === requestedFabric) score += 7;
      if (wantsEasyCare && product.easyCare) score += 4;
      if (wantsNew && product.isNew) score += 4;
      if (wantsPick && product.butterflyPick) score += 3;
      if (wantsVibrant && product.colours.some((colour) => isVibrant(colour.hex))) score += 7;
      if (budget !== null && product.priceINR <= budget) score += 5;
      if (budget !== null && product.priceINR > budget) score -= 3;
      const haystack = `${product.name} ${product.description} ${product.fit} ${product.composition} ${product.colours.map((colour) => colour.name).join(" ")}`.toLowerCase();
      const productTerms = haystack.split(/[^a-z0-9]+/).filter((term) => term.length > 2);
      for (const word of searchWords) {
        if (word.length < 3) continue;
        if (productTerms.some((term) => fuzzyMatch(word, term))) score += 1;
      }
      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.butterflyPick) - Number(a.product.butterflyPick))
    .slice(0, 3);

  const results = (ranked.length ? ranked.map(({ product }) => product) : retailProducts().filter((product) => product.butterflyPick).slice(0, 3)).map((product) => ({
    name: product.name,
    brand: brandById(product.brandId)?.name ?? "Butterfly partner",
    priceINR: product.priceINR,
    fabric: product.fabric === "merino" ? "Merino wool" : "Lyocell",
    href: shopUrl(product),
  }));

  const detail = requestedFabric ? ` ${requestedFabric === "merino" ? "Merino is breathable and temperature regulating." : "Lyocell is cool, fluid and especially good for warm days."}` : "";
  const lead = ranked.length ? `I found ${results.length} piece${results.length === 1 ? "" : "s"} that fits that brief.` : "Here are a few Butterfly Picks to begin with.";

  return { message: `${lead}${detail}`, results };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { message?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
  if (message.length > 500) return NextResponse.json({ error: "Please keep your message under 500 characters." }, { status: 400 });
  return NextResponse.json(getRecommendations(message));
}
