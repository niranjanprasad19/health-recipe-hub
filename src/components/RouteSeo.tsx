import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://nutricheff.lovable.app";

interface RouteMeta {
  title: string;
  description: string;
  noindex?: boolean;
}

const routeMeta: Record<string, RouteMeta> = {
  "/": {
    title: "NutriChef — AI Recipes & Meal Planning",
    description:
      "Generate personalized AI recipes, plan meals, build shopping lists and track nutrition around your tastes, allergies and health goals.",
  },
  "/auth": {
    title: "Sign In — NutriChef",
    description: "Sign in to NutriChef to save recipes, plan meals and track your nutrition.",
    noindex: true,
  },
  "/reset-password": {
    title: "Reset Password — NutriChef",
    description: "Reset your NutriChef account password.",
    noindex: true,
  },
  "/preferences": {
    title: "Recipe Preferences — NutriChef",
    description:
      "Tell NutriChef your food likes, allergies, dietary style and health goals to get a recipe made just for you.",
  },
  "/recipe": {
    title: "Your Personalized Recipe — NutriChef",
    description:
      "A complete AI-generated recipe with ingredients, step-by-step instructions and full nutrition breakdown.",
  },
  "/profile": {
    title: "Saved Recipes — NutriChef",
    description: "Your saved NutriChef recipes and profile settings.",
    noindex: true,
  },
  "/meal-planning": {
    title: "Weekly Meal Planner — NutriChef",
    description:
      "Drag and drop recipes into a weekly meal plan and turn it into a shopping list in one tap.",
  },
  "/shopping-list": {
    title: "Smart Shopping List — NutriChef",
    description:
      "An auto-categorized shopping list built from your meal plan, with duplicates merged automatically.",
  },
  "/search": {
    title: "Search Healthy Recipes — NutriChef",
    description: "Search your NutriChef recipe library by name, cuisine, ingredient or tag.",
  },
  "/quick-recipe": {
    title: "Quick Recipe Generator — NutriChef",
    description: "Describe a craving and get a fast, healthy AI recipe in seconds.",
  },
  "/leftover-recipe": {
    title: "Leftover Ingredient Recipes — NutriChef",
    description:
      "Enter the ingredients you already have and get a recipe that uses them up with almost no extra shopping.",
  },
  "/festival-recipes": {
    title: "Festival Recipe Ideas — NutriChef",
    description:
      "Traditional festival dishes and healthier twists, suggested for the festivals happening now.",
  },
  "/nutrition": {
    title: "Nutrition Dashboard — NutriChef",
    description: "Visualize your daily calories, protein, carbs and fat trends over time.",
  },
  "/collections": {
    title: "Recipe Collections — NutriChef",
    description: "Organize saved recipes into your own cookbooks and collections.",
  },
  "/family-profiles": {
    title: "Family Taste Profiles — NutriChef",
    description:
      "Keep a separate taste, allergy and nutrition profile for every member of your family.",
  },
  "/food-tracker": {
    title: "AI Food & Calorie Tracker — NutriChef",
    description:
      "Snap a photo of your meal and instantly log calories, protein, carbs and fat with AI nutrition analysis.",
  },
};

const fallback: RouteMeta = {
  title: "NutriChef — AI Recipes & Meal Planning",
  description:
    "Personalized AI recipes, meal plans, shopping lists and nutrition tracking built around your tastes and health goals.",
};

function metaForPath(pathname: string): RouteMeta {
  if (routeMeta[pathname]) return routeMeta[pathname];
  if (pathname.startsWith("/recipe/")) return routeMeta["/recipe"];
  if (pathname.startsWith("/shared/"))
    return {
      title: "Shared Recipe — NutriChef",
      description: "A recipe shared with you from NutriChef, with ingredients, steps and nutrition.",
    };
  return fallback;
}

export const RouteSeo = () => {
  const { pathname } = useLocation();
  const meta = metaForPath(pathname);
  const canonical = `${SITE_URL}${pathname === "/" ? "/" : pathname}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonical} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      {meta.noindex ? <meta name="robots" content="noindex, follow" /> : null}
    </Helmet>
  );
};
