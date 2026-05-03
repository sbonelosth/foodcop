import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Extract only the minimal OFF fields needed for Groq normalization.
 * This keeps token usage low while preserving all signal.
 */
function extractMinimalOffData(product) {
  if (!product) return null;
  const pick = (keys) => {
    for (const k of keys) if (product[k] != null) return product[k];
    return undefined;
  };
  return {
    product_name: pick(["product_name", "product_name_en"]),
    brands: pick(["brands"]),
    manufacturing_places: pick(["manufacturing_places"]),
    manufacturing_places_tags: pick(["manufacturing_places_tags"]),
    quantity: pick(["quantity"]),
    product_quantity: pick(["product_quantity"]),
    product_quantity_unit: pick(["product_quantity_unit"]),
    countries: pick(["countries"]),
    countries_tags: pick(["countries_tags"]),
    purchase_places: pick(["purchase_places"]),
    categories: pick(["categories"]),
    categories_tags: pick(["categories_tags"]),
    categories_hierarchy: pick(["categories_hierarchy"]),
    allergens: pick(["allergens"]),
    allergens_tags: pick(["allergens_tags"]),
    allergens_from_ingredients: pick(["allergens_from_ingredients"]),
    traces_tags: pick(["traces_tags"]),
    ingredients_text: pick(["ingredients_text", "ingredients_text_en"]),
    image_url: pick(["image_url"]),
  };
}

/**
 * Call Groq to normalize raw OFF data into a strict schema.
 */
async function callGroqNormalization(minimalOffData) {
  if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY not set; skipping normalization.");
    return null;
  }

  const systemPrompt = `You are a product data normalizer.
Take the provided OpenFoodFacts JSON and return a single JSON object matching this exact schema:
{
  "product_name": "string | null",
  "manufacturer_name": "string | null",
  "quantity": "string | null",
  "country_of_origin": "string | null",
  "category": "string | null",
  "allergens": "string | null",
  "image_url": "string | null"
}
Rules:
- Clean and normalize every field.
- Infer a clean product name (e.g. "Jungle Oats Original - 1KG"). Include brand and quantity in the name when available.
- manufacturer_name: use brands or manufacturing_places.
- quantity: normalize to a clean string like "1 kg", "500 g", "750 ml".
- country_of_origin: use countries, manufacturing_places, or purchase_places. Pick the most specific country.
- category: pick the most specific, consumer-friendly category from the hierarchy. Do NOT use broad tags like "plant-based foods".
- allergens: list known allergens as a comma-separated string. If none are listed, return null. Do NOT return "None listed".
- image_url: pass through the OFF image_url if present, otherwise null.
- Return null for any field you cannot determine with confidence. Never hallucinate.
- Output ONLY valid JSON. No markdown, no explanations, no code fences.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(minimalOffData) },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn("Groq API error:", response.status, text);
    return null;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    return JSON.parse(content);
  } catch (e) {
    console.warn("Groq returned invalid JSON:", content);
    return null;
  }
}

/**
 * Search Shoprite directly and scrape the first product image from the search grid.
 */
async function fetchShopriteImage(productName) {
  if (!productName) return null;
  const searchUrl = `https://www.shoprite.co.za/search/all?q=${encodeURIComponent(productName)}`;

  try {
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Strategy 1: extract first data-product-ga (structured JSON with absolute URL)
    const gaMatch = html.match(/data-product-ga="([^"]+)"/);
    if (gaMatch?.[1]) {
      const decoded = gaMatch[1].replace(/&quot;/g, '"');
      const ga = JSON.parse(decoded);
      if (ga.product_image_url) return ga.product_image_url;
    }

    // Strategy 2: first <img> inside .item-product__image
    const imgMatch = html.match(
      /<div class="item-product__image[^"]*">[\s\S]*?<img[^>]+src="([^"]+)"/i
    );
    if (imgMatch?.[1]) {
      const src = decodeHtmlEntities(imgMatch[1]);
      return src.startsWith("/") ? `https://www.shoprite.co.za${src}` : src;
    }
  } catch (e) {
    console.warn("Shoprite image fetch failed:", e);
  }

  return null;
}

/**
 * GET /api/shoprite-image?q=<productName>
 * Search Shoprite directly and return the first product image URL.
 */
app.get("/api/shoprite-image", async (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Missing q" });
  }
  const imageUrl = await fetchShopriteImage(q);
  return res.json({ imageUrl: imageUrl || null });
});

/**
 * GET /api/product?barcode=<barcode>
 * Full pipeline: OpenFoodFacts → Groq normalization → Shoprite image.
 */
app.get("/api/product", async (req, res) => {
  const { barcode } = req.query;
  if (!barcode || typeof barcode !== "string") {
    return res.status(400).json({ error: "Missing barcode" });
  }

  try {
    // 1. Fetch OpenFoodFacts
    const offRes = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );
    const offData = await offRes.json();

    if (offData?.status !== 1 || !offData?.product) {
      return res.status(404).json({ error: "Product not found in OpenFoodFacts" });
    }

    // 2. Extract minimal fields (token-efficient)
    const minimalOffData = extractMinimalOffData(offData.product);

    // 3. Normalize with Groq
    let normalized = null;
    if (GROQ_API_KEY) {
      normalized = await callGroqNormalization(minimalOffData);
    }

    if (!normalized) {
      // Fallback: return raw OFF data without normalization
      return res.json({
        product_name: minimalOffData.product_name || null,
        manufacturer_name: minimalOffData.brands || null,
        quantity: minimalOffData.quantity || null,
        country_of_origin: minimalOffData.countries || null,
        category: null,
        allergens: null,
        image_url: minimalOffData.image_url || null,
      });
    }

    // 4. Override image with Shoprite if available
    if (normalized.product_name) {
      const shopriteImage = await fetchShopriteImage(normalized.product_name);
      if (shopriteImage) {
        normalized.image_url = shopriteImage;
      }
    }

    return res.json(normalized);
  } catch (error) {
    console.error("Product pipeline error:", error);
    return res.status(500).json({ error: "Failed to fetch product data" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));