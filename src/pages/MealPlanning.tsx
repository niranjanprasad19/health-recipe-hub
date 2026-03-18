import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Plus, 
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Loader2
} from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MealDropZone } from "@/components/meal-planning/MealDropZone";

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

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MEAL_TYPE_KEYS = [
  { id: "breakfast", key: "breakfast", icon: Coffee },
  { id: "lunch", key: "lunch", icon: Sun },
  { id: "dinner", key: "dinner", icon: Moon },
  { id: "snack", key: "snack", icon: Cookie },
];

const MealPlanning = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [customMealName, setCustomMealName] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  
  // Ref to track in-flight meal plan creation to prevent race conditions
  const mealPlanCreationPromise = useRef<Promise<string | null> | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch meal plan when week changes
  useEffect(() => {
    if (user) {
      fetchMealPlan();
    }
  }, [user, currentWeekStart]);

  // Fetch saved recipes only once on mount (not on week change)
  useEffect(() => {
    if (user) {
      fetchSavedRecipes();
    }
  }, [user]);


  const fetchSavedRecipes = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("saved_recipes")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100); // Limit for performance

    if (!error && data) {
      setSavedRecipes(data);
    }
  }, [user]);

  const fetchMealPlan = useCallback(async () => {
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
      .eq("user_id", user.id)
      .eq("start_date", weekStartStr)
      .maybeSingle();

    if (error) {
      console.error("Error fetching meal plan:", error);
    } else {
      setMealPlan(data);
    }
    setIsLoading(false);
  }, [user, currentWeekStart]);

  const createOrGetMealPlan = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    const weekStartStr = format(currentWeekStart, "yyyy-MM-dd");

    // If we already have a meal plan for this week, return it
    if (mealPlan) {
      return mealPlan.id;
    }

    // If there's already a creation in progress, wait for it
    if (mealPlanCreationPromise.current) {
      return mealPlanCreationPromise.current;
    }

    // Create the meal plan and store the promise to prevent race conditions
    const createPromise = (async () => {
      // First try to fetch existing (in case state is stale)
      const { data: existing } = await supabase
        .from("meal_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("start_date", weekStartStr)
        .maybeSingle();

      if (existing) {
        return existing.id;
      }

      // Create new meal plan
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
        // Handle unique constraint violation (duplicate key)
        if (error.code === "23505") {
          // Another request created it, fetch it
          const { data: refetch } = await supabase
            .from("meal_plans")
            .select("id")
            .eq("user_id", user.id)
            .eq("start_date", weekStartStr)
            .single();
          return refetch?.id || null;
        }
        console.error("Failed to create meal plan:", error);
        return null;
      }

      return data.id;
    })();

    mealPlanCreationPromise.current = createPromise;
    
    try {
      const result = await createPromise;
      return result;
    } finally {
      mealPlanCreationPromise.current = null;
    }
  }, [user, currentWeekStart, mealPlan]);

  const handleAddMeal = async () => {
    if (!selectedRecipeId && !customMealName.trim()) {
      toast.error(t('mealPlanning.selectRecipeOrCustom'));
      return;
    }

    setIsAddingMeal(true);
    
    try {
      const planId = await createOrGetMealPlan();
      if (!planId) {
        toast.error(t('mealPlanning.failedToCreate'));
        return;
      }

      const { error } = await supabase.from("meal_plan_items").insert({
        meal_plan_id: planId,
        day_of_week: selectedDay,
        meal_type: selectedMealType,
        recipe_id: selectedRecipeId || null,
        custom_meal_name: selectedRecipeId ? null : customMealName.trim(),
      });

      if (error) {
        toast.error(t('mealPlanning.failedToAdd'));
        console.error(error);
      } else {
        toast.success(t('mealPlanning.mealAdded'));
        setDialogOpen(false);
        setSelectedRecipeId("");
        setCustomMealName("");
        await fetchMealPlan();
      }
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleRemoveMeal = async (itemId: string) => {
    const { error } = await supabase.from("meal_plan_items").delete().eq("id", itemId);

    if (error) {
      toast.error(t('mealPlanning.failedToRemove'));
    } else {
      toast.success(t('mealPlanning.mealRemoved'));
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (!over || !mealPlan) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a droppable zone
    const overData = over.data.current;
    if (overData && overData.dayIndex !== undefined && overData.mealType) {
      const meal = mealPlan.meal_plan_items.find((m) => m.id === activeId);
      if (!meal) return;

      // Only update if position changed
      if (meal.day_of_week === overData.dayIndex && meal.meal_type === overData.mealType) {
        return;
      }

      // Optimistic update
      setMealPlan((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          meal_plan_items: prev.meal_plan_items.map((item) =>
            item.id === activeId
              ? { ...item, day_of_week: overData.dayIndex, meal_type: overData.mealType }
              : item
          ),
        };
      });

      // Update in database
      const { error } = await supabase
        .from("meal_plan_items")
        .update({
          day_of_week: overData.dayIndex,
          meal_type: overData.mealType,
        })
        .eq("id", activeId);

      if (error) {
        toast.error(t('mealPlanning.failedToMove'));
        fetchMealPlan();
      } else {
        toast.success(t('mealPlanning.mealMoved'));
      }
    }
  };

  const activeMeal = activeDragId
    ? mealPlan?.meal_plan_items.find((m) => m.id === activeDragId)
    : null;

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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            {t('mealPlanning.title')}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('mealPlanning.subtitle')}
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center min-w-[160px] sm:min-w-[200px]">
            <p className="font-semibold text-foreground text-sm sm:text-base">
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

        {/* Weekly Grid with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
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
                  {MEAL_TYPES.map((mealType) => (
                    <MealDropZone
                      key={mealType.id}
                      dayIndex={dayIndex}
                      mealType={mealType}
                      meals={getMealsForDayAndType(dayIndex, mealType.id)}
                      onAddMeal={openAddMealDialog}
                      onRemoveMeal={handleRemoveMeal}
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <DragOverlay>
            {activeMeal && (
              <div className="bg-primary/90 text-primary-foreground rounded-md p-2 text-xs shadow-elevated">
                {activeMeal.saved_recipes?.title || activeMeal.custom_meal_name}
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Add Meal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add {MEAL_TYPES.find((m) => m.id === selectedMealType)?.label} for {DAYS[selectedDay]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {savedRecipes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select a saved recipe
                  </label>
                  <Select
                    value={selectedRecipeId}
                    onValueChange={(value) => {
                      setSelectedRecipeId(value);
                      setCustomMealName("");
                    }}
                  >
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
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
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
              <Button 
                onClick={handleAddMeal} 
                disabled={isAddingMeal}
                className="w-full gradient-primary text-primary-foreground"
              >
                {isAddingMeal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Meal"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link to="/preferences">
            <Button className="gradient-primary text-primary-foreground shadow-soft w-full sm:w-auto">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Generate New Recipe
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="w-full sm:w-auto">View Saved Recipes</Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default MealPlanning;
