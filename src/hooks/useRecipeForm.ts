import { useState, useMemo } from "react";

export interface RecipeFormData {
  // Custom prompt from search
  prompt: string;
  // Step 1: Food Preferences
  likes: string[];
  dislikes: string[];
  // Step 2: Allergies & Dietary
  allergies: string[];
  dietaryStyles: string[];
  // Step 3: Personal Details
  ageRange: string;
  activityLevel: string;
  servings: string;
  // Step 4: Nutrition
  deficiencies: string[];
  healthGoals: string[];
  // Step 5: Cuisine
  cuisines: string[];
  // Step 6: Indian Preferences (conditional)
  indianRegion: string[];
  spiceLevel: string;
  indianSpices: string[];
  indianMealType: string;
  indianDietaryStyles: string[];
}

const initialFormData: RecipeFormData = {
  prompt: "",
  likes: [],
  dislikes: [],
  allergies: [],
  dietaryStyles: [],
  ageRange: "",
  activityLevel: "",
  servings: "2",
  deficiencies: [],
  healthGoals: [],
  cuisines: [],
  indianRegion: [],
  spiceLevel: "",
  indianSpices: [],
  indianMealType: "",
  indianDietaryStyles: [],
};

export const useRecipeForm = () => {
  const [formData, setFormData] = useState<RecipeFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasIndianCuisine = formData.cuisines.includes("indian");
  const totalSteps = hasIndianCuisine ? 6 : 5;

  const updateFormData = <K extends keyof RecipeFormData>(
    key: K,
    value: RecipeFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    console.log("Form submitted:", formData);
    return formData;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  return {
    formData,
    currentStep,
    totalSteps,
    isSubmitting,
    hasIndianCuisine,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    resetForm,
  };
};
