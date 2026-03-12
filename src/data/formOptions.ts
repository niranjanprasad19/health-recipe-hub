// Dummy data for form options

export const foodLikes = [
  "Chicken", "Beef", "Fish", "Shrimp", "Tofu", "Eggs",
  "Pasta", "Rice", "Quinoa", "Potatoes", "Sweet Potatoes",
  "Broccoli", "Spinach", "Tomatoes", "Avocado", "Mushrooms",
  "Cheese", "Yogurt", "Beans", "Lentils", "Chickpeas",
  "Salmon", "Tuna", "Turkey", "Pork", "Lamb",
  "Paneer", "Dal", "Basmati Rice", "Ghee", "Naan"
];

export const foodDislikes = [
  "Olives", "Anchovies", "Liver", "Blue Cheese", "Cilantro",
  "Brussels Sprouts", "Beets", "Eggplant", "Okra", "Oysters",
  "Tofu", "Mushrooms", "Coconut", "Raisins", "Ginger"
];

export const allergies = [
  { id: "nuts", label: "Tree Nuts", description: "Almonds, walnuts, cashews, etc." },
  { id: "peanuts", label: "Peanuts", description: "Peanuts and peanut products" },
  { id: "dairy", label: "Dairy", description: "Milk, cheese, butter, etc." },
  { id: "gluten", label: "Gluten", description: "Wheat, barley, rye" },
  { id: "shellfish", label: "Shellfish", description: "Shrimp, crab, lobster" },
  { id: "eggs", label: "Eggs", description: "Eggs and egg products" },
  { id: "soy", label: "Soy", description: "Soybeans and soy products" },
  { id: "fish", label: "Fish", description: "All types of fish" },
  { id: "sesame", label: "Sesame", description: "Sesame seeds and oil" },
];

export const dietaryStyles = [
  { id: "vegetarian", label: "Vegetarian", description: "No meat or fish" },
  { id: "vegan", label: "Vegan", description: "No animal products" },
  { id: "keto", label: "Keto", description: "Low carb, high fat" },
  { id: "paleo", label: "Paleo", description: "Whole foods, no grains" },
  { id: "mediterranean", label: "Mediterranean", description: "Heart-healthy diet" },
  { id: "low-sodium", label: "Low Sodium", description: "Reduced salt intake" },
];

export const ageRanges = [
  { value: "18-25", label: "18-25 years" },
  { value: "26-35", label: "26-35 years" },
  { value: "36-45", label: "36-45 years" },
  { value: "46-55", label: "46-55 years" },
  { value: "56-65", label: "56-65 years" },
  { value: "65+", label: "65+ years" },
];

export const activityLevels = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "light", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Very Active", description: "Hard exercise 6-7 days/week" },
  { value: "athlete", label: "Athlete", description: "Very hard exercise, physical job" },
];

export const servingsOptions = [
  { value: "1", label: "1 serving" },
  { value: "2", label: "2 servings" },
  { value: "3", label: "3 servings" },
  { value: "4", label: "4 servings" },
  { value: "5", label: "5 servings" },
  { value: "6", label: "6+ servings" },
];

export const deficiencies = [
  { id: "iron", label: "Iron", description: "Important for blood health" },
  { id: "vitamin-d", label: "Vitamin D", description: "Supports bone health" },
  { id: "vitamin-b12", label: "Vitamin B12", description: "Essential for nervous system" },
  { id: "calcium", label: "Calcium", description: "Builds strong bones" },
  { id: "omega-3", label: "Omega-3", description: "Heart and brain health" },
  { id: "magnesium", label: "Magnesium", description: "Muscle and nerve function" },
  { id: "zinc", label: "Zinc", description: "Immune system support" },
  { id: "fiber", label: "Fiber", description: "Digestive health" },
  { id: "protein", label: "Protein", description: "Muscle building and repair" },
];

export const healthGoals = [
  { id: "weight-loss", label: "Weight Loss", description: "Reduce calorie intake" },
  { id: "muscle-building", label: "Muscle Building", description: "High protein focus" },
  { id: "energy-boost", label: "Energy Boost", description: "Sustained energy throughout the day" },
  { id: "heart-health", label: "Heart Health", description: "Low cholesterol, healthy fats" },
  { id: "gut-health", label: "Gut Health", description: "Probiotics and fiber-rich" },
  { id: "anti-inflammatory", label: "Anti-Inflammatory", description: "Reduce inflammation" },
];

export const cuisines = [
  { id: "italian", label: "Italian", emoji: "🇮🇹" },
  { id: "asian", label: "Asian", emoji: "🥢" },
  { id: "mexican", label: "Mexican", emoji: "🇲🇽" },
  { id: "mediterranean", label: "Mediterranean", emoji: "🫒" },
  { id: "indian", label: "Indian", emoji: "🇮🇳" },
  { id: "american", label: "American", emoji: "🇺🇸" },
  { id: "japanese", label: "Japanese", emoji: "🇯🇵" },
  { id: "thai", label: "Thai", emoji: "🇹🇭" },
  { id: "french", label: "French", emoji: "🇫🇷" },
  { id: "greek", label: "Greek", emoji: "🇬🇷" },
  { id: "middle-eastern", label: "Middle Eastern", emoji: "🧆" },
  { id: "korean", label: "Korean", emoji: "🇰🇷" },
];

// Indian-specific options

export const indianFoodLikes = [
  "Paneer", "Dal (Lentils)", "Basmati Rice", "Roti/Naan", "Ghee",
  "Curd/Raita", "Biryani", "Samosa", "Idli/Dosa", "Chana",
  "Rajma", "Palak", "Methi", "Aloo", "Gobi",
  "Tandoori Chicken", "Butter Chicken", "Chole", "Poha", "Upma"
];

export const indianSpicePreferences = [
  { id: "turmeric", label: "Turmeric (Haldi)", emoji: "🟡" },
  { id: "cumin", label: "Cumin (Jeera)", emoji: "🌰" },
  { id: "coriander", label: "Coriander (Dhania)", emoji: "🌿" },
  { id: "garam-masala", label: "Garam Masala", emoji: "✨" },
  { id: "cardamom", label: "Cardamom (Elaichi)", emoji: "💚" },
  { id: "mustard-seeds", label: "Mustard Seeds (Rai)", emoji: "🟤" },
  { id: "red-chilli", label: "Red Chilli (Lal Mirch)", emoji: "🌶️" },
  { id: "black-pepper", label: "Black Pepper (Kali Mirch)", emoji: "⚫" },
  { id: "fenugreek", label: "Fenugreek (Methi)", emoji: "🍃" },
  { id: "asafoetida", label: "Asafoetida (Hing)", emoji: "🧂" },
  { id: "curry-leaves", label: "Curry Leaves (Kadi Patta)", emoji: "🌿" },
  { id: "saffron", label: "Saffron (Kesar)", emoji: "🧡" },
];

export const indianRegionalCuisines = [
  { id: "north-indian", label: "North Indian", emoji: "🍛" },
  { id: "south-indian", label: "South Indian", emoji: "🥥" },
  { id: "bengali", label: "Bengali", emoji: "🐟" },
  { id: "gujarati", label: "Gujarati", emoji: "🍬" },
  { id: "rajasthani", label: "Rajasthani", emoji: "🏜️" },
  { id: "punjabi", label: "Punjabi", emoji: "🧈" },
  { id: "hyderabadi", label: "Hyderabadi", emoji: "🍚" },
  { id: "kerala", label: "Kerala", emoji: "🌴" },
  { id: "maharashtrian", label: "Maharashtrian", emoji: "🥜" },
  { id: "chettinad", label: "Chettinad", emoji: "🌶️" },
  { id: "goan", label: "Goan", emoji: "🦐" },
  { id: "awadhi", label: "Awadhi", emoji: "👑" },
];

export const indianDietaryStyles = [
  { id: "jain", label: "Jain", description: "No root vegetables, no onion/garlic" },
  { id: "sattvic", label: "Sattvic", description: "Pure, yogic diet — no onion/garlic, minimal spice" },
  { id: "ayurvedic", label: "Ayurvedic", description: "Balanced doshas, seasonal eating" },
];

export const indianMealTypes = [
  { id: "nashta", label: "Breakfast (Nashta)", emoji: "🌅" },
  { id: "thali", label: "Lunch (Thali)", emoji: "🍽️" },
  { id: "dinner", label: "Dinner", emoji: "🌙" },
  { id: "chaat-tiffin", label: "Snacks (Chaat/Tiffin)", emoji: "🥟" },
  { id: "festive", label: "Festive / Special", emoji: "🪔" },
];

export const spiceLevels = [
  { value: "mild", label: "Mild", emoji: "🌶️", description: "Light spice, aromatic" },
  { value: "medium", label: "Medium", emoji: "🌶️🌶️", description: "Balanced heat" },
  { value: "spicy", label: "Spicy", emoji: "🌶️🌶️🌶️", description: "Authentic Indian heat" },
  { value: "extra-spicy", label: "Extra Spicy", emoji: "🌶️🌶️🌶️🌶️", description: "Fiery and bold" },
];
