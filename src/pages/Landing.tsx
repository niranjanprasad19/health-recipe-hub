import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Utensils, Sparkles, ShoppingCart, Heart, Leaf, Calendar, Search, ArrowRight, Clock, ChefHat, Star, Refrigerator, TrendingUp, PartyPopper, Zap, Users, BookOpen } from "lucide-react";
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

// Animated counter component
const AnimatedCounter = ({ target, suffix = "", duration = 2 }: { target: number; suffix?: string; duration?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    const step = end / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
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
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
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

  const wordReveal = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const wordChild = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const heroTitle = t('landing.heroTitle');
  const heroHighlight = t('landing.heroHighlight');

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />

      {/* Cinematic Hero */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Parallax background */}
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
          <img src={heroFoodImg} alt="Delicious food spread" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
        </motion.div>

        {/* Floating food elements */}
        <motion.div animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-20 right-10 text-5xl opacity-20 hidden lg:block">🥗</motion.div>
        <motion.div animate={{ y: [10, -15, 10], rotate: [0, -3, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-40 left-10 text-4xl opacity-20 hidden lg:block">🍛</motion.div>
        <motion.div animate={{ y: [-5, 12, -5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-40 left-20 text-3xl opacity-15 hidden lg:block">🌿</motion.div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 container mx-auto px-4 pt-8 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-6"
            >
              ✦ {t('landing.tagline')} ✦
            </motion.p>

            {/* Word-by-word title reveal */}
            <motion.h1
              variants={wordReveal}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]"
            >
              {heroTitle.split(" ").map((word, i) => (
                <motion.span key={i} variants={wordChild} className="inline-block mr-[0.3em]">
                  {word}
                </motion.span>
              ))}{" "}
              <motion.span variants={wordChild} className="text-gradient inline-block">
                {heroHighlight}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              {t('landing.heroDescription')}
            </motion.p>

            {/* Glassmorphism Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1, duration: 0.5, type: "spring" }}
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto mb-10"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center glass-card rounded-2xl overflow-hidden shadow-elevated focus-glow transition-all duration-300">
                <div className="flex items-center flex-1">
                  <Search className="w-5 h-5 text-muted-foreground ml-5" />
                  <Input
                    type="text"
                    placeholder={t('landing.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 text-base py-7 px-3 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
                  />
                </div>
                <Button type="submit" className="mx-2 mb-2 sm:mb-0 sm:mr-2 px-8 rounded-xl h-12 text-base font-semibold gradient-primary hover:opacity-90 transition-opacity animate-glow-pulse">
                  {t('common.generate')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.form>

            {/* Trending Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex flex-wrap gap-2 justify-center mb-12"
            >
              {trendingTags.map((tag, i) => (
                <motion.button
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.3 + i * 0.05 }}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigateToGenerate(tag)}
                  className="px-4 py-2 rounded-full glass-card text-sm text-foreground/80 hover:text-primary hover:glow-border transition-all duration-200"
                >
                  {tag}
                </motion.button>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex flex-wrap gap-3 justify-center"
            >
              <Link to="/preferences">
                <Button size="lg" variant="outline" className="rounded-xl glass-card border-border/50 hover:border-primary/50 hover:glow-border transition-all">
                  <Utensils className="w-4 h-4 mr-2" />{t('landing.setPreferences')}
                </Button>
              </Link>
              <Link to="/leftover-recipe">
                <Button size="lg" variant="outline" className="rounded-xl glass-card border-border/50 hover:border-primary/50 hover:glow-border transition-all">
                  <Refrigerator className="w-4 h-4 mr-2" />{t('landing.useLeftovers')}
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/meal-planning">
                    <Button size="lg" variant="outline" className="rounded-xl glass-card border-border/50 hover:border-primary/50 hover:glow-border transition-all">
                      <Calendar className="w-4 h-4 mr-2" />{t('landing.mealPlan')}
                    </Button>
                  </Link>
                  <Link to="/shopping-list">
                    <Button size="lg" variant="outline" className="rounded-xl glass-card border-border/50 hover:border-primary/50 hover:glow-border transition-all">
                      <ShoppingCart className="w-4 h-4 mr-2" />{t('landing.shoppingList')}
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: 10000, suffix: "+", label: t("landing.recipesGenerated") || "Recipes Generated" },
              { value: 50, suffix: "+", label: t("landing.cuisines") || "Global Cuisines" },
              { value: 500, suffix: "+", label: t("landing.ingredients") || "Ingredients" },
              { value: 15, suffix: "", label: t("landing.languages") || "Languages" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-1"
              >
                <p className="text-3xl sm:text-4xl font-bold text-gradient">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4">
        {/* Visual Food Gallery with Glassmorphism overlays */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="py-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                transition={{ delay: i * 0.12, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="relative group cursor-pointer rounded-2xl overflow-hidden aspect-square shadow-card"
                onClick={() => item.link.startsWith("/") ? navigate(item.link) : navigateToGenerate(item.link)}
              >
                <img src={item.img} alt={item.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 glass-dark">
                  <p className="text-primary-foreground font-semibold text-sm sm:text-base">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Recipe Inspiration Marquee */}
        <section className="py-8 overflow-hidden">
          <div className="relative">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...trendingTags, ...trendingTags].map((tag, i) => (
                <span key={i} className="mx-4 text-2xl sm:text-3xl font-bold text-muted-foreground/20 hover:text-primary/40 transition-colors cursor-default select-none">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

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
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="glass-card hover:glow-border transition-all cursor-pointer border-border/50" onClick={() => navigateToGenerate(`${f.suggestedDishes[0]} - ${f.name} recipe`)}>
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
                <Star className="w-5 h-5 text-warning fill-warning" />
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

        {/* Features Section - Glassmorphism Cards */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-4"
          >
            {t('landing.smartRecommendations')}
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">{t('landing.smartRecommendationsDesc')}</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={<Sparkles className="w-5 h-5" />} title={t('landing.smartRecommendations')} description={t('landing.smartRecommendationsDesc')} href="/preferences" delay={0} />
            <FeatureCard icon={<TrendingUp className="w-5 h-5" />} title={t('landing.nutritionDashboard')} description={t('landing.nutritionDashboardDesc')} href={isAuthenticated ? "/nutrition" : "/auth"} delay={0.1} />
            <FeatureCard icon={<Heart className="w-5 h-5" />} title={t('landing.nutritionFocused')} description={t('landing.nutritionFocusedDesc')} href={isAuthenticated ? "/meal-planning" : "/auth"} delay={0.2} />
          </div>
        </motion.section>

        {/* How It Works - with connecting line */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-20 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-3 tracking-tight">
            {t('landing.howItWorks')}
          </h2>
          <p className="text-center text-muted-foreground mb-14">{t('landing.howItWorksSubtitle')}</p>
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
            <div className="grid sm:grid-cols-3 gap-10">
              {[1, 2, 3].map((n, i) => (
                <StepCard key={n} number={n} title={t(`landing.step${n}Title`)} description={t(`landing.step${n}Desc`)} href={n === 3 && isAuthenticated ? "/meal-planning" : n === 3 ? "/auth" : "/preferences"} delay={i * 0.15} />
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(152_80%_60%/0.3),transparent_50%)]" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            {t('landing.ctaTitle') || "Ready to Cook Something Amazing?"}
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg max-w-xl mx-auto">
            {t('landing.ctaDescription') || "Join thousands of food lovers and start generating personalized recipes today."}
          </p>
          <Link to={isAuthenticated ? "/preferences" : "/auth"}>
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 rounded-xl px-10 py-6 text-lg font-semibold shadow-elevated">
              {isAuthenticated ? t('landing.setPreferences') : t('common.signUp')}
              <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.span>
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">NutriChef</span>
            </div>
            <p className="text-sm text-muted-foreground">{t('landing.footer')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, href, delay = 0 }: { icon: React.ReactNode; title: string; description: string; href: string; delay?: number }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -8, scale: 1.03 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="h-full"
      >
        <Card className="glass-card border-border/50 hover:shadow-fun transition-all duration-300 cursor-pointer h-full group overflow-hidden relative">
          {/* Gradient overlay on hover */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-fun-orange/5 to-fun-yellow/5 pointer-events-none"
          />
          <CardContent className="pt-8 pb-8 px-6 relative z-10">
            <motion.div
              animate={hovered ? { rotate: [0, -10, 10, 0], scale: 1.1 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-14 h-14 rounded-2xl gradient-fun flex items-center justify-center text-primary-foreground mb-5 shadow-fun"
            >
              {icon}
            </motion.div>
            <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-gradient-fun transition-all">{title}</h3>
            {/* Hover-reveal description with smooth expand */}
            <motion.p
              initial={{ opacity: 0.7 }}
              animate={{ opacity: hovered ? 1 : 0.7 }}
              className="text-muted-foreground text-sm leading-relaxed"
            >
              {description}
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: hovered ? "100%" : 0 }}
              transition={{ duration: 0.3 }}
              className="h-0.5 gradient-fun mt-4 rounded-full"
            />
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

const StepCard = ({ number, title, description, href, delay = 0 }: { number: number; title: string; description: string; href: string; delay?: number }) => (
  <Link to={href} className="text-center group">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <motion.div
        whileHover={{ scale: 1.15, rotate: 5 }}
        className="w-16 h-16 rounded-2xl gradient-fun text-primary-foreground flex items-center justify-center font-black text-2xl mx-auto mb-5 shadow-fun relative"
      >
        {number}
        <div className="absolute inset-0 rounded-2xl pulse-glow opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
      <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-fun-orange transition-colors">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  </Link>
);

const RecipeCard = ({ recipe, onToggleFavorite }: { recipe: SavedRecipe; onToggleFavorite?: (id: string, currentStatus: boolean) => void }) => (
  <motion.div
    whileHover={{ y: -6, scale: 1.03 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <Card className="glass-card border-border/50 hover:shadow-fun transition-all duration-300 h-full group overflow-hidden relative">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-fun-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <CardContent className="p-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <ChefHat className="w-4 h-4 text-fun-orange" />
            </motion.div>
            {recipe.cuisine && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{recipe.cuisine}</span>
            )}
          </div>
          {onToggleFavorite && (
            <motion.button
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(recipe.id, recipe.is_favorite); }}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <Star className={`w-4 h-4 transition-all duration-300 ${recipe.is_favorite ? "text-fun-orange fill-fun-orange drop-shadow-sm" : "text-muted-foreground hover:text-fun-orange"}`} />
            </motion.button>
          )}
        </div>
        <Link to={`/search?recipe=${recipe.id}`}>
          <h3 className="font-semibold text-foreground text-sm mb-1.5 line-clamp-2 hover:text-primary transition-colors cursor-pointer">{recipe.title}</h3>
        </Link>
        {recipe.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>}
        {(recipe.prep_time || recipe.cook_time) && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export default Landing;
