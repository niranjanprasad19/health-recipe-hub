import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Sparkles, Calendar } from "lucide-react";
import { festivals, getUpcomingFestivals, type Festival } from "@/data/festivals";
import festivalImg from "@/assets/food-festival.jpg";

const FestivalRecipes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const upcoming = getUpcomingFestivals(6);

  const filtered = search
    ? festivals.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.region.toLowerCase().includes(search.toLowerCase()) ||
        f.suggestedDishes.some(d => d.toLowerCase().includes(search.toLowerCase()))
      )
    : festivals;

  const generateFestivalRecipe = (festival: Festival, dish: string) => {
    navigate(`/quick-recipe?prompt=${encodeURIComponent(`${dish} - traditional ${festival.name} recipe`)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-10"
        >
          <img src={festivalImg} alt="Festival foods" className="w-full h-48 sm:h-64 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t("festival.title")}</h1>
            <p className="text-white/80 text-sm sm:text-base max-w-lg">{t("festival.subtitle")}</p>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("festival.searchPlaceholder")}
            className="pl-10"
          />
        </div>

        {/* Upcoming Festivals */}
        {!search && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t("festival.upcoming")}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((f, i) => (
                <FestivalCard key={f.id} festival={f} index={i} onDishClick={generateFestivalRecipe} t={t} />
              ))}
            </div>
          </motion.section>
        )}

        {/* All / Filtered Festivals */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {search ? t("festival.results") : t("festival.allFestivals")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f, i) => (
              <FestivalCard key={f.id} festival={f} index={i} onDishClick={generateFestivalRecipe} t={t} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">{t("festival.noResults")}</p>
          )}
        </section>
      </main>
    </div>
  );
};

const FestivalCard = ({
  festival,
  index,
  onDishClick,
  t,
}: {
  festival: Festival;
  index: number;
  onDishClick: (f: Festival, dish: string) => void;
  t: (key: string) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Card className="h-full hover:shadow-md hover:border-primary/30 transition-all bg-card overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{festival.emoji}</span>
          <div>
            <h3 className="font-semibold text-foreground">{festival.name}</h3>
            <p className="text-xs text-muted-foreground">{festival.region} · {festival.date.replace("-", "/")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {festival.cuisine.map(c => (
            <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
          ))}
        </div>
        <p className="text-xs font-medium text-muted-foreground mb-2">{t("festival.tryThese")}</p>
        <div className="flex flex-wrap gap-1.5">
          {festival.suggestedDishes.slice(0, 4).map(dish => (
            <button
              key={dish}
              onClick={() => onDishClick(festival, dish)}
              className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
            >
              {dish}
              <ArrowRight className="w-3 h-3" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default FestivalRecipes;
