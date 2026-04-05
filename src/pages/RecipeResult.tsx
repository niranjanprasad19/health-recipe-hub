import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Bookmark, BookmarkCheck, Clock, Flame, Leaf, Loader2, RefreshCw,
  Users, UtensilsCrossed, Sparkles, Check, AlertCircle, Share2, CheckCircle, FolderPlus, ImageIcon,
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

// Branded skeleton loading screen
const RecipeSkeleton = () => (
  <div className="min-h-screen gradient-hero blob-bg">
    <Header />
    <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
      <div className="text-center mb-8 space-y-4">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 mx-auto rounded-full gradient-fun flex items-center justify-center shadow-fun"
        >
          <Sparkles className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        <div className="skeleton-brand h-8 w-64 mx-auto" />
        <div className="skeleton-brand h-5 w-96 mx-auto" />
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-muted-foreground font-medium"
        >
          ✨ Crafting your perfect recipe...
        </motion.p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="shadow-card"><CardContent className="pt-4 text-center space-y-2">
              <div className="skeleton-brand w-8 h-8 mx-auto rounded-full" />
              <div className="skeleton-brand h-3 w-16 mx-auto" />
              <div className="skeleton-brand h-5 w-12 mx-auto" />
            </CardContent></Card>
          </motion.div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="shadow-card"><CardContent className="pt-6 space-y-3">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton-brand h-4 w-full" />)}
        </CardContent></Card>
        <Card className="md:col-span-2 shadow-card"><CardContent className="pt-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="skeleton-brand w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-brand h-4 w-full" />
                <div className="skeleton-brand h-3 w-3/4" />
              </div>
            </div>
          ))}
        </CardContent></Card>
      </div>
    </main>
  </div>
);

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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookingMode, setCookingMode] = useState(false);
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const formData = location.state?.formData;

  useEffect(() => {
    if (!recipe && formData) { generateRecipe(); }
    else if (!recipe && !formData) { navigate("/preferences"); }
  }, []);

  // Generate AI hero image when recipe is loaded
  useEffect(() => {
    if (recipe && !heroImage && !imageLoading) {
      generateHeroImage(recipe.title, recipe.cuisine);
    }
  }, [recipe]);

  const generateHeroImage = async (title: string, cuisine: string) => {
    setImageLoading(true);
    try {
      const response = await supabase.functions.invoke("generate-recipe-image", {
        body: { title, cuisine },
      });
      if (response.data?.imageUrl) {
        setHeroImage(response.data.imageUrl);
      }
    } catch (err) {
      console.error("Failed to generate hero image:", err);
    } finally {
      setImageLoading(false);
    }
  };

  const generateRecipe = async () => {
    if (!formData) return;
    setIsLoading(true); setError(null); setHeroImage(null);
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
      <Button variant="outline" size="icon" onClick={generateRecipe} disabled={isLoading} className="ripple-container"><RefreshCw className="w-4 h-4" /></Button>
      <Button size="icon" onClick={handleSaveRecipe} disabled={isSaving || isSaved}
        className={`ripple-container ${isSaved ? "bg-success text-success-foreground" : "gradient-primary text-primary-foreground"}`}>
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      </Button>
      {isSaved && savedRecipeId && <AddToCollectionDialog recipeId={savedRecipeId} />}
      <Button variant="outline" size="icon" onClick={handleShare} className="ripple-container">
        {copied ? <CheckCircle className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
      </Button>
    </div>
  );

  if (isLoading) return <RecipeSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center blob-bg">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md mx-4 shadow-fun glass-card">
            <CardContent className="pt-6 text-center space-y-4">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <AlertCircle className="w-12 h-12 mx-auto text-fun-orange" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">{t('recipe.somethingWentWrong')}</h2>
              <p className="text-muted-foreground">{error}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate("/preferences")} className="ripple-container">
                  <ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}
                </Button>
                <Button onClick={generateRecipe} className="gradient-fun text-primary-foreground ripple-container shadow-fun">
                  <RefreshCw className="w-4 h-4 mr-2" />{t('common.tryAgain')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!recipe) return null;
  if (cookingMode) return <CookingMode recipe={recipe} onClose={() => setCookingMode(false)} />;

  return (
    <div className="min-h-screen gradient-hero blob-bg">
      <Header actions={recipeActions} />
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">

        {/* AI-Generated Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-8 shadow-fun"
        >
          {heroImage ? (
            <div className="relative aspect-[16/7]">
              <img src={heroImage} alt={recipe.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-foreground mb-2 drop-shadow-lg"
                >
                  {recipe.title}
                </motion.h1>
                <p className="text-sm sm:text-base text-primary-foreground/80 max-w-2xl">{recipe.description}</p>
              </div>
            </div>
          ) : imageLoading ? (
            <div className="aspect-[16/7] skeleton-brand flex items-center justify-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                <ImageIcon className="w-10 h-10 text-muted-foreground/40" />
              </motion.div>
            </div>
          ) : (
            <div className="gradient-fun p-8 sm:p-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-foreground mb-2">{recipe.title}</h1>
              <p className="text-sm sm:text-base text-primary-foreground/80 max-w-2xl">{recipe.description}</p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats Cards with spring animation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Clock, label: t('recipe.prepTime'), value: `${recipe.prepTime} min`, color: "text-fun-teal" },
            { icon: Flame, label: t('recipe.cookTime'), value: `${recipe.cookTime} min`, color: "text-fun-orange" },
            { icon: Users, label: t('recipe.servings'), value: `${recipe.servings}`, color: "text-fun-pink" },
            { icon: UtensilsCrossed, label: t('recipe.cuisine'), value: recipe.cuisine, color: "text-primary" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ y: -4, scale: 1.05 }}
            >
              <Card className="shadow-card glass-card hover:shadow-fun transition-all">
                <CardContent className="pt-4 pb-4 text-center">
                  <motion.div whileHover={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 0.4 }}>
                    <stat.icon className={`w-6 h-6 mx-auto ${stat.color} mb-2`} />
                  </motion.div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="font-bold text-foreground">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {recipe.tags.map((tag, i) => (
            <motion.div key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
              <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">{tag}</Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Ingredients & Instructions */}
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-card glass-card">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Leaf className="w-5 h-5 text-primary" />{t('recipe.ingredients')}</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-2 group/item"
                    >
                      <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                        <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      </motion.div>
                      <div><span className="font-semibold text-foreground">{ingredient.amount}</span>{" "}<span className="text-foreground">{ingredient.item}</span>{ingredient.notes && <span className="text-muted-foreground text-sm"> ({ingredient.notes})</span>}</div>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2">
            <Card className="shadow-card glass-card">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-fun-orange" />{t('recipe.instructions')}</CardTitle></CardHeader>
              <CardContent>
                <ol className="space-y-5">
                  {recipe.instructions.map((instruction, index) => (
                    <motion.li
                      key={instruction.step}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.08, type: "spring" }}
                      className="flex gap-4 group/step"
                    >
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        className="w-9 h-9 rounded-xl gradient-fun flex items-center justify-center text-primary-foreground font-black flex-shrink-0 shadow-soft text-sm"
                      >
                        {instruction.step}
                      </motion.div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground leading-relaxed">{instruction.instruction}</p>
                        {instruction.tip && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-fun-orange mt-1.5 italic font-medium"
                          >
                            💡 {instruction.tip}
                          </motion.p>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Nutrition */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="mt-8 shadow-card glass-card overflow-hidden">
            <div className="h-1 gradient-fun" />
            <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Flame className="w-5 h-5 text-fun-orange" />{t('recipe.nutritionPerServing')}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
                {[
                  { value: recipe.nutritionInfo.calories, label: t('recipe.calories'), highlight: true },
                  { value: recipe.nutritionInfo.protein, label: t('recipe.protein') },
                  { value: recipe.nutritionInfo.carbs, label: t('recipe.carbs') },
                  { value: recipe.nutritionInfo.fat, label: t('recipe.fat') },
                  ...(recipe.nutritionInfo.fiber ? [{ value: recipe.nutritionInfo.fiber, label: t('recipe.fiber') }] : []),
                  ...(recipe.nutritionInfo.sodium ? [{ value: recipe.nutritionInfo.sodium, label: t('recipe.sodium') }] : []),
                ].map((n, i) => (
                  <motion.div
                    key={n.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
                  >
                    <p className={`text-2xl font-black ${n.highlight ? "text-gradient-fun" : "text-foreground"}`}>{n.value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{n.label}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health Benefits */}
        {recipe.healthBenefits && recipe.healthBenefits.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="mt-8 shadow-card glass-card">
              <CardHeader><CardTitle className="text-xl flex items-center gap-2"><Sparkles className="w-5 h-5 text-fun-yellow" />{t('recipe.healthBenefits')}</CardTitle></CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-3">
                  {recipe.healthBenefits.map((benefit, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-success" /><span className="text-foreground">{benefit}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <IngredientSubstitutions ingredients={recipe.ingredients} />
        {isSaved && savedRecipeId && <RecipeRating recipeId={savedRecipeId} />}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <Button size="lg" onClick={() => setCookingMode(true)} className="gradient-fun text-primary-foreground ripple-container shadow-fun font-bold rounded-xl">
            <Sparkles className="w-4 h-4 mr-2" />{t('cooking.startCooking')}
          </Button>
          <Link to="/preferences"><Button variant="outline" size="lg" className="ripple-container rounded-xl"><ArrowLeft className="w-4 h-4 mr-2" />{t('common.back')}</Button></Link>
          {isAuthenticated && (
            <Link to="/profile"><Button variant="secondary" size="lg" className="ripple-container rounded-xl font-bold">{t('profile.savedRecipes')}</Button></Link>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default RecipeResult;
