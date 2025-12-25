import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Leaf, 
  ShoppingCart, 
  Plus, 
  Trash2,
  Download,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, startOfWeek, addDays } from "date-fns";

interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  amount: string | null;
  checked: boolean;
}

interface MealPlanWithItems {
  id: string;
  name: string;
  start_date: string;
  meal_plan_items: {
    recipe_id: string | null;
    custom_meal_name: string | null;
    saved_recipes: {
      ingredients: any;
    } | null;
  }[];
}

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentListId, setCurrentListId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchOrCreateShoppingList();
    }
  }, [user]);

  const fetchOrCreateShoppingList = async () => {
    if (!user) return;
    setIsLoading(true);

    // Get most recent shopping list
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
      // Create new list
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
      setItems(data);
    }
  };

  const generateFromMealPlan = async () => {
    if (!user || !currentListId) return;

    const weekStart = startOfWeek(new Date());
    const weekStartStr = format(weekStart, "yyyy-MM-dd");

    // Fetch current week's meal plan with recipes
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
      toast.error("Failed to fetch meal plan");
      return;
    }

    if (!mealPlan || !mealPlan.meal_plan_items.length) {
      toast.error("No meals found for this week. Add some meals to your meal plan first!");
      return;
    }

    // Aggregate ingredients
    const ingredientMap = new Map<string, string[]>();

    mealPlan.meal_plan_items.forEach((item: any) => {
      if (item.saved_recipes?.ingredients) {
        const ingredients = item.saved_recipes.ingredients as any[];
        ingredients.forEach((ing: any) => {
          const name = ing.item?.toLowerCase() || ing.name?.toLowerCase() || String(ing).toLowerCase();
          const amount = ing.amount || "";
          
          if (name) {
            const existing = ingredientMap.get(name) || [];
            if (amount) existing.push(amount);
            ingredientMap.set(name, existing);
          }
        });
      }
    });

    if (ingredientMap.size === 0) {
      toast.error("No ingredients found in your meal plan recipes");
      return;
    }

    // Create shopping list items
    const newItems = Array.from(ingredientMap.entries()).map(([name, amounts]) => ({
      shopping_list_id: currentListId,
      ingredient_name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: amounts.join(", ") || null,
      checked: false,
    }));

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
  };

  const addItem = async () => {
    if (!newItem.trim() || !currentListId) return;

    const { error } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: currentListId,
        ingredient_name: newItem.trim(),
      });

    if (error) {
      toast.error("Failed to add item");
    } else {
      setNewItem("");
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const uncheckedItems = items.filter(item => !item.checked);
  const checkedItems = items.filter(item => item.checked);

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">NutriChef</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            Shopping List
          </h1>
          <p className="text-muted-foreground">
            Your grocery list for the week
          </p>
        </div>

        {/* Generate from meal plan */}
        <Card className="mb-6 gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={generateFromMealPlan} 
                className="flex-1 gradient-primary text-primary-foreground"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Generate from Meal Plan
              </Button>
              <Link to="/meal-planning" className="flex-1">
                <Button variant="outline" className="w-full">
                  View Meal Plan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Add item */}
        <Card className="mb-6 gradient-card shadow-card">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Add an item..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
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
            <CardTitle className="text-lg">Items ({items.length})</CardTitle>
            <div className="flex gap-2">
              {checkedItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearChecked}>
                  Clear checked
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
              <p className="text-center text-muted-foreground py-8">
                No items yet. Add some items or generate from your meal plan!
              </p>
            ) : (
              <div className="space-y-2">
                {uncheckedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 group"
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(item.id, item.checked)}
                    />
                    <div className="flex-1">
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                {checkedItems.length > 0 && (
                  <>
                    <div className="border-t border-border my-4 pt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Checked ({checkedItems.length})
                      </p>
                    </div>
                    {checkedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 group opacity-60"
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(item.id, item.checked)}
                        />
                        <div className="flex-1">
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
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </>
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
