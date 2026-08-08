import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Home, Sparkles, Users, UtensilsCrossed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { RecipeJsonLd } from "@/components/RecipeJsonLd";

const SITE_URL = "https://nutricheff.lovable.app";

interface PublicRecipeRow {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  cuisine: string | null;
  tags: string[] | null;
  image_url: string | null;
  ingredients: unknown;
  instructions: unknown;
  nutrition_info: Record<string, unknown> | null;
}

const PublicRecipe = () => {
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<PublicRecipeRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    supabase
      .from("saved_recipes")
      .select(
        "id, title, description, prep_time, cook_time, servings, cuisine, tags, image_url, ingredients, instructions, nutrition_info"
      )
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("Failed to load public recipe:", error);
        setRecipe((data as unknown as PublicRecipeRow) ?? null);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen gradient-hero">
        <Helmet>
          <title>Recipe not found — NutriChef</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold mb-2">This recipe isn't public</h1>
          <p className="text-muted-foreground mb-6">
            It may have been unpublished or the link is incorrect.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/recipes">
              <Button variant="outline">Browse public recipes</Button>
            </Link>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Go home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients) ? (recipe.ingredients as any[]) : [];
  const instructions = Array.isArray(recipe.instructions) ? (recipe.instructions as any[]) : [];
  const canonical = `${SITE_URL}/r/${slug}`;
  const metaTitle = `${recipe.title} Recipe — NutriChef`;
  const metaDescription = (
    recipe.description ||
    `${recipe.title}: ingredients, step-by-step instructions and full nutrition breakdown.`
  ).slice(0, 155);

  return (
    <div className="min-h-screen gradient-hero">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="article" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
      </Helmet>
      <RecipeJsonLd
        title={recipe.title}
        description={recipe.description ?? undefined}
        image={recipe.image_url}
        cuisine={recipe.cuisine ?? undefined}
        prepTime={recipe.prep_time}
        cookTime={recipe.cook_time}
        servings={recipe.servings}
        ingredients={ingredients}
        instructions={instructions}
        calories={(recipe.nutrition_info?.calories as number) ?? null}
      />
      <Header
        actions={
          <Link to="/preferences">
            <Button className="gradient-primary text-primary-foreground">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Make your own</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        }
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {recipe.image_url && (
          <motion.img
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            src={recipe.image_url}
            alt={`${recipe.title} plated and ready to serve`}
            loading="lazy"
            className="w-full aspect-[16/9] object-cover rounded-3xl shadow-elevated mb-8"
          />
        )}

        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">Public recipe</Badge>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{recipe.description}</p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {recipe.prep_time ? (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Prep: {recipe.prep_time} min</span>
            </div>
          ) : null}
          {recipe.cook_time ? (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Cook: {recipe.cook_time} min</span>
            </div>
          ) : null}
          {recipe.servings ? (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm">{recipe.servings} servings</span>
            </div>
          ) : null}
          {recipe.cuisine ? (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="text-sm">{recipe.cuisine}</span>
            </div>
          ) : null}
        </div>

        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {recipe.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🥗</span> Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      {ing?.amount && <strong>{ing.amount}</strong>} {ing?.item || ing?.name || String(ing)}
                      {ing?.notes && (
                        <span className="text-muted-foreground text-sm"> ({ing.notes})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {recipe.nutrition_info && (
            <Card className="gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📊</span> Nutrition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(recipe.nutrition_info).map(([key, value]) => (
                    <div key={key} className="text-center p-3 bg-secondary/30 rounded-lg">
                      <p className="text-lg font-semibold text-foreground">{String(value)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mt-6 gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">👨‍🍳</span> Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions.map((inst, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                    {inst?.step || i + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-foreground">{inst?.instruction || String(inst)}</p>
                    {inst?.tip && (
                      <p className="text-sm text-muted-foreground mt-2 italic">💡 {inst.tip}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="mt-10 text-center space-y-4">
          <p className="text-muted-foreground">
            Want a version tuned to your allergies, budget and health goals?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/preferences">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-elevated">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate my recipe free
              </Button>
            </Link>
            <Link to="/recipes">
              <Button size="lg" variant="outline">Browse more recipes</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicRecipe;
