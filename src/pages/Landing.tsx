import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Utensils, Sparkles, ShoppingCart, Heart, Leaf, Calendar, Search, ArrowRight, Clock, ChefHat, Star, Refrigerator, TrendingUp, PartyPopper } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUpcomingFestivals } from "@/data/festivals";
import heroFoodImg from "@/assets/hero-food.jpg";
import saladImg from "@/assets/food-salad.jpg";
import ramenImg from "@/assets/food-ramen.jpg";
import mealPrepImg from "@/assets/food-mealprep.jpg";
import festivalImg from "@/assets/food-festival.jpg";

interface SavedRecipe {
  id: string;
  title: string;
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  cuisine: string | null;
  is_favorite: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Landing = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentRecipes, setRecentRecipes] = useState<SavedRecipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<SavedRecipe[]>([]);
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const upcomingFestivals = getUpcomingFestivals(3);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentRecipes();
      fetchFavoriteRecipes();
    }
  }, [isAuthenticated, user]);

  const fetchRecentRecipes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_recipes")
      .select("id, title, description, prep_time, cook_time, cuisine, is_favorite")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(4);
    if (data) setRecentRecipes(data);
  };

  const fetchFavoriteRecipes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_recipes")
      .select("id, title, description, prep_time, cook_time, cuisine, is_favorite")
      .eq("user_id", user.id)
      .eq("is_favorite", true)
      .order("created_at", { ascending: false })
      .limit(6);
    if (data) setFavoriteRecipes(data);
  };

  const toggleFavorite = async (recipeId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("saved_recipes")
      .update({ is_favorite: !currentStatus })
      .eq("id", recipeId);
    if (!error) {
      setRecentRecipes(prev => prev.map(r => r.id === recipeId ? { ...r, is_favorite: !currentStatus } : r));
      setFavoriteRecipes(prev => {
        if (!currentStatus) {
          const recipe = recentRecipes.find(r => r.id === recipeId);
          if (recipe && !prev.find(r => r.id === recipeId)) return [{ ...recipe, is_favorite: true }, ...prev].slice(0, 6);
        } else {
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
    if (query.trim()) navigate(`/quick-recipe?prompt=${encodeURIComponent(query.trim())}`);
    else navigate('/preferences');
  };

  const trendingTags = ["High Protein", "Plant Based", "Quick Meals", "Low Carb", "Mediterranean", "Paneer Recipes", "South Indian Breakfast", "Biryani", "Leftover Recipe"];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <img src={heroFoodImg} alt="Delicious food spread" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 container mx-auto px-4 pt-12 pb-32 sm:pt-16 sm:pb-40">
          <div className="text-center max-w-3xl mx-auto">
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={0} className="text-sm font-medium text-primary tracking-wide uppercase mb-4">
              {t('landing.tagline')}
            </motion.p>
            <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-6 tracking-tight leading-tight">
              {t('landing.heroTitle')}{" "}
              <span className="text-primary">{t('landing.heroHighlight')}</span>
            </motion.h1>
            <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              {t('landing.heroDescription')}
            </motion.p>

            {/* Search Bar */}
            <motion.form variants={fadeUp} initial="hidden" animate="visible" custom={3} onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-shadow focus-within:shadow-md focus-within:border-primary/50">
                <div className="flex items-center flex-1">
                  <Search className="w-5 h-5 text-muted-foreground ml-4" />
                  <Input type="text" placeholder={t('landing.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 border-0 text-base py-6 px-3 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50" />
                </div>
                <Button type="submit" className="mx-2 mb-2 sm:mb-0 sm:mr-2 px-6 rounded-lg">
                  {t('common.generate')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.form>

            {/* Trending Tags */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="flex flex-wrap gap-2 justify-center mb-12">
              {trendingTags.map((tag) => (
                <button key={tag} onClick={() => navigateToGenerate(tag)} className="px-3 py-1.5 rounded-full bg-secondary text-sm text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                  {tag}
                </button>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="flex flex-wrap gap-2 sm:gap-3 justify-center">
              <Link to="/preferences">
                <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                  <Utensils className="w-4 h-4 mr-2" />{t('landing.setPreferences')}
                </Button>
              </Link>
              <Link to="/leftover-recipe">
                <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                  <Refrigerator className="w-4 h-4 mr-2" />{t('landing.useLeftovers')}
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/meal-planning">
                    <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                      <Calendar className="w-4 h-4 mr-2" />{t('landing.mealPlan')}
                    </Button>
                  </Link>
                  <Link to="/shopping-list">
                    <Button size="default" variant="outline" className="rounded-lg text-sm sm:text-base">
                      <ShoppingCart className="w-4 h-4 mr-2" />{t('landing.shoppingList')}
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <main className="container mx-auto px-4">
        {/* Visual Food Gallery */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="py-16 -mt-20"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { img: saladImg, label: t("landing.freshSalads"), link: "Fresh Salad Recipe" },
              { img: ramenImg, label: t("landing.warmBowls"), link: "Ramen Bowl Recipe" },
              { img: festivalImg, label: t("landing.festivalSpecials"), link: "/festival-recipes" },
              { img: mealPrepImg, label: t("landing.mealPrep"), link: "Meal Prep Ideas" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="relative group cursor-pointer rounded-xl overflow-hidden aspect-square"
                onClick={() => item.link.startsWith("/") ? navigate(item.link) : navigateToGenerate(item.link)}
              >
                <img src={item.img} alt={item.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-semibold text-sm sm:text-base">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Upcoming Festivals Banner */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <PartyPopper className="w-5 h-5 text-primary" />
              {t("landing.upcomingFestivals")}
            </h2>
            <Link to="/festival-recipes">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                {t("common.viewAll")}<ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {upcomingFestivals.map((f, i) => (
              <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer" onClick={() => navigateToGenerate(`${f.suggestedDishes[0]} - ${f.name} recipe`)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <span className="text-3xl">{f.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{f.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{f.suggestedDishes.slice(0, 2).join(", ")}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Favorites Section */}
        {isAuthenticated && favoriteRecipes.length > 0 && (
          <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {t('landing.yourFavorites')}
              </h2>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  {t('common.viewAll')}<ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Recent Recipes */}
        {isAuthenticated && recentRecipes.length > 0 && (
          <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">{t('landing.recentRecipes')}</h2>
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  {t('common.viewAll')}<ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Features Section with Images */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-16"
        >
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <FeatureCard icon={<Sparkles className="w-5 h-5" />} title={t('landing.smartRecommendations')} description={t('landing.smartRecommendationsDesc')} href="/preferences" />
            <FeatureCard icon={<TrendingUp className="w-5 h-5" />} title={t('landing.nutritionDashboard')} description={t('landing.nutritionDashboardDesc')} href={isAuthenticated ? "/nutrition" : "/auth"} />
            <FeatureCard icon={<Heart className="w-5 h-5" />} title={t('landing.nutritionFocused')} description={t('landing.nutritionFocusedDesc')} href={isAuthenticated ? "/meal-planning" : "/auth"} />
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-3 tracking-tight">
            {t('landing.howItWorks')}
          </h2>
          <p className="text-center text-muted-foreground mb-10">{t('landing.howItWorksSubtitle')}</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <StepCard key={n} number={n} title={t(`landing.step${n}Title`)} description={t(`landing.step${n}Desc`)} href={n === 3 && isAuthenticated ? "/meal-planning" : n === 3 ? "/auth" : "/preferences"} />
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">NutriChef</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('landing.footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) => (
  <Link to={href}>
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card className="border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer bg-card h-full">
        <CardContent className="pt-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">{icon}</div>
          <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  </Link>
);

const StepCard = ({ number, title, description, href }: { number: number; title: string; description: string; href: string }) => (
  <Link to={href} className="text-center group">
    <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg mx-auto mb-4">
      {number}
    </motion.div>
    <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </Link>
);

const RecipeCard = ({ recipe, onToggleFavorite }: { recipe: SavedRecipe; onToggleFavorite?: (id: string, currentStatus: boolean) => void }) => (
  <Card className="border-border hover:border-primary/30 hover:shadow-md transition-all bg-card h-full group">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ChefHat className="w-4 h-4 text-primary" />
          {recipe.cuisine && <span className="text-xs text-muted-foreground">{recipe.cuisine}</span>}
        </div>
        {onToggleFavorite && (
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(recipe.id, recipe.is_favorite); }} className="p-1 rounded-full hover:bg-secondary transition-colors">
            <Star className={`w-4 h-4 transition-colors ${recipe.is_favorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground hover:text-yellow-500"}`} />
          </button>
        )}
      </div>
      <Link to={`/search?recipe=${recipe.id}`}>
        <h3 className="font-medium text-foreground text-sm mb-1 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{recipe.title}</h3>
      </Link>
      {recipe.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{recipe.description}</p>}
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
