export interface BarcodeProduct {
  barcode: string;
  name: string;
  brand?: string;
  serving?: string;
  imageUrl?: string;
  /** Per serving where available, otherwise per 100g. */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  perServing: boolean;
}

const num = (v: unknown) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? Number(n) : 0;
};

/**
 * Look up packaged-food nutrition from Open Food Facts (free, no API key).
 * Prefers per-serving values and falls back to per-100g.
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeProduct | null> {
  const clean = barcode.replace(/\D/g, "");
  if (clean.length < 6) return null;

  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${clean}.json?fields=product_name,brands,serving_size,image_front_small_url,nutriments`
  );
  if (!res.ok) return null;

  const json = await res.json();
  if (json.status !== 1 || !json.product) return null;

  const p = json.product;
  const n = p.nutriments ?? {};
  const hasServing = num(n["energy-kcal_serving"]) > 0;

  return {
    barcode: clean,
    name: p.product_name || "Unknown product",
    brand: p.brands || undefined,
    serving: p.serving_size || (hasServing ? undefined : "100 g"),
    imageUrl: p.image_front_small_url || undefined,
    calories: Math.round(hasServing ? num(n["energy-kcal_serving"]) : num(n["energy-kcal_100g"])),
    protein: num(hasServing ? n.proteins_serving : n.proteins_100g),
    carbs: num(hasServing ? n.carbohydrates_serving : n.carbohydrates_100g),
    fat: num(hasServing ? n.fat_serving : n.fat_100g),
    fiber: num(hasServing ? n.fiber_serving : n.fiber_100g),
    perServing: hasServing,
  };
}
