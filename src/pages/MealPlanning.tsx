import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Plus, 
  Trash2, 
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie
} from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SavedRecipe {
  id: string;
  title: string;
}

interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string | null;
  day_of_week: number;
  meal_type: string;
  custom_meal_name: string | null;
  notes: string | null;
  saved_recipes?: SavedRecipe | null;
}

interface MealPlan {
  id: string;
  name: string;
  start_date: string;
  meal_plan_items: MealPlanItem[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: Sun },
  { id: "dinner", label: "Dinner", icon: Moon },
  { id: "snack", label: "Snack", icon: Cookie },
];

const MealPlanning = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [customMealName, setCustomMealName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMealPlan();
      fetchSavedRecipes();
    }
  }, [user, currentWeekStart]);

  const fetchSavedRecipes = async () => {
    const { data, error } = await supabase
      .from("saved_recipes")
      .select("id, title")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSavedRecipes(data);
    }
  };

  const fetchMealPlan = async () => {
    if (!user) return;
    setIsLoading(true);

    const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

    const { data, error } = await supabase
      .from("meal_plans")
      .select(`
        id,
        name,
        start_date,
        meal_plan_items (
          id,
          meal_plan_id,
          recipe_id,
          day_of_week,
          meal_type,
          custom_meal_name,
          notes,
          saved_recipes (
            id,
            title
          )
        )
      `)
      .eq("start_date", weekStartStr)
      .maybeSingle();

    if (error) {
      console.error("Error fetching meal plan:", error);
    } else {
      setMealPlan(data);
    }
    setIsLoading(false);
  };

  const createOrGetMealPlan = async (): Promise<string | null> => {
    if (!user) return null;

    const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

    if (mealPlan) {
      return mealPlan.id;
    }

    const { data, error } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        name: `Week of ${format(currentWeekStart, "MMM d, yyyy")}`,
        start_date: weekStartStr,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create meal plan");
      console.error(error);
      return null;
    }

    return data.id;
  };

  const handleAddMeal = async () => {
    if (!selectedRecipeId && !customMealName.trim()) {
      toast.error("Please select a recipe or enter a custom meal name");
      return;
    }

    const planId = await createOrGetMealPlan();
    if (!planId) return;

    const { error } = await supabase.from("meal_plan_items").insert({
      meal_plan_id: planId,
      day_of_week: selectedDay,
      meal_type: selectedMealType,
      recipe_id: selectedRecipeId || null,
      custom_meal_name: selectedRecipeId ? null : customMealName.trim(),
    });

    if (error) {
      toast.error("Failed to add meal");
      console.error(error);
    } else {
      toast.success("Meal added!");
      setDialogOpen(false);
      setSelectedRecipeId("");
      setCustomMealName("");
      fetchMealPlan();
    }
  };

  const handleRemoveMeal = async (itemId: string) => {
    const { error } = await supabase.from("meal_plan_items").delete().eq("id", itemId);

    if (error) {
      toast.error("Failed to remove meal");
    } else {
      toast.success("Meal removed");
      fetchMealPlan();
    }
  };

  const getMealsForDayAndType = (dayIndex: number, mealType: string) => {
    if (!mealPlan) return [];
    return mealPlan.meal_plan_items.filter(
      (item) => item.day_of_week === dayIndex && item.meal_type === mealType
    );
  };

  const openAddMealDialog = (dayIndex: number, mealType: string) => {
    setSelectedDay(dayIndex);
    setSelectedMealType(mealType);
    setDialogOpen(true);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header showBackButton backTo="/" backLabel="Back to Home" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            Meal Planning
          </h1>
          <p className="text-muted-foreground">
            Plan your meals for the week ahead
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[200px]">
            <p className="font-semibold text-foreground">
              {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {DAYS.map((day, dayIndex) => (
            <Card key={day} className="gradient-card shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-center">
                  {day}
                  <span className="block text-xs text-muted-foreground font-normal">
                    {format(addDays(currentWeekStart, dayIndex), "MMM d")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MEAL_TYPES.map((mealType) => {
                  const meals = getMealsForDayAndType(dayIndex, mealType.id);
                  const Icon = mealType.icon;

                  return (
                    <div key={mealType.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon className="w-3 h-3" />
                          {mealType.label}
                        </div>
                        <Dialog open={dialogOpen && selectedDay === dayIndex && selectedMealType === mealType.id} onOpenChange={(open) => {
                          if (!open) setDialogOpen(false);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => openAddMealDialog(dayIndex, mealType.id)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Add {mealType.label} for {day}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              {savedRecipes.length > 0 && (
                                <div>
                                  <label className="text-sm font-medium mb-2 block">
                                    Select a saved recipe
                                  </label>
                                  <Select value={selectedRecipeId} onValueChange={(value) => {
                                    setSelectedRecipeId(value);
                                    setCustomMealName("");
                                  }}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose a recipe..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {savedRecipes.map((recipe) => (
                                        <SelectItem key={recipe.id} value={recipe.id}>
                                          {recipe.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                  <span className="bg-background px-2 text-muted-foreground">
                                    Or
                                  </span>
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Enter a custom meal
                                </label>
                                <Input
                                  placeholder="e.g., Grilled salmon with veggies"
                                  value={customMealName}
                                  onChange={(e) => {
                                    setCustomMealName(e.target.value);
                                    setSelectedRecipeId("");
                                  }}
                                />
                              </div>
                              <Button onClick={handleAddMeal} className="w-full gradient-primary text-primary-foreground">
                                Add Meal
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {meals.map((meal) => (
                        <div
                          key={meal.id}
                          className="bg-secondary/50 rounded-md p-2 text-xs flex items-center justify-between group"
                        >
                          <span className="truncate flex-1">
                            {meal.saved_recipes?.title || meal.custom_meal_name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveMeal(meal.id)}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link to="/preferences">
            <Button className="gradient-primary text-primary-foreground shadow-soft">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Generate New Recipe
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline">
              View Saved Recipes
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MealPlanning;
