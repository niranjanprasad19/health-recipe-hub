import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Clock, 
  Users, 
  ChefHat,
  UtensilsCrossed,
  Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  cuisine: string | null;
  ingredients: any[];
  instructions: any[];
  nutrition_info: any | null;
  tags: string[] | null;
}

const SharedRecipe = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareToken) {
      fetchSharedRecipe();
    }
  }, [shareToken]);

  const fetchSharedRecipe = async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("saved_recipes")
      .select("*")
      .eq("share_token", shareToken)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching recipe:", fetchError);
      setError("Failed to load recipe");
    } else if (!data) {
      setError("Recipe not found or no longer shared");
    } else {
      setRecipe({
        ...data,
        ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
        instructions: Array.isArray(data.instructions) ? data.instructions : [],
      });
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || "Recipe not found"}</p>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">NutriChef</span>
          </Link>
          <Link to="/preferences">
            <Button className="gradient-primary text-primary-foreground">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Create Your Own
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Recipe Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">Shared Recipe</Badge>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {recipe.prep_time && (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Prep: {recipe.prep_time} min</span>
            </div>
          )}
          {recipe.cook_time && (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Cook: {recipe.cook_time} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm">{recipe.servings} servings</span>
            </div>
          )}
          {recipe.cuisine && (
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-card">
              <ChefHat className="w-4 h-4 text-primary" />
              <span className="text-sm">{recipe.cuisine}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">🥗</span>
                Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ingredients.map((ing: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      {ing.amount && <strong>{ing.amount}</strong>} {ing.item || ing.name || ing}
                      {ing.notes && <span className="text-muted-foreground text-sm"> ({ing.notes})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Nutrition */}
          {recipe.nutrition_info && (
            <Card className="gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Nutrition Info
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

        {/* Instructions */}
        <Card className="mt-6 gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">👨‍🍳</span>
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {instructions.map((inst: any, index: number) => (
                <li key={index} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                    {inst.step || index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-foreground">{inst.instruction || inst}</p>
                    {inst.tip && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        💡 Tip: {inst.tip}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Want to create personalized recipes for your dietary needs?
          </p>
          <Link to="/preferences">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-elevated">
              <UtensilsCrossed className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SharedRecipe;
