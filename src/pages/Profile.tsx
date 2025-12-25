import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Flame,
  Loader2,
  Trash2,
  UtensilsCrossed,
  User,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SavedRecipe } from "@/types/recipe";
import { Header } from "@/components/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth", { state: { returnTo: "/profile" } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSavedRecipes();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchSavedRecipes = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_recipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform the data to match SavedRecipe type
      const recipes: SavedRecipe[] = (data || []).map((r) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        description: r.description || "",
        prepTime: r.prep_time || 0,
        cookTime: r.cook_time || 0,
        servings: r.servings || 2,
        cuisine: r.cuisine || "Various",
        ingredients: r.ingredients as unknown as SavedRecipe["ingredients"],
        instructions: r.instructions as unknown as SavedRecipe["instructions"],
        nutritionInfo: r.nutrition_info as unknown as SavedRecipe["nutritionInfo"],
        tags: r.tags || [],
        healthBenefits: [],
        created_at: r.created_at,
      }));
      
      setSavedRecipes(recipes);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      toast({
        title: "Error",
        description: "Failed to load saved recipes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;

      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      toast({
        title: "Recipe deleted",
        description: "The recipe has been removed from your collection.",
      });
    } catch (err) {
      console.error("Error deleting recipe:", err);
      toast({
        title: "Error",
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header showBackButton backTo="/" backLabel="Home" />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Card */}
        <Card className="mb-8 shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="gradient-primary text-primary-foreground text-2xl">
                  {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Display Name</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="max-w-xs"
                    />
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="gradient-primary text-primary-foreground"
                    >
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Recipes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Saved Recipes ({savedRecipes.length})
            </h2>
            <Link to="/preferences">
              <Button className="gradient-primary text-primary-foreground">
                Create New Recipe
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : savedRecipes.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  No saved recipes yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start creating personalized recipes and save your favorites!
                </p>
                <Link to="/preferences">
                  <Button className="gradient-primary text-primary-foreground">
                    Create Your First Recipe
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {savedRecipes.map((recipe) => (
                <Card key={recipe.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {recipe.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {recipe.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recipe.prepTime + recipe.cookTime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {recipe.servings} servings
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            {recipe.nutritionInfo?.calories || "N/A"} cal
                          </span>
                          {recipe.cuisine && (
                            <Badge variant="secondary">{recipe.cuisine}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/recipe/${recipe.id}`} state={{ recipe, fromProfile: true }}>
                          <Button variant="outline" size="sm">
                            View Recipe
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove "{recipe.title}" from your saved recipes.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteRecipe(recipe.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
