import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Plus, 
  Trash2,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronRight,
  Package
} from "lucide-react";
import { Header } from "@/components/Header";
import { Breadcrumb } from "@/components/Breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, startOfWeek } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  amount: string | null;
  checked: boolean;
  category?: string;
}

// Category mapping for common ingredients
const categorizeIngredient = (name: string): string => {
  const lowerName = name.toLowerCase();
  
  // Produce
  if (/lettuce|tomato|onion|garlic|pepper|carrot|celery|cucumber|spinach|kale|broccoli|cauliflower|potato|mushroom|avocado|lemon|lime|orange|apple|banana|berry|fruit|vegetable|salad|herb|basil|cilantro|parsley|mint|ginger/.test(lowerName)) {
    return "Produce";
  }
  
  // Dairy & Eggs
  if (/milk|cheese|butter|cream|yogurt|egg|sour cream|cottage|ricotta|mozzarella|parmesan|cheddar/.test(lowerName)) {
    return "Dairy & Eggs";
  }
  
  // Meat & Seafood
  if (/chicken|beef|pork|lamb|turkey|fish|salmon|shrimp|bacon|sausage|steak|ground meat|meat|seafood|tuna|cod|tilapia/.test(lowerName)) {
    return "Meat & Seafood";
  }
  
  // Bakery
  if (/bread|bun|roll|tortilla|pita|bagel|croissant|muffin|pastry/.test(lowerName)) {
    return "Bakery";
  }
  
  // Pantry
  if (/rice|pasta|noodle|flour|sugar|salt|pepper|oil|vinegar|sauce|soy|spice|seasoning|stock|broth|can|bean|lentil|chickpea|tomato paste|coconut/.test(lowerName)) {
    return "Pantry";
  }
  
  // Frozen
  if (/frozen|ice cream/.test(lowerName)) {
    return "Frozen";
  }
  
  // Beverages
  if (/water|juice|soda|coffee|tea|wine|beer/.test(lowerName)) {
    return "Beverages";
  }
  
  return "Other";
};

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentListId, setCurrentListId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [mealPlanInfo, setMealPlanInfo] = useState<{ name: string; itemCount: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrCreateShoppingList();
      fetchMealPlanInfo();
    }
  }, [user]);


  // Initialize expanded categories when items change
  useEffect(() => {
    const categories = new Set(items.map(item => item.category || categorizeIngredient(item.ingredient_name)));
    setExpandedCategories(categories);
  }, [items.length]);

  const fetchMealPlanInfo = async () => {
    if (!user) return;

    const weekStart = startOfWeek(new Date());
    const weekStartStr = format(weekStart, "yyyy-MM-dd");

    const { data: mealPlan } = await supabase
      .from("meal_plans")
      .select(`
        name,
        meal_plan_items (
          id,
          recipe_id
        )
      `)
      .eq("start_date", weekStartStr)
      .eq("user_id", user.id)
      .maybeSingle();

    if (mealPlan) {
      const itemsWithRecipes = mealPlan.meal_plan_items.filter((item: any) => item.recipe_id);
      setMealPlanInfo({
        name: mealPlan.name,
        itemCount: itemsWithRecipes.length
      });
    }
  };

  const fetchOrCreateShoppingList = async () => {
    if (!user) return;
    setIsLoading(true);

    const { data: lists, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (listError) {
      console.error("Error fetching list:", listError);
      setIsLoading(false);
      return;
    }

    let listId: string;

    if (lists && lists.length > 0) {
      listId = lists[0].id;
    } else {
      const { data: newList, error: createError } = await supabase
        .from("shopping_lists")
        .insert({ user_id: user.id, name: "My Shopping List" })
        .select()
        .single();

      if (createError || !newList) {
        console.error("Error creating list:", createError);
        setIsLoading(false);
        return;
      }
      listId = newList.id;
    }

    setCurrentListId(listId);
    await fetchItems(listId);
    setIsLoading(false);
  };

  const fetchItems = async (listId: string) => {
    const { data, error } = await supabase
      .from("shopping_list_items")
      .select("*")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setItems(data.map(item => ({
        ...item,
        category: categorizeIngredient(item.ingredient_name)
      })));
    }
  };

  const generateFromMealPlan = async () => {
    if (!user || !currentListId) return;

    setIsGenerating(true);
    const weekStart = startOfWeek(new Date());
    const weekStartStr = format(weekStart, "yyyy-MM-dd");

    const { data: mealPlan, error } = await supabase
      .from("meal_plans")
      .select(`
        id,
        name,
        start_date,
        meal_plan_items (
          recipe_id,
          custom_meal_name,
          saved_recipes (
            ingredients
          )
        )
      `)
      .eq("start_date", weekStartStr)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error(t('shoppingList.failedToFetch'));
      setIsGenerating(false);
      return;
    }

    if (!mealPlan || !mealPlan.meal_plan_items.length) {
      toast.error(t('shoppingList.noMealsFound'));
      setIsGenerating(false);
      return;
    }

    // Aggregate ingredients
    const ingredientMap = new Map<string, { amounts: string[]; category: string }>();

    mealPlan.meal_plan_items.forEach((item: any) => {
      if (item.saved_recipes?.ingredients) {
        const ingredients = item.saved_recipes.ingredients as any[];
        ingredients.forEach((ing: any) => {
          const name = ing.item?.toLowerCase() || ing.name?.toLowerCase() || String(ing).toLowerCase();
          const amount = ing.amount || "";
          
          if (name) {
            const existing = ingredientMap.get(name) || { amounts: [], category: categorizeIngredient(name) };
            if (amount) existing.amounts.push(amount);
            ingredientMap.set(name, existing);
          }
        });
      }
    });

    if (ingredientMap.size === 0) {
      toast.error(t('shoppingList.noIngredients'));
      setIsGenerating(false);
      return;
    }

    // Check for existing items to avoid duplicates
    const existingNames = new Set(items.map(i => i.ingredient_name.toLowerCase()));
    
    const newItems = Array.from(ingredientMap.entries())
      .filter(([name]) => !existingNames.has(name))
      .map(([name, data]) => ({
        shopping_list_id: currentListId,
        ingredient_name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: data.amounts.join(", ") || null,
        checked: false,
      }));

    if (newItems.length === 0) {
      toast.info(t('shoppingList.allInList'));
      setIsGenerating(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(newItems);

    if (insertError) {
      toast.error("Failed to add ingredients");
      console.error(insertError);
    } else {
      toast.success(`Added ${newItems.length} ingredients from your meal plan!`);
      await fetchItems(currentListId);
    }
    setIsGenerating(false);
  };

  const addItem = async () => {
    if (!newItem.trim() || !currentListId) return;

    const { error } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: currentListId,
        ingredient_name: newItem.trim(),
        amount: newAmount.trim() || null,
      });

    if (error) {
      toast.error("Failed to add item");
    } else {
      setNewItem("");
      setNewAmount("");
      await fetchItems(currentListId);
    }
  };

  const toggleItem = async (id: string, checked: boolean) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({ checked: !checked })
      .eq("id", id);

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, checked: !checked } : item
      ));
    }
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", id);

    if (!error) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const clearChecked = async () => {
    if (!currentListId) return;

    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("shopping_list_id", currentListId)
      .eq("checked", true);

    if (!error) {
      setItems(items.filter(item => !item.checked));
      toast.success("Cleared checked items");
    }
  };

  const clearAll = async () => {
    if (!currentListId) return;

    const { error } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("shopping_list_id", currentListId);

    if (!error) {
      setItems([]);
      toast.success("Cleared all items");
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const unchecked = items.filter(item => !item.checked);
    const checked = items.filter(item => item.checked);

    const grouped: Record<string, ShoppingListItem[]> = {};
    unchecked.forEach(item => {
      const category = item.category || "Other";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    // Sort categories alphabetically
    const sortedCategories = Object.keys(grouped).sort();

    return { grouped, sortedCategories, checked };
  }, [items]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <div className="min-h-screen gradient-hero">
      <Header showBackButton backTo="/" backLabel="Back to Home" />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Breadcrumb items={[{ label: "Shopping List" }]} />

        <div className="mb-8 text-center">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2 sm:gap-3">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            Shopping List
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Your grocery list for the week
          </p>
        </div>

        {/* Generate from meal plan */}
        <Card className="mb-6 gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              {mealPlanInfo && mealPlanInfo.itemCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded-lg p-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    <strong>{mealPlanInfo.name}</strong> has {mealPlanInfo.itemCount} meals with recipes
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={generateFromMealPlan} 
                  disabled={isGenerating}
                  className="flex-1 gradient-primary text-primary-foreground"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  {isGenerating ? "Generating..." : "Generate from Meal Plan"}
                </Button>
                <Link to="/meal-planning" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Meal Plan
                  </Button>
                </Link>
              </div>
              {!mealPlanInfo && (
                <p className="text-sm text-muted-foreground text-center">
                  No meal plan found for this week. <Link to="/meal-planning" className="text-primary hover:underline">Create one</Link> to auto-generate your shopping list!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add item */}
        <Card className="mb-6 gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Item name..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                className="flex-1"
              />
              <Input
                placeholder="Amount"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                className="w-24 sm:w-32"
              />
              <Button onClick={addItem} className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Shopping list items */}
        <Card className="gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Items ({uncheckedItems.length})
            </CardTitle>
            <div className="flex gap-2">
              {checkedItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearChecked}>
                  Clear checked ({checkedItems.length})
                </Button>
              )}
              {items.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No items yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Add items manually or generate from your meal plan!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Grouped by category */}
                {groupedItems.sortedCategories.map((category) => (
                  <Collapsible 
                    key={category} 
                    open={expandedCategories.has(category)}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-colors">
                        <div className="flex items-center gap-2">
                          {expandedCategories.has(category) ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{category}</span>
                          <Badge variant="secondary" className="text-xs">
                            {groupedItems.grouped[category].length}
                          </Badge>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 space-y-2">
                      {groupedItems.grouped[category].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 group ml-4"
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => toggleItem(item.id, item.checked)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{item.ingredient_name}</span>
                            {item.amount && (
                              <span className="text-muted-foreground text-sm ml-2">
                                ({item.amount})
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={() => deleteItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                {/* Checked items */}
                {checkedItems.length > 0 && (
                  <div className="border-t border-border mt-6 pt-4">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                          <ChevronDown className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Checked items ({checkedItems.length})
                          </span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {checkedItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 group opacity-60"
                          >
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleItem(item.id, item.checked)}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="font-medium line-through">{item.ingredient_name}</span>
                              {item.amount && (
                                <span className="text-muted-foreground text-sm ml-2">
                                  ({item.amount})
                                </span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ShoppingList;
