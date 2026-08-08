import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Search, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

const SITE_URL = "https://nutricheff.lovable.app";

interface GalleryRecipe {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  cuisine: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  tags: string[] | null;
}

const RecipeGallery = () => {
  const [recipes, setRecipes] = useState<GalleryRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("saved_recipes")
      .select("id, slug, title, description, image_url, cuisine, prep_time, cook_time, servings, tags")
      .eq("is_public", true)
      .not("slug", "is", null)
      .order("published_at", { ascending: false })
      .limit(120)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error("Failed to load public recipes:", error);
        setRecipes((data as unknown as GalleryRecipe[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? recipes.filter((r) =>
        [r.title, r.description, r.cuisine, ...(r.tags ?? [])]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      )
    : recipes;

  const title = "Community Recipes — NutriChef";
  const description =
    "Browse healthy recipes published by the NutriChef community, with full ingredients, steps and nutrition for every dish.";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}/recipes`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${SITE_URL}/recipes`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description,
            url: `${SITE_URL}/recipes`,
          })}
        </script>
      </Helmet>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-black text-foreground mb-3">
            Community Recipes
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real recipes published by NutriChef cooks — ingredients, steps and nutrition included.
          </p>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, cuisines or tags"
            className="pl-10"
            aria-label="Search community recipes"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-brand h-64 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="glass-card max-w-lg mx-auto">
            <CardContent className="py-14 text-center space-y-4">
              <Sparkles className="w-8 h-8 mx-auto text-fun-orange" />
              <p className="text-muted-foreground">
                {recipes.length === 0
                  ? "No public recipes yet — publish one of yours to be the first."
                  : "No recipes match that search."}
              </p>
              <Link to="/preferences">
                <Button className="gradient-primary text-primary-foreground">Create a recipe</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Link to={`/r/${r.slug}`} className="block h-full">
                  <Card className="glass-card h-full overflow-hidden hover:shadow-elevated transition-shadow">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={`${r.title} recipe`}
                        loading="lazy"
                        className="w-full aspect-[16/10] object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-[16/10] gradient-fun flex items-center justify-center text-4xl">
                        🍲
                      </div>
                    )}
                    <CardContent className="p-4 space-y-2">
                      <h2 className="font-bold text-foreground line-clamp-1">{r.title}</h2>
                      {r.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        {(r.prep_time || r.cook_time) && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {(r.prep_time ?? 0) + (r.cook_time ?? 0)} min
                          </span>
                        )}
                        {r.servings && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {r.servings}
                          </span>
                        )}
                        {r.cuisine && <Badge variant="outline" className="text-[10px]">{r.cuisine}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RecipeGallery;
