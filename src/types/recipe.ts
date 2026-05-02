export interface Ingredient {
  item: string;
  amount: string;
  notes?: string;
}

export interface Instruction {
  step: number;
  instruction: string;
  tip?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  sodium?: string;
}

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutritionInfo: NutritionInfo;
  tags: string[];
  healthBenefits: string[];
}

export interface SavedRecipe extends Recipe {
  id: string;
  user_id: string;
  created_at: string;
  imageUrl?: string | null;
}
