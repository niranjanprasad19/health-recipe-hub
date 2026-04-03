import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Clock, Flame, Loader2, Trash2, UtensilsCrossed, User, Users, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SavedRecipe } from "@/types/recipe";
import { Header } from "@/components/Header";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
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
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) { setProfile(data); setDisplayName(data.display_name || ""); }
    } catch (err) { console.error("Error fetching profile:", err); }
  };

  const fetchSavedRecipes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("saved_recipes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      const recipes: SavedRecipe[] = (data || []).map((r) => ({
        id: r.id, user_id: r.user_id, title: r.title, description: r.description || "",
        prepTime: r.prep_time || 0, cookTime: r.cook_time || 0, servings: r.servings || 2,
        cuisine: r.cuisine || "Various",
        ingredients: r.ingredients as unknown as SavedRecipe["ingredients"],
        instructions: r.instructions as unknown as SavedRecipe["instructions"],
        nutritionInfo: r.nutrition_info as unknown as SavedRecipe["nutritionInfo"],
        tags: r.tags || [], healthBenefits: [], created_at: r.created_at,
      }));
      setSavedRecipes(recipes);
    } catch (err) {
      console.error("Error fetching saved recipes:", err);
      toast({ title: t('common.error'), description: "Failed to load saved recipes", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: t('profile.profileUpdated'), description: t('profile.profileUpdatedDesc') });
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({ title: t('common.error'), description: "Failed to update profile", variant: "destructive" });
    } finally { setIsUpdating(false); }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const { error } = await supabase.from("saved_recipes").delete().eq("id", recipeId);
      if (error) throw error;
      setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
      toast({ title: t('profile.recipeDeleted'), description: t('profile.recipeDeletedDesc') });
    } catch (err) {
      console.error("Error deleting recipe:", err);
      toast({ title: t('common.error'), description: "Failed to delete recipe", variant: "destructive" });
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
      <Header showBackButton backTo="/" backLabel={t('nav.home')} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8 shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('profile.yourProfile')}
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
                  <label className="text-sm font-medium text-foreground">{t('profile.displayName')}</label>
                  <div className="flex gap-2 mt-1">
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('profile.enterName')} className="max-w-xs" />
                    <Button onClick={handleUpdateProfile} disabled={isUpdating} className="gradient-primary text-primary-foreground">
                      {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : t('common.save')}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">{t('auth.email')}</label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link to="/collections">
            <Card className="shadow-card hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="py-4 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{t("collections.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("collections.noCollectionsDesc")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/family-profiles">
            <Card className="shadow-card hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer">
              <CardContent className="py-4 flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">{t("family.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("family.subtitle")}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
              {t('profile.savedRecipes')} ({savedRecipes.length})
            </h2>
            <Link to="/preferences">
              <Button className="gradient-primary text-primary-foreground w-full sm:w-auto">
                {t('profile.createNewRecipe')}
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : savedRecipes.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <UtensilsCrossed className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{t('profile.noRecipesYet')}</h3>
                <p className="text-muted-foreground mb-4">{t('profile.noRecipesDesc')}</p>
                <Link to="/preferences"><Button className="gradient-primary text-primary-foreground">{t('profile.createFirstRecipe')}</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {savedRecipes.map((recipe) => (
                <Card key={recipe.id} className="shadow-card hover:shadow-elevated transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground line-clamp-2">{recipe.title}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4" />{recipe.prepTime + recipe.cookTime} min</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3 sm:w-4 sm:h-4" />{recipe.servings} {t('recipe.servings').toLowerCase()}</span>
                          <span className="flex items-center gap-1"><Flame className="w-3 h-3 sm:w-4 sm:h-4" />{recipe.nutritionInfo?.calories || "N/A"} cal</span>
                          {recipe.cuisine && <Badge variant="secondary" className="text-xs">{recipe.cuisine}</Badge>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t sm:border-t-0 sm:pt-0">
                        <Link to={`/recipe/${recipe.id}`} state={{ recipe, fromProfile: true }}>
                          <Button variant="outline" size="sm">{t('profile.viewRecipe')}</Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('profile.deleteRecipe')}</AlertDialogTitle>
                              <AlertDialogDescription>{t('profile.deleteRecipeDesc', { title: recipe.title })}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t('common.delete')}</AlertDialogAction>
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
