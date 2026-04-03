import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Clock, Flame, Leaf, Loader2, RefreshCw,
  Users, UtensilsCrossed, Sparkles, Check, AlertCircle, Share2, CheckCircle, FolderPlus,
} from "lucide-react";
import { Recipe } from "@/types/recipe";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { CookingMode } from "@/components/CookingMode";
import { RecipeRating } from "@/components/RecipeRating";
import { IngredientSubstitutions } from "@/components/IngredientSubstitutions";
import { AddToCollectionDialog } from "@/components/AddToCollectionDialog";

const formatRecipeText = (recipe: Recipe): string => {
  const ingredients = recipe.ingredients.map(i => `• ${i.amount} ${i.item}${i.notes ? ` (${i.notes})` : ''}`).join('\n');
  const steps = recipe.instructions.map(s => `${s.step}. ${s.instruction}${s.tip ? ` (Tip: ${s.tip})` : ''}`).join('\n');
  return `${recipe.title}\n\n${recipe.description}\n\n🥗 Ingredients:\n${ingredients}\n\n👨‍🍳 Instructions:\n${steps}\n\n📊 Nutrition: ${recipe.nutritionInfo.calories} cal | ${recipe.nutritionInfo.protein} protein | ${recipe.nutritionInfo.carbs} carbs | ${recipe.nutritionInfo.fat} fat`;
};

const RecipeResult = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [recipe, setRecipe] = useState<Recipe | null>(location.state?.recipe || null);
  const [isLoading, setIsLoading] = useState(!location.state?.recipe);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookingMode, setCookingMode] = useState(false);

  const formData = location.state?.formData;

  useEffect(() => {
    if (!recipe && formData) { generateRecipe(); }
    else if (!recipe && !formData) { navigate("/preferences"); }
  }, []);

  const generateRecipe = async () => {
    if (!formData) return;
    setIsLoading(true); setError(null);
    try {
      const currentLang = i18n.language || "en";
      const response = await supabase.functions.invoke("generate-recipe", { body: { formData, language: currentLang } });
      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);
      setRecipe(response.data.recipe);
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError(err instanceof Error ? err.message : "Failed to generate recipe");
      toast({ title: t('common.error'), description: err instanceof Error ? err.message : "Failed to generate recipe", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleSaveRecipe = async () => {
    if (!isAuthenticated) {
      toast({ title: t('recipe.signInRequired'), description: t('recipe.signInToSave') });
      navigate("/auth", { state: { returnTo: location.pathname } });
      return;
    }
    if (!recipe || !user) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from("saved_recipes").insert([{
        user_id: user.id, title: recipe.title, description: recipe.description,
        ingredients: JSON.parse(JSON.stringify(recipe.ingredients)),
        instructions: JSON.parse(JSON.stringify(recipe.instructions)),
        nutrition_info: JSON.parse(JSON.stringify(recipe.nutritionInfo)),
        prep_time: recipe.prepTime, cook_time: recipe.cookTime, servings: recipe.servings,
        cuisine: recipe.cuisine, tags: recipe.tags, share_token: null,
      }]).select().single();
      if (error) throw error;
      setIsSaved(true); setSavedRecipeId(data.id);
      toast({ title: t('recipe.recipeSaved'), description: t('recipe.findInProfile') });
    } catch (err) {
      console.error("Error saving recipe:", err);
      toast({ title: t('recipe.failedToSave'), description: t('recipe.pleaseTryAgain'), variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleShare = async () => {
    if (!recipe) return;
    const recipeText = formatRecipeText(recipe);
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text: recipeText });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(recipeText);
          setCopied(true);
          toast({ title: t('recipe.linkCopied'), description: t('recipe.recipeCopied') });
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } else {
      await navigator.clipboard.writeText(recipeText);
      setCopied(true);
      toast({ title: t('recipe.linkCopied'), description: t('recipe.recipeCopied') });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const recipeActions = (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" onClick={generateRecipe} disabled={isLoading}><RefreshCw className="w-4 h-4" /></Button>
      <Button size="icon" onClick={handleSaveRecipe} disabled={isSaving || isSaved}
        className={isSaved ? "bg-success text-success-foreground" : "gradient-primary text-primary-foreground"}>
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </Button>
      <Button variant="outline" size="icon" onClick={handleShare}>
        {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-elevated animate-pulse">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-foreground">{t('recipe.creatingRecipe')}</h2>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="max-w-md mx-4 shadow-elevated">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <h2 className="font-heading text-xl font-bold text-foreground">{t('recipe.somethingWentWrong')}</h2>
            <p className="text-muted-foreground">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate("/preferences")}>
                <ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}
              </Button>
              <Button onClick={generateRecipe} className="gradient-primary text-primary-foreground">
                <RefreshCw className="w-4 h-4 mr-2" />{t('common.tryAgain')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recipe) return null;

  if (cookingMode) {
    return <CookingMode recipe={recipe} onClose={() => setCookingMode(false)} />;
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header actions={recipeActions} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">{recipe.title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">{recipe.description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-card"><CardContent className="pt-4 text-center"><Clock className="w-6 h-6 mx-auto text-primary mb-2" /><p className="text-sm text-muted-foreground">{t('recipe.prepTime')}</p><p className="font-semibold text-foreground">{recipe.prepTime} min</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="pt-4 text-center"><Flame className="w-6 h-6 mx-auto text-primary mb-2" /><p className="text-sm text-muted-foreground">{t('recipe.cookTime')}</p><p className="font-semibold text-foreground">{recipe.cookTime} min</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="pt-4 text-center"><Users className="w-6 h-6 mx-auto text-primary mb-2" /><p className="text-sm text-muted-foreground">{t('recipe.servings')}</p><p className="font-semibold text-foreground">{recipe.servings}</p></CardContent></Card>
          <Card className="shadow-card"><CardContent className="pt-4 text-center"><UtensilsCrossed className="w-6 h-6 mx-auto text-primary mb-2" /><p className="text-sm text-muted-foreground">{t('recipe.cuisine')}</p><p className="font-semibold text-foreground">{recipe.cuisine}</p></CardContent></Card>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {recipe.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-sm">{tag}</Badge>))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-card">
            <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Leaf className="w-5 h-5 text-primary" />{t('recipe.ingredients')}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div><span className="font-medium text-foreground">{ingredient.amount}</span>{" "}<span className="text-foreground">{ingredient.item}</span>{ingredient.notes && <span className="text-muted-foreground text-sm"> ({ingredient.notes})</span>}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="md:col-span-2 shadow-card">
            <CardHeader><CardTitle className="text-xl flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-primary" />{t('recipe.instructions')}</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction) => (
                  <li key={instruction.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">{instruction.step}</div>
                    <div className="flex-1 pt-1">
                      <p className="text-foreground">{instruction.instruction}</p>
                      {instruction.tip && <p className="text-sm text-muted-foreground mt-1 italic">💡 {instruction.tip}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-card">
          <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Flame className="w-5 h-5 text-primary" />{t('recipe.nutritionPerServing')}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              <div><p className="text-2xl font-bold text-primary">{recipe.nutritionInfo.calories}</p><p className="text-sm text-muted-foreground">{t('recipe.calories')}</p></div>
              <div><p className="text-2xl font-bold text-foreground">{recipe.nutritionInfo.protein}</p><p className="text-sm text-muted-foreground">{t('recipe.protein')}</p></div>
              <div><p className="text-2xl font-bold text-foreground">{recipe.nutritionInfo.carbs}</p><p className="text-sm text-muted-foreground">{t('recipe.carbs')}</p></div>
              <div><p className="text-2xl font-bold text-foreground">{recipe.nutritionInfo.fat}</p><p className="text-sm text-muted-foreground">{t('recipe.fat')}</p></div>
              {recipe.nutritionInfo.fiber && <div><p className="text-2xl font-bold text-foreground">{recipe.nutritionInfo.fiber}</p><p className="text-sm text-muted-foreground">{t('recipe.fiber')}</p></div>}
              {recipe.nutritionInfo.sodium && <div><p className="text-2xl font-bold text-foreground">{recipe.nutritionInfo.sodium}</p><p className="text-sm text-muted-foreground">{t('recipe.sodium')}</p></div>}
            </div>
          </CardContent>
        </Card>

        {recipe.healthBenefits && recipe.healthBenefits.length > 0 && (
          <Card className="mt-8 shadow-card">
            <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />{t('recipe.healthBenefits')}</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3">
                {recipe.healthBenefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2"><Check className="w-4 h-4 text-success" /><span className="text-foreground">{benefit}</span></li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4 mt-12">
          <Button variant="outline" size="lg" onClick={() => setCookingMode(true)}>
            <Sparkles className="w-4 h-4 mr-2" />{t('cooking.startCooking')}
          </Button>
          <Link to="/preferences"><Button variant="outline" size="lg"><ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}</Button></Link>
          {isAuthenticated && (
            <Link to="/profile"><Button variant="secondary" size="lg">{t('profile.savedRecipes')}</Button></Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default RecipeResult;
