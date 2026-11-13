import { NextResponse } from "next/server";
import { brandById, retailProducts } from "@/lib/catalog";
import type { Category, Product } from "@/lib/types";

const CATEGORY_WORDS: Record<string, Category> = {
  shirt: "shirts",
  shirts: "shirts",
  blouse: "shirts",
  blouses: "shirts",
  top: "shirts",
  tops: "shirts",
  polo: "shirts",
  tee: "t-shirts",
  tees: "t-shirts",
  tshirt: "t-shirts",
  tshirts: "t-shirts",
  "t-shirt": "t-shirts",
  hoodie: "hoodies",
  hoodies: "hoodies",
  sweatshirt: "hoodies",
  sweatshirts: "hoodies",
  sweater: "hoodies",
  pullover: "hoodies",
  jacket: "hoodies",
  pant: "pants",
  pants: "pants",
  trouser: "pants",
  trousers: "pants",
  bottom: "pants",
  bottoms: "pants",
  short: "shorts",
  shorts: "shorts",
  jogger: "joggers",
  joggers: "joggers",
  sock: "accessories",
  socks: "accessories",
  scarf: "accessories",
  scarves: "accessories",
  dress: "other",
  dresses: "other",
};

const VIBRANT_WORDS = ["vibrant", "bright", "colorful", "colourful", "coloured", "colored", "bold"];

const COLOUR_WORDS = [
  "white", "black", "blue", "brown", "green", "red", "grey", "gray", "pink", "purple",
  "yellow", "orange", "navy", "cream", "beige", "maroon", "teal", "ivory", "ecru", "rust",
  "lavender", "olive", "sage", "sand", "oat", "ink", "plum", "sky", "forest", "charcoal",
  "denim", "off-white",
];

interface OccasionRule {
  id: string;
  pattern: RegExp;
  categories?: Partial<Record<Category, number>>;
  penalties?: Partial<Record<Category, number>>;
  keywords?: RegExp;
  keywordBoost?: number;
  penaltyWords?: RegExp;
  penaltyWordScore?: number;
  fabricBoost?: Partial<Record<Product["fabric"], number>>;
  note?: string;
}

const OCCASION_RULES: OccasionRule[] = [
  {
    id: "formal",
    pattern: /\b(formals?|business|office|work|workwear|work wear|meeting|interview|professional)\b/,
    categories: { shirts: 7, pants: 6 },
    penalties: { hoodies: -6, shorts: -6, joggers: -6, "t-shirts": -3 },
    keywords: /\b(polo|linen|structured|regular fit|notch|tunic)\b/,
    keywordBoost: 4,
    penaltyWords: /\b(sleep|lounge|socks?|scarf)\b/,
    penaltyWordScore: -8,
    note: "Structured shirts and trousers read sharpest for formal settings.",
  },
  {
    id: "party",
    pattern: /\b(part(y|ies)|wedding|festive|celebrat\w*|event|dinner|date night|evening|occasion)\b/,
    categories: { shirts: 6 },
    penalties: { hoodies: -5, joggers: -5, shorts: -5 },
    keywords: /\b(linen|blouse|dress|polo|embroidered|printed|sleeveless|striped)\b/,
    keywordBoost: 5,
    penaltyWords: /\b(sleep|lounge|socks?|scarf)\b/,
    penaltyWordScore: -6,
    note: "Linen shirts, blouses and the polo dress up nicely for occasions.",
  },
  {
    id: "casual",
    pattern: /\b(casual|everyday|daily|weekend|chill)\b/,
    categories: { "t-shirts": 3, hoodies: 3, joggers: 3, shorts: 3 },
    keywords: /\b(everyday|crew|classic)\b/,
    keywordBoost: 2,
  },
  {
    id: "travel",
    pattern: /\b(travel|trip|flight|vacation|holiday|pack(ing)? light)\b/,
    fabricBoost: { merino: 4 },
    note: "Merino resists wrinkles and odour, so it packs light.",
  },
  {
    id: "summer",
    pattern: /\b(summer|hot|heat|warm weather|beach|breathable|cool)\b/,
    fabricBoost: { lyocell: 5 },
    keywords: /\b(linen|sleeveless|shorts|wide-leg|dress|blouse)\b/,
    keywordBoost: 4,
    note: "Lyocell and linen keep you cool in the heat.",
  },
  {
    id: "winter",
    pattern: /\b(winter|cold|freezing|snow|thermo\w*|chilly)\b/,
    fabricBoost: { merino: 5 },
    categories: { hoodies: 3 },
    keywords: /\b(scarf|hoodie|long sleeve)\b/,
    keywordBoost: 3,
    note: "Merino regulates temperature, so it layers well in the cold.",
  },
  {
    id: "sleep",
    pattern: /\b(sleep|sleepwear|nightwear|pyjamas?|pajamas?|loungewear|lounge|rest(ing)? at home)\b/,
    keywords: /\b(sleep|lounge|socks?)\b/,
    keywordBoost: 8,
    note: "Soft, breathable pieces made for resting.",
  },
  {
    id: "active",
    pattern: /\b(gym|workout|active|sports?|running|yoga|training|exercise|athleisure)\b/,
    categories: { joggers: 3 },
    keywords: /\b(active|sports?)\b/,
    keywordBoost: 8,
    note: "Breathable pieces that keep up with movement.",
  },
];

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

function genderOf(product: Product): "women" | "men" | null {
  const name = product.name.toLowerCase();
  if (name.includes("women")) return "women"; // checked first: "women" contains "men"
  if (/\bmen\b/.test(name)) return "men";
  return null;
}

function getRecommendations(message: string) {
  const query = message.toLowerCase().replace(/[^a-z0-9\s-]/g, " ");
  const priceQuery = query.replace(/(\d)[,\s]+(\d)/g, "$1$2"); // "2 000" -> "2000"
  const words = new Set(query.split(/\s+/).filter(Boolean));
  // Intent detection only sees real words: stop words like "i" substring-match
  // inside "shirt"/"merino"/"vibrant", and "to" matches "bottoms".
  const intentWords = new Set([...words].filter((word) => !STOP_WORDS.has(word) && word.length >= 4));
  const searchWords = [...words].filter((word) => !STOP_WORDS.has(word));

  // Category: exact word match first, then typo-tolerant for longer words
  // ("top" must not fuzzy-match "stop").
  let requestedCategory: Category | null = null;
  for (const [word, category] of Object.entries(CATEGORY_WORDS)) {
    if (words.has(word)) {
      requestedCategory = category;
      break;
    }
  }
  if (!requestedCategory) {
    for (const [word, category] of Object.entries(CATEGORY_WORDS)) {
      if (word.length >= 5 && hasFuzzyIntent(intentWords, [word])) {
        requestedCategory = category;
        break;
      }
    }
  }

  const requestedFabric = hasFuzzyIntent(intentWords, ["merino", "wool"]) ? "merino" : hasFuzzyIntent(intentWords, ["lyocell", "tencel"]) ? "lyocell" : null;
  const wantsEasyCare = /easy[- ]?care|low maintenance|no iron|wrinkle|travel/.test(query);
  const wantsNew = /\b(new|latest|recent|arrivals?)\b/.test(query);
  const wantsPick = /\b(best|favourite|favorite|recommend\w*|popular|pick)\b/.test(query);
  const wantsVibrant = hasFuzzyIntent(intentWords, VIBRANT_WORDS);

  const wantsWomen = /\b(women|womens|woman|lady|ladies|female|girl|her|hers|she)\b/.test(query);
  const wantsMen = /\b(men|mens|man|male|gents?|gentlemen|boy|guy|him|his|he)\b/.test(query);

  const wantsOversized = /\b(oversized?|oversize|loose|baggy|boxy|roomy|flowy)\b/.test(query);
  const wantsSlim = /\b(slim|fitted|tight|snug|form fitting)\b/.test(query);

  const wantedColours = [...words].filter((word) => COLOUR_WORDS.includes(word));

  let budgetMin: number | null = null;
  let budget: number | null = null;
  const betweenMatch = priceQuery.match(/between\s*(\d{3,5})\s*(?:and|to|-)\s*(\d{3,5})/);
  const priceMatch = priceQuery.match(/(?:under|below|less than|max|upto|up to|budget(?: of)?)\s*(\d{3,5})/) ?? priceQuery.match(/\b(\d{3,5})\b/);
  if (betweenMatch) {
    budgetMin = Math.min(Number(betweenMatch[1]), Number(betweenMatch[2]));
    budget = Math.max(Number(betweenMatch[1]), Number(betweenMatch[2]));
  } else if (priceMatch && Number(priceMatch[1]) >= 300) {
    budget = Number(priceMatch[1]);
  }

  const activeOccasions = OCCASION_RULES.filter((rule) => rule.pattern.test(query));

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
      if (budgetMin !== null && product.priceINR >= budgetMin) score += 3;

      for (const rule of activeOccasions) {
        if (rule.categories?.[product.category]) score += rule.categories[product.category]!;
        if (rule.penalties?.[product.category]) score += rule.penalties[product.category]!;
        if (rule.fabricBoost?.[product.fabric]) score += rule.fabricBoost[product.fabric]!;
        const nameAndFit = `${product.name} ${product.fit}`.toLowerCase();
        if (rule.keywords && rule.keywordBoost && rule.keywords.test(nameAndFit)) score += rule.keywordBoost;
        if (rule.penaltyWords && rule.penaltyWordScore && rule.penaltyWords.test(nameAndFit)) score += rule.penaltyWordScore;
      }

      const gender = genderOf(product);
      if (wantsWomen) score += gender === "women" ? 6 : gender === "men" ? -8 : 0;
      if (wantsMen) score += gender === "men" ? 6 : gender === "women" ? -8 : 0;

      const fitText = `${product.name} ${product.fit}`.toLowerCase();
      if (wantsOversized && /(oversized|boxy|wide|relaxed|loose|flowy)/.test(fitText)) score += 5;
      if (wantsSlim && /(slim|fitted|regular or slim)/.test(fitText)) score += 5;

      if (wantedColours.length) {
        const colourTerms = new Set(
          product.colours.flatMap((colour) => colour.name.toLowerCase().split(/[^a-z]+/)),
        );
        const matches = wantedColours.some(
          (colour) =>
            colourTerms.has(colour) ||
            (colour.length >= 4 && [...colourTerms].some((term) => fuzzyMatch(colour, term))),
        );
        if (matches) score += 7;
      }

      const haystack = `${product.name} ${product.description} ${product.fit} ${product.composition} ${product.colours.map((colour) => colour.name).join(" ")}`.toLowerCase();
      const productTerms = haystack.split(/[^a-z0-9]+/).filter((term) => term.length > 2);
      for (const word of searchWords) {
        if (word.length < 3) continue;
        if (productTerms.some((term) => word === term || (word.length >= 4 && term.length >= 4 && fuzzyMatch(word, term)))) score += 1;
      }
      return { product, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.product.butterflyPick) - Number(a.product.butterflyPick) ||
        Number(b.product.isNew) - Number(a.product.isNew),
    );

  // When the customer sets a budget, only keep over-budget pieces if the
  // in-budget pool is too small to fill the results.
  let pool = ranked;
  if (budget !== null) {
    const withinBudget = ranked.filter(({ product }) => product.priceINR <= budget! && (budgetMin === null || product.priceINR >= budgetMin));
    if (withinBudget.length >= 3) pool = withinBudget;
  }

  // When the query names no category, diversify: if the top three are all one
  // category, swap the third for the best piece of a different category (e.g.
  // "formals" showing two shirts plus trousers instead of three shirts).
  let chosen = pool.slice(0, 3);
  if (!requestedCategory && chosen.length === 3) {
    const topCategories = new Set(chosen.map(({ product }) => product.category));
    if (topCategories.size === 1) {
      const alternative = pool.find(({ product }) => product.category !== chosen[0].product.category);
      // Only swap in the alternative when it scored credibly — a stray +1 item
      // is worse than a third piece from the category the customer wants.
      if (alternative && alternative.score >= Math.max(2, Math.round(chosen[2].score * 0.4))) {
        chosen = [chosen[0], chosen[1], alternative];
      }
    }
  }

  const source = chosen.length
    ? chosen
    : retailProducts()
        .filter((product) => product.butterflyPick)
        .slice(0, 3)
        .map((product) => ({ product, score: 0 }));

  const results = source.map(({ product }) => ({
    name: product.name,
    brand: brandById(product.brandId)?.name ?? "Butterfly partner",
    priceINR: product.priceINR,
    fabric: product.fabric === "merino" ? "Merino wool" : "Lyocell",
    href: shopUrl(product),
  }));

  const notes: string[] = [];
  const primaryOccasion = activeOccasions.find((rule) => rule.note);
  if (primaryOccasion?.note) notes.push(primaryOccasion.note);
  if (requestedFabric) {
    notes.push(
      requestedFabric === "merino"
        ? "Merino is breathable and temperature regulating."
        : "Lyocell is cool, fluid and especially good for warm days.",
    );
  }
  const allWithinBudget =
    budget !== null &&
    source.every(
      ({ product }) => product.priceINR <= budget! && (budgetMin === null || product.priceINR >= budgetMin),
    );
  if (allWithinBudget) {
    notes.push(
      budgetMin !== null
        ? `Everything shown sits between ₹${budgetMin.toLocaleString("en-IN")} and ₹${budget!.toLocaleString("en-IN")}.`
        : `Everything shown is ₹${budget!.toLocaleString("en-IN")} or under.`,
    );
  }

  const lead = ranked.length
    ? chosenLead(chosen.length)
    : "I couldn't find an exact match for that yet — here are some Butterfly Picks to start with.";

  return { message: `${lead}${notes.length ? ` ${notes.join(" ")}` : ""}`, results };
}

function chosenLead(count: number) {
  return count === 1
    ? "Here's a piece that fits that brief."
    : `I found ${count} pieces that fit that brief.`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { message?: unknown } | null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
  if (message.length > 500) return NextResponse.json({ error: "Please keep your message under 500 characters." }, { status: 400 });
  return NextResponse.json(getRecommendations(message));
}
