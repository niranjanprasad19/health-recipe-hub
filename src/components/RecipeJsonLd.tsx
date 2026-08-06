import { Helmet } from "react-helmet-async";

interface RecipeJsonLdProps {
  title: string;
  description?: string;
  image?: string | null;
  cuisine?: string;
  prepTime?: number | string | null;
  cookTime?: number | string | null;
  servings?: number | string | null;
  ingredients?: unknown;
  instructions?: unknown;
  calories?: number | string | null;
}

function toIngredientStrings(ingredients: unknown): string[] {
  if (!Array.isArray(ingredients)) return [];
  return ingredients
    .map((i) => {
      if (typeof i === "string") return i;
      if (i && typeof i === "object") {
        const o = i as Record<string, unknown>;
        return [o.amount, o.item].filter(Boolean).join(" ").trim();
      }
      return "";
    })
    .filter((s) => s.length > 0);
}

function toInstructionSteps(instructions: unknown) {
  if (!Array.isArray(instructions)) return [];
  return instructions
    .map((s) => {
      if (typeof s === "string") return s;
      if (s && typeof s === "object") {
        const o = s as Record<string, unknown>;
        return typeof o.instruction === "string" ? o.instruction : "";
      }
      return "";
    })
    .filter((s) => s.length > 0)
    .map((text) => ({ "@type": "HowToStep", text }));
}

const isoDuration = (minutes?: number | string | null) => {
  const n = typeof minutes === "string" ? parseInt(minutes, 10) : minutes;
  return n && !Number.isNaN(n) ? `PT${n}M` : undefined;
};

export const RecipeJsonLd = ({
  title,
  description,
  image,
  cuisine,
  prepTime,
  cookTime,
  servings,
  ingredients,
  instructions,
  calories,
}: RecipeJsonLdProps) => {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: title,
    description,
    recipeCuisine: cuisine || undefined,
    prepTime: isoDuration(prepTime),
    cookTime: isoDuration(cookTime),
    recipeYield: servings ? `${servings} servings` : undefined,
    recipeIngredient: toIngredientStrings(ingredients),
    recipeInstructions: toInstructionSteps(instructions),
    author: { "@type": "Organization", name: "NutriChef" },
  };
  if (image) data.image = [image];
  if (calories) data.nutrition = { "@type": "NutritionInformation", calories: `${calories} calories` };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  );
};
