import { Toaster } from "@/components/ui/toaster";
import MealPlanning from "./pages/MealPlanning";
import ShoppingList from "./pages/ShoppingList";
import SharedRecipe from "./pages/SharedRecipe";
import RecipeSearch from "./pages/RecipeSearch";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Preferences from "./pages/Preferences";
import Auth from "./pages/Auth";
import RecipeResult from "./pages/RecipeResult";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import QuickRecipe from "./pages/QuickRecipe";
import ResetPassword from "./pages/ResetPassword";
import LeftoverRecipe from "./pages/LeftoverRecipe";
import FestivalRecipes from "./pages/FestivalRecipes";
import NutritionDashboard from "./pages/NutritionDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/recipe" element={<RecipeResult />} />
            <Route path="/recipe/:id" element={<RecipeResult />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/meal-planning" element={<MealPlanning />} />
            <Route path="/shopping-list" element={<ShoppingList />} />
            <Route path="/search" element={<RecipeSearch />} />
            <Route path="/shared/:shareToken" element={<SharedRecipe />} />
            <Route path="/quick-recipe" element={<QuickRecipe />} />
            <Route path="/leftover-recipe" element={<LeftoverRecipe />} />
            <Route path="/festival-recipes" element={<FestivalRecipes />} />
            <Route path="/nutrition" element={<NutritionDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
