import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Clock,
  Users,
  ChefHat,
  ExternalLink
} from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  cuisine: string | null;
  tags: string[] | null;
  share_token: string | null;
}

const RecipeSearch = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      // Load all user recipes initially
      fetchRecipes("");
    }
  }, [user]);

  const fetchRecipes = async (query: string) => {
    if (!user) return;
    setIsLoading(true);

    let queryBuilder = supabase
      .from("saved_recipes")
      .select("id, title, description, prep_time, cook_time, servings, cuisine, tags, share_token")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (query.trim()) {
      // Search in title, description, cuisine, and tags
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,description.ilike.%${query}%,cuisine.ilike.%${query}%`
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error("Error searching recipes:", error);
    } else {
      // Additional client-side filtering for tags (since array search is tricky)
      let filteredData = data || [];
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        filteredData = filteredData.filter(recipe => 
          recipe.title?.toLowerCase().includes(lowerQuery) ||
          recipe.description?.toLowerCase().includes(lowerQuery) ||
          recipe.cuisine?.toLowerCase().includes(lowerQuery) ||
          recipe.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }
      setRecipes(filteredData);
    }

    setHasSearched(true);
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes(searchQuery);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header showBackButton backTo="/" backLabel={t('common.backToHome')} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Search className="w-8 h-8 text-primary" />
            {t('recipeSearch.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('recipeSearch.subtitle')}
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2 max-w-xl mx-auto">
            <Input
              placeholder={t('recipeSearch.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-lg"
            />
            <Button type="submit" className="gradient-primary text-primary-foreground">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {hasSearched && searchQuery 
                ? t('recipeSearch.noResults') 
                : t('recipeSearch.noRecipes')}
            </p>
            <Link to="/preferences">
              <Button className="gradient-primary text-primary-foreground">
                {t('recipeSearch.generateFirst')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {recipes.map((recipe) => (
              <Card 
                key={recipe.id} 
                className="gradient-card shadow-card hover:shadow-elevated transition-shadow cursor-pointer"
                onClick={() => navigate(`/recipe/${recipe.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                        {recipe.title}
                      </h3>
                      {recipe.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {recipe.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {recipe.prep_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recipe.prep_time + (recipe.cook_time || 0)} min
                          </span>
                        )}
                        {recipe.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {recipe.servings}
                          </span>
                        )}
                        {recipe.cuisine && (
                          <span className="flex items-center gap-1">
                            <ChefHat className="w-3 h-3" />
                            {recipe.cuisine}
                          </span>
                        )}
                      </div>
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {recipe.tags.slice(0, 4).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {recipe.tags.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{recipe.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipeSearch;
