import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Clock, Flame, Leaf, Loader2,
  Users, UtensilsCrossed, Sparkles, Check, AlertCircle, Share2, CheckCircle,
  Plus, X, Refrigerator, ChefHat,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Recipe } from "@/types/recipe";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CookingMode } from "@/components/CookingMode";

const commonIngredients = [
  "Onion", "Tomato", "Potato", "Rice", "Eggs", "Bread", "Chicken", "Paneer",
  "Garlic", "Ginger", "Lentils", "Spinach", "Milk", "Butter", "Flour",
  "Cheese", "Bell Pepper", "Carrot", "Curd", "Oil",
];

const formatRecipeText = (recipe: Recipe): string => {
  const ingredients = recipe.ingredients.map(i => `• ${i.amount} ${i.item}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
  const steps = recipe.instructions.map(s => `${s.step}. ${s.instruction}${s.tip ? ` (Tip: ${s.tip})` : ''}`).join('\n');
  return `${recipe.title}\n\n${recipe.description}\n\n🥗 Ingredients:\n${ingredients}\n\n👨‍🍳 Instructions:\n${steps}\n\n📊 Nutrition: ${recipe.nutritionInfo.calories} cal | ${recipe.nutritionInfo.protein} protein | ${recipe.nutritionInfo.carbs} carbs | ${recipe.nutritionInfo.fat} fat`;
};

const LeftoverRecipe = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Pre-filled when arriving from the pantry ("Cook from my pantry").
  const prefilled: string[] = Array.isArray(location.state?.ingredients)
    ? location.state.ingredients.filter((i: unknown) => typeof i === "string")
    : [];

  const [ingredients, setIngredients] = useState<string[]>(prefilled);
  const [inputValue, setInputValue] = useState("");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookingMode, setCookingMode] = useState(false);

  const addIngredient = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !ingredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
    }
    setInputValue("");
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter(i => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient(inputValue);
    }
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    setIsSaved(false);

    const formData = {
      prompt: `Create a recipe using ONLY these ingredients: ${ingredients.join(", ")}. You may suggest minimal pantry staples (salt, pepper, oil) if needed, but the recipe must primarily use the listed ingredients.`,
      likes: ingredients, dislikes: [], allergies: [], dietaryStyles: [],
      ageRange: "Adult", activityLevel: "Moderate", servings: "2",
      deficiencies: [], healthGoals: [], cuisines: [],
      mode: "leftover" as const,
    };

    try {
      const currentLang = i18n.language || "en";
      const response = await supabase.functions.invoke("generate-recipe", {
        body: { formData, language: currentLang },
      });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      setRecipe(response.data.recipe);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate recipe");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({ title: t("recipe.signInRequired"), description: t("recipe.signInToSave") });
      navigate("/auth");
      return;
    }
    if (!recipe || !user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("saved_recipes").insert([{
        user_id: user.id, title: recipe.title, description: recipe.description,
        ingredients: JSON.parse(JSON.stringify(recipe.ingredients)),
        instructions: JSON.parse(JSON.stringify(recipe.instructions)),
        nutrition_info: JSON.parse(JSON.stringify(recipe.nutritionInfo)),
        prep_time: recipe.prepTime, cook_time: recipe.cookTime, servings: recipe.servings,
        cuisine: recipe.cuisine, tags: recipe.tags,
      }]);
      if (error) throw error;
      setIsSaved(true);
      toast({ title: t("recipe.recipeSaved"), description: t("recipe.findInProfile") });
    } catch {
      toast({ title: t("recipe.failedToSave"), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;
    const text = formatRecipeText(recipe);
    if (navigator.share) {
      try { await navigator.share({ title: recipe.title, text }); return; } catch {}
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: t("recipe.linkCopied"), description: t("recipe.recipeCopied") });
    setTimeout(() => setCopied(false), 2000);
  };

  const availableChips = commonIngredients.filter(
    c => !ingredients.some(i => i.toLowerCase() === c.toLowerCase())
  );

  if (cookingMode && recipe) {
    return <CookingMode recipe={recipe} onClose={() => setCookingMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Refrigerator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {t("leftover.title")}
          </h1>
          <p className="text-muted-foreground">{t("leftover.subtitle")}</p>
        </div>

        {/* Ingredient input */}
        <Card className="mb-6 shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder={t("leftover.placeholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button onClick={() => addIngredient(inputValue)} disabled={!inputValue.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected ingredients */}
            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {ingredients.map((item) => (
                  <Badge key={item} variant="default" className="text-sm py-1 px-3 gap-1">
                    {item}
                    <button onClick={() => removeIngredient(item)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Quick-add chips */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t("leftover.commonIngredients")}</p>
              <div className="flex flex-wrap gap-1.5">
                {availableChips.map((item) => (
                  <button
                    key={item}
                    onClick={() => addIngredient(item)}
                    className="px-2.5 py-1 rounded-full bg-secondary text-xs text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          className="w-full gradient-primary text-primary-foreground"
          size="lg"
          onClick={generateRecipe}
          disabled={ingredients.length === 0 || isLoading}
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("common.loading")}</>
          ) : (
            <><ChefHat className="w-5 h-5 mr-2" />{t("leftover.generate")}</>
          )}
        </Button>

        {/* Error */}
        {error && (
          <Card className="mt-6 border-destructive">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-8 h-8 mx-auto text-destructive mb-2" />
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Recipe result */}
        {recipe && (
          <div className="mt-8 animate-fade-in">
            {/* Actions */}
            <div className="flex justify-center gap-2 mb-6">
              <Button variant="outline" onClick={() => setCookingMode(true)}>
                <Sparkles className="w-4 h-4 mr-2" />{t("cooking.startCooking")}
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isSaved}
                className={isSaved ? "bg-success text-success-foreground" : ""}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{recipe.title}</h2>
              <p className="text-muted-foreground">{recipe.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><Clock className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">{t("recipe.prepTime")}</p><p className="font-semibold text-foreground">{recipe.prepTime} min</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><Flame className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">{t("recipe.cookTime")}</p><p className="font-semibold text-foreground">{recipe.cookTime} min</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><Users className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">{t("recipe.servings")}</p><p className="font-semibold text-foreground">{recipe.servings}</p></CardContent></Card>
              <Card className="shadow-card"><CardContent className="pt-4 text-center"><UtensilsCrossed className="w-5 h-5 mx-auto text-primary mb-1" /><p className="text-xs text-muted-foreground">{t("recipe.cuisine")}</p><p className="font-semibold text-foreground">{recipe.cuisine}</p></CardContent></Card>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {recipe.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="shadow-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Leaf className="w-4 h-4 text-primary" />{t("recipe.ingredients")}</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><span className="font-medium">{ing.amount}</span> {ing.item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 shadow-card">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-primary" />{t("recipe.instructions")}</CardTitle></CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {recipe.instructions.map((inst) => (
                      <li key={inst.step} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">{inst.step}</div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-foreground text-sm">{inst.instruction}</p>
                          {inst.tip && <p className="text-xs text-muted-foreground mt-1 italic">💡 {inst.tip}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 shadow-card">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Flame className="w-4 h-4 text-primary" />{t("recipe.nutritionPerServing")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-center">
                  <div><p className="text-xl font-bold text-primary">{recipe.nutritionInfo.calories}</p><p className="text-xs text-muted-foreground">{t("recipe.calories")}</p></div>
                  <div><p className="text-xl font-bold text-foreground">{recipe.nutritionInfo.protein}</p><p className="text-xs text-muted-foreground">{t("recipe.protein")}</p></div>
                  <div><p className="text-xl font-bold text-foreground">{recipe.nutritionInfo.carbs}</p><p className="text-xs text-muted-foreground">{t("recipe.carbs")}</p></div>
                  <div><p className="text-xl font-bold text-foreground">{recipe.nutritionInfo.fat}</p><p className="text-xs text-muted-foreground">{t("recipe.fat")}</p></div>
                  {recipe.nutritionInfo.fiber && <div><p className="text-xl font-bold text-foreground">{recipe.nutritionInfo.fiber}</p><p className="text-xs text-muted-foreground">{t("recipe.fiber")}</p></div>}
                  {recipe.nutritionInfo.sodium && <div><p className="text-xl font-bold text-foreground">{recipe.nutritionInfo.sodium}</p><p className="text-xs text-muted-foreground">{t("recipe.sodium")}</p></div>}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />{t("common.backToHome")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default LeftoverRecipe;
