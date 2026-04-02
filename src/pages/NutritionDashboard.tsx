import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Flame, Beef, Wheat, Droplets, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface RecipeWithNutrition {
  title: string;
  created_at: string;
  nutrition_info: Json | null;
}

const parseNutrition = (info: Json | null): NutritionData | null => {
  if (!info || typeof info !== "object" || Array.isArray(info)) return null;
  const obj = info as Record<string, Json | undefined>;
  return {
    calories: Number(obj.calories) || 0,
    protein: parseFloat(String(obj.protein || "0")),
    carbs: parseFloat(String(obj.carbs || "0")),
    fat: parseFloat(String(obj.fat || "0")),
  };
};

const COLORS = [
  "hsl(152, 58%, 42%)",
  "hsl(38, 92%, 50%)",
  "hsl(210, 80%, 50%)",
  "hsl(350, 80%, 55%)",
];

const NutritionDashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<RecipeWithNutrition[]>([]);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchRecipes();
  }, [isAuthenticated, user]);

  const fetchRecipes = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("saved_recipes")
      .select("title, created_at, nutrition_info")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setRecipes(data);
    setLoading(false);
  };

  const filteredRecipes = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (period === "week") cutoff.setDate(now.getDate() - 7);
    else cutoff.setDate(now.getDate() - 30);
    return recipes.filter(r => new Date(r.created_at) >= cutoff);
  }, [recipes, period]);

  const totals = useMemo(() => {
    const result = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    filteredRecipes.forEach(r => {
      const n = parseNutrition(r.nutrition_info);
      if (n) {
        result.calories += n.calories;
        result.protein += n.protein;
        result.carbs += n.carbs;
        result.fat += n.fat;
      }
    });
    return result;
  }, [filteredRecipes]);

  const dailyData = useMemo(() => {
    const days: Record<string, NutritionData> = {};
    filteredRecipes.forEach(r => {
      const n = parseNutrition(r.nutrition_info);
      if (!n) return;
      const day = new Date(r.created_at).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
      if (!days[day]) days[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      days[day].calories += n.calories;
      days[day].protein += n.protein;
      days[day].carbs += n.carbs;
      days[day].fat += n.fat;
    });
    return Object.entries(days).map(([day, data]) => ({ day, ...data }));
  }, [filteredRecipes]);

  const macroData = useMemo(() => [
    { name: t("recipe.protein"), value: Math.round(totals.protein), color: COLORS[0] },
    { name: t("recipe.carbs"), value: Math.round(totals.carbs), color: COLORS[1] },
    { name: t("recipe.fat"), value: Math.round(totals.fat), color: COLORS[2] },
  ], [totals, t]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold mb-4">{t("nutrition.signInRequired")}</h2>
          <Button onClick={() => navigate("/auth")}>{t("common.signIn")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t("nutrition.title")}</h1>
              <p className="text-muted-foreground mt-1">{t("nutrition.subtitle")}</p>
            </div>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "week" | "month")}>
              <TabsList>
                <TabsTrigger value="week">{t("nutrition.week")}</TabsTrigger>
                <TabsTrigger value="month">{t("nutrition.month")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: t("recipe.calories"), value: Math.round(totals.calories), icon: Flame, color: "text-orange-500" },
              { label: t("recipe.protein"), value: `${Math.round(totals.protein)}g`, icon: Beef, color: "text-green-500" },
              { label: t("recipe.carbs"), value: `${Math.round(totals.carbs)}g`, icon: Wheat, color: "text-yellow-500" },
              { label: t("recipe.fat"), value: `${Math.round(totals.fat)}g`, icon: Droplets, color: "text-blue-500" },
            ].map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-4 text-center">
                    <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">{t("common.loading")}</div>
          ) : filteredRecipes.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="font-semibold text-foreground mb-2">{t("nutrition.noData")}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t("nutrition.noDataDesc")}</p>
                <Button onClick={() => navigate("/preferences")}>
                  {t("nutrition.generateRecipe")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Calorie Bar Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">{t("nutrition.caloriesByDay")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Bar dataKey="calories" fill="hsl(152, 58%, 42%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Macro Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("nutrition.macroBreakdown")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={macroData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                        {macroData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trend Line Chart */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-base">{t("nutrition.macroTrend")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                      <Line type="monotone" dataKey="protein" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} name={t("recipe.protein")} />
                      <Line type="monotone" dataKey="carbs" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} name={t("recipe.carbs")} />
                      <Line type="monotone" dataKey="fat" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} name={t("recipe.fat")} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default NutritionDashboard;
