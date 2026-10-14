export interface HubIdea {
  name: string;
  time: string;
  why: string;
  prompt: string;
}

export interface SeoHub {
  slug: string;
  emoji: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  tips: string[];
  ideas: HubIdea[];
}

export const seoHubs: SeoHub[] = [
  {
    slug: "10-minute-hostel-recipes",
    emoji: "⏱️",
    title: "10-Minute Hostel Recipes — Kettle, Induction & No-Kitchen Meals",
    h1: "10-Minute Hostel Recipes",
    description:
      "Quick, cheap hostel and PG recipes made with a kettle, induction or microwave. Healthy Indian student meals ready in 10 minutes.",
    intro:
      "No full kitchen, tiny budget, exams tomorrow? These meals need one pot or a kettle, a handful of pantry staples and about 10 minutes.",
    tips: [
      "Keep poha, oats, Maggi, peanuts, curd and eggs as your base pantry.",
      "An electric kettle can cook instant oats, poha, and boiled eggs.",
      "Add a handful of roasted chana or peanuts for cheap protein.",
    ],
    ideas: [
      { name: "Kettle Masala Oats", time: "8 min", why: "One kettle, high fibre", prompt: "10 minute masala oats made only with an electric kettle in a hostel" },
      { name: "Poha with Peanuts", time: "10 min", why: "Cheap, filling breakfast", prompt: "10 minute hostel poha with peanuts using an induction plate" },
      { name: "Egg Bhurji Wrap", time: "10 min", why: "20g+ protein", prompt: "quick egg bhurji roti wrap for students in 10 minutes" },
      { name: "Curd Rice Bowl", time: "5 min", why: "No cooking, gut-friendly", prompt: "no-cook curd rice with leftover rice in 5 minutes" },
      { name: "Upgraded Maggi", time: "10 min", why: "Veggies + protein added", prompt: "healthier masala Maggi with vegetables and egg in 10 minutes" },
      { name: "Chana Chaat", time: "7 min", why: "No stove needed", prompt: "no-cook roasted chana chaat for hostel students" },
    ],
  },
  {
    slug: "indian-recipes-with-us-grocery-ingredients",
    emoji: "🇺🇸",
    title: "Indian Recipes with US Grocery Ingredients — NRI Cooking Guide",
    h1: "Indian Recipes with US Grocery Store Ingredients",
    description:
      "Cook authentic Indian food abroad using Walmart, Trader Joe's and Costco ingredients. Smart swaps for paneer, curry leaves, atta and more.",
    intro:
      "No Indian store nearby? Most dishes taste like home with easy swaps from regular US supermarkets.",
    tips: [
      "Paneer → firm tofu, halloumi or queso fresco.",
      "Atta → whole wheat flour mixed with a little all-purpose flour.",
      "Curry leaves → skip, or add a bay leaf and lime zest.",
      "Fresh methi → dried kasuri methi or a pinch of fenugreek seed.",
    ],
    ideas: [
      { name: "Palak 'Paneer' with Halloumi", time: "25 min", why: "Walmart-friendly", prompt: "palak paneer using halloumi and frozen spinach from a US grocery store" },
      { name: "Rajma with Canned Kidney Beans", time: "20 min", why: "No soaking", prompt: "Punjabi rajma masala using canned kidney beans from a US supermarket" },
      { name: "Trader Joe's Chana Masala", time: "20 min", why: "Canned chickpeas", prompt: "chana masala with canned chickpeas and Trader Joe's ingredients" },
      { name: "Costco Chicken Biryani", time: "45 min", why: "Rotisserie shortcut", prompt: "easy chicken biryani using Costco rotisserie chicken and jasmine rice" },
      { name: "Tortilla Kathi Roll", time: "15 min", why: "Tortillas as roti", prompt: "Kolkata kathi roll using flour tortillas from a US grocery store" },
      { name: "Greek Yogurt Raita & Dal", time: "25 min", why: "Red lentils everywhere", prompt: "masoor dal tadka and greek yogurt raita with US supermarket ingredients" },
    ],
  },
  {
    slug: "budget-indian-student-meals",
    emoji: "💸",
    title: "Budget Indian Meals Under ₹100 — Student & Bachelor Recipes",
    h1: "Budget Indian Meals Under ₹100",
    description:
      "Healthy Indian bachelor recipes that cost under ₹100 per plate. Dal, khichdi, egg curry and more for students on a budget.",
    intro:
      "Eating well on a student budget is about dal, rice, eggs, seasonal sabzi and batch cooking.",
    tips: [
      "Cook dal and rice once, eat them three ways.",
      "Seasonal vegetables are always cheapest.",
      "Soya chunks are the cheapest protein per gram.",
    ],
    ideas: [
      { name: "Moong Dal Khichdi", time: "20 min", why: "One pot, ~₹40", prompt: "budget moong dal khichdi for one under 50 rupees" },
      { name: "Soya Chunk Curry", time: "25 min", why: "High protein, cheap", prompt: "cheap high protein soya chunks curry for bachelors" },
      { name: "Egg Curry", time: "25 min", why: "Under ₹80", prompt: "simple bachelor egg curry under 80 rupees" },
      { name: "Aloo Matar", time: "20 min", why: "Pantry staples", prompt: "budget aloo matar sabzi for students" },
    ],
  },
  {
    slug: "high-protein-vegetarian-indian",
    emoji: "💪",
    title: "High-Protein Vegetarian Indian Recipes — 25g+ Protein Meals",
    h1: "High-Protein Vegetarian Indian Recipes",
    description:
      "Vegetarian Indian meals with 25g+ protein using paneer, dal, soya, chana and curd. Ideal for gym and weight loss.",
    intro:
      "Vegetarian doesn't mean low protein. Combine dals, paneer, soya and curd to hit your macros the desi way.",
    tips: [
      "Pair a dal with a grain for complete protein.",
      "Hung curd is a great high-protein base for dips and marinades.",
      "Sprouts add protein and crunch to any chaat.",
    ],
    ideas: [
      { name: "Paneer Bhurji", time: "15 min", why: "~28g protein", prompt: "high protein paneer bhurji with 25g protein per serving" },
      { name: "Moong Sprout Chilla", time: "20 min", why: "Gym breakfast", prompt: "high protein moong sprout chilla breakfast" },
      { name: "Soya Keema", time: "25 min", why: "~35g protein", prompt: "high protein soya keema vegetarian" },
      { name: "Besan Chilla with Hung Curd", time: "15 min", why: "Low cal, high protein", prompt: "besan chilla with hung curd dip high protein low calorie" },
    ],
  },
  {
    slug: "jain-and-satvik-recipes",
    emoji: "🪷",
    title: "Jain & Satvik Recipes — No Onion, No Garlic Indian Food",
    h1: "Jain & Satvik Recipes (No Onion, No Garlic)",
    description:
      "Flavourful Jain and satvik Indian recipes without onion, garlic or root vegetables. Perfect for fasting and festive days.",
    intro:
      "Hing, ginger, tomato and good ghee bring all the depth you need — no onion or garlic required.",
    tips: [
      "Use hing (asafoetida) in hot ghee to replace onion-garlic flavour.",
      "Raw banana and lauki are great Jain-friendly potato swaps.",
      "For vrat, use sendha namak and kuttu/singhara flour.",
    ],
    ideas: [
      { name: "Jain Pav Bhaji", time: "30 min", why: "Raw banana base", prompt: "Jain pav bhaji with raw banana, no onion garlic potato" },
      { name: "Sabudana Khichdi", time: "20 min", why: "Navratri vrat", prompt: "vrat sabudana khichdi with peanuts and sendha namak" },
      { name: "Satvik Lauki Dal", time: "25 min", why: "Light & healing", prompt: "satvik lauki chana dal with no onion garlic" },
      { name: "Kuttu Paratha", time: "20 min", why: "Fasting flatbread", prompt: "kuttu atta paratha for fasting" },
    ],
  },
  {
    slug: "south-indian-breakfast-recipes",
    emoji: "🥥",
    title: "South Indian Breakfast Recipes — Idli, Dosa, Upma & More",
    h1: "South Indian Breakfast Recipes",
    description:
      "Healthy South Indian breakfasts — instant idli, rava dosa, pesarattu and upma — with nutrition info and quick versions.",
    intro:
      "Light, fermented and full of flavour. Includes instant no-ferment versions for busy mornings.",
    tips: [
      "Rava and oats make instant idli/dosa batters with no fermenting.",
      "Add grated veggies to upma for fibre.",
      "Coconut chutney freezes well in small portions.",
    ],
    ideas: [
      { name: "Instant Rava Idli", time: "20 min", why: "No fermenting", prompt: "instant rava idli with vegetables" },
      { name: "Pesarattu", time: "20 min", why: "Green moong protein", prompt: "Andhra pesarattu green moong dosa with ginger chutney" },
      { name: "Oats Dosa", time: "15 min", why: "High fibre", prompt: "instant oats dosa healthy breakfast" },
      { name: "Vegetable Upma", time: "15 min", why: "One pan", prompt: "Karnataka style vegetable rava upma" },
    ],
  },
];

export const getHub = (slug?: string) => seoHubs.find((h) => h.slug === slug);
