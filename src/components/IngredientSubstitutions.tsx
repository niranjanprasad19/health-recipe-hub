import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Repeat2 } from "lucide-react";
import { Ingredient } from "@/types/recipe";

const SUBSTITUTION_MAP: Record<string, { sub: string; reason: string }[]> = {
  paneer: [{ sub: "Tofu", reason: "vegan" }, { sub: "Cottage Cheese", reason: "similar" }],
  ghee: [{ sub: "Coconut Oil", reason: "vegan" }, { sub: "Butter", reason: "similar" }],
  butter: [{ sub: "Coconut Oil", reason: "vegan" }, { sub: "Olive Oil", reason: "healthier" }],
  cream: [{ sub: "Coconut Cream", reason: "dairy-free" }, { sub: "Greek Yogurt", reason: "lower fat" }],
  milk: [{ sub: "Oat Milk", reason: "dairy-free" }, { sub: "Almond Milk", reason: "low calorie" }],
  "all-purpose flour": [{ sub: "Whole Wheat Flour", reason: "healthier" }, { sub: "Almond Flour", reason: "gluten-free" }],
  "white rice": [{ sub: "Brown Rice", reason: "more fiber" }, { sub: "Quinoa", reason: "high protein" }],
  rice: [{ sub: "Quinoa", reason: "high protein" }, { sub: "Cauliflower Rice", reason: "low carb" }],
  sugar: [{ sub: "Honey", reason: "natural" }, { sub: "Stevia", reason: "zero calorie" }],
  egg: [{ sub: "Flax Egg", reason: "vegan" }, { sub: "Banana", reason: "binding" }],
  eggs: [{ sub: "Flax Eggs", reason: "vegan" }, { sub: "Applesauce", reason: "binding" }],
  chicken: [{ sub: "Tofu", reason: "vegan" }, { sub: "Chickpeas", reason: "plant protein" }],
  beef: [{ sub: "Mushrooms", reason: "umami" }, { sub: "Lentils", reason: "high protein" }],
  "sour cream": [{ sub: "Greek Yogurt", reason: "lower fat" }, { sub: "Cashew Cream", reason: "vegan" }],
  cheese: [{ sub: "Nutritional Yeast", reason: "vegan" }, { sub: "Cashew Cheese", reason: "dairy-free" }],
  "soy sauce": [{ sub: "Coconut Aminos", reason: "soy-free" }, { sub: "Tamari", reason: "gluten-free" }],
  potato: [{ sub: "Sweet Potato", reason: "more nutrients" }, { sub: "Cauliflower", reason: "low carb" }],
  pasta: [{ sub: "Zucchini Noodles", reason: "low carb" }, { sub: "Whole Wheat Pasta", reason: "more fiber" }],
  bread: [{ sub: "Lettuce Wraps", reason: "low carb" }, { sub: "Whole Grain Bread", reason: "more fiber" }],
  mayonnaise: [{ sub: "Avocado", reason: "healthier fats" }, { sub: "Greek Yogurt", reason: "lower fat" }],
};

function findSubstitutions(ingredients: Ingredient[]) {
  const results: { original: string; substitutions: { sub: string; reason: string }[] }[] = [];
  for (const ing of ingredients) {
    const itemLower = ing.item.toLowerCase().trim();
    for (const [key, subs] of Object.entries(SUBSTITUTION_MAP)) {
      if (itemLower.includes(key)) {
        results.push({ original: ing.item, substitutions: subs });
        break;
      }
    }
  }
  return results;
}

export const IngredientSubstitutions = ({ ingredients }: { ingredients: Ingredient[] }) => {
  const { t } = useTranslation();
  const subs = findSubstitutions(ingredients);

  if (subs.length === 0) return null;

  return (
    <Card className="mt-8 shadow-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Repeat2 className="w-5 h-5 text-primary" />
          {t("substitutions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {subs.map((s) => (
            <div key={s.original} className="p-3 rounded-lg border border-border bg-secondary/30">
              <p className="text-sm font-medium text-foreground mb-2">
                {t("substitutions.noItem", { item: s.original })}
              </p>
              <div className="flex flex-wrap gap-2">
                {s.substitutions.map((sub) => (
                  <Badge key={sub.sub} variant="outline" className="text-xs">
                    {sub.sub} <span className="text-muted-foreground ml-1">({sub.reason})</span>
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
