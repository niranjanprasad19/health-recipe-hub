// Landing page component
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Utensils, Sparkles, ShoppingCart, Heart, Leaf, Calendar, Search, ArrowRight, Clock, ChefHat, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  cuisine: string | null;
  is_favorite: boolean;
}

const Landing = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentRecipes, setRecentRecipes] = useState<SavedRecipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<SavedRecipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentRecipes();
      fetchFavoriteRecipes();
    }
  }, [isAuthenticated, user]);

  const fetchRecentRecipes = async () => {
    if (!user) return;
    setRecipesLoading(true);
    const { data, error } = await supabase
      .from("saved_recipes")
      .select("id, title, description, prep_time, cook_time, cuisine, is_favorite")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);

    if (!error && data) {
      setRecentRecipes(data);
    }
    setRecipesLoading(false);
  };

  const fetchFavoriteRecipes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_recipes")
      .select("id, title, description, prep_time, cook_time, cuisine, is_favorite")
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error && data) {
      setFavoriteRecipes(data);
    }
  };

  const toggleFavorite = async (recipeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("saved_recipes")
      .update({ is_favorite: !currentStatus })
      .eq("id", recipeId);

    if (!error) {
      // Update local state
      setRecentRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, is_favorite: !currentStatus } : r));
      setFavoriteRecipes(prev => {
        if (!currentStatus) {
          // Adding to favorites
          const recipe = recentRecipes.find(r => r.id === recipeId);
          if (recipe && !prev.find(r => r.id === recipeId)) {
            return [{ ...recipe, is_favorite: true }, ...prev].slice(0, 6);
          }
        } else {
          // Removing from favorites
          return prev.filter(r => r.id !== recipeId);
        }
        return prev;
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToGenerate(searchQuery);
  };

  const navigateToGenerate = (query: string) => {
    if (query.trim()) {
      navigate(`/quick-recipe?prompt=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/preferences');
    }
  };

  const trendingTags = ["High Protein", "Plant Based", "Quick Meals", "Low Carb", "Mediterranean"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <p className="text-sm font-medium text-primary tracking-wide uppercase mb-4">
            AI-Powered Recipe Generation
          </p>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
            Personalized recipes for{" "}
            <span className="text-primary">healthier living</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            Generate custom recipes tailored to your dietary preferences, 
            nutritional goals, and available ingredients.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-shadow focus-within:shadow-md focus-within:border-primary/50">
              <div className="flex items-center flex-1">
                <Search className="w-5 h-5 text-muted-foreground ml-4" />
                <Input
                  type="text"
                  placeholder="What do you want to cook?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 text-base py-6 px-3 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <Button 
                type="submit"
                className="mx-2 mb-2 sm:mb-0 sm:mr-2 px-6 rounded-lg"
              >
                Generate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          {/* Trending Tags */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {trendingTags.map((tag) => (
              <button
                key={tag}
                onClick={() => navigateToGenerate(tag)}
                className="px-3 py-1.5 rounded-full bg-secondary text-sm text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <Link to="/preferences">
              <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                <Utensils className="w-4 h-4 mr-2" />
                Set Preferences
              </Button>
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/meal-planning">
                  <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                    <Calendar className="w-4 h-4 mr-2" />
                    Meal Plan
                  </Button>
                </Link>
                <Link to="/shopping-list">
                  <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shopping List
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Favorites Section */}
        {isAuthenticated && favoriteRecipes.length > 0 && (
          <div className="mt-20 max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                Your Favorites
              </h2>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Recipes for Logged-in Users */}
        {isAuthenticated && recentRecipes.length > 0 && (
          <div className="mt-12 max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Recipes</h2>
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6 mt-28 max-w-4xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-5 h-5" />}
            title="Smart Recommendations"
            description="AI learns your preferences and suggests recipes you'll actually enjoy."
            href="/preferences"
          />
          <FeatureCard
            icon={<ShoppingCart className="w-5 h-5" />}
            title="Automated Shopping"
            description="Generate shopping lists automatically from your selected recipes."
            href={isAuthenticated ? "/shopping-list" : "/auth"}
          />
          <FeatureCard
            icon={<Heart className="w-5 h-5" />}
            title="Nutrition Focused"
            description="Track macros and nutritional information for every recipe."
            href={isAuthenticated ? "/meal-planning" : "/auth"}
          />
        </div>

        {/* How It Works */}
        <div className="mt-28 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-3 tracking-tight">
            How It Works
          </h2>
          <p className="text-center text-muted-foreground mb-10">
            Three simple steps to your perfect meal
          </p>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <StepCard
              number={1}
              title="Set Preferences"
              description="Share your dietary needs, allergies, and taste preferences"
              href="/preferences"
            />
            <StepCard
              number={2}
              title="Generate Recipes"
              description="Our AI creates personalized recipes matching your criteria"
              href="/preferences"
            />
            <StepCard
              number={3}
              title="Save and Plan"
              description="Save favorites and organize your weekly meal plan"
              href={isAuthenticated ? "/meal-planning" : "/auth"}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">NutriChef</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 NutriChef. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const FeatureCard = ({ icon, title, description, href }: FeatureCardProps) => (
  <Link to={href}>
    <Card className="border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer bg-card h-full">
      <CardContent className="pt-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  href: string;
}

const StepCard = ({ number, title, description, href }: StepCardProps) => (
  <Link to={href} className="text-center group">
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg mx-auto mb-4 group-hover:scale-110 transition-transform">
      {number}
    </div>
    <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </Link>
);

const RecipeCard = ({ 
  recipe, 
  onToggleFavorite 
}: { 
  recipe: SavedRecipe; 
  onToggleFavorite?: (id: string, currentStatus: boolean) => void;
}) => (
  <Card className="border-border hover:border-primary/30 hover:shadow-md transition-all bg-card h-full group">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-primary" />
          {recipe.cuisine && (
            <span className="text-xs text-muted-foreground">{recipe.cuisine}</span>
          )}
        </div>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(recipe.id, recipe.is_favorite);
            }}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <Star 
              className={`w-4 h-4 transition-colors ${
                recipe.is_favorite 
                  ? "text-yellow-500 fill-yellow-500" 
                  : "text-muted-foreground hover:text-yellow-500"
              }`} 
            />
          </button>
        )}
      </div>
      <Link to={`/search?recipe=${recipe.id}`}>
        <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{recipe.title}</h3>
      </Link>
      {recipe.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{recipe.description}</p>
      )}
      {(recipe.prep_time || recipe.cook_time) && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default Landing;
