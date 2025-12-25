import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Sparkles, X } from "lucide-react";
import FormProgress from "@/components/recipe-form/FormProgress";
import StepFoodPreferences from "@/components/recipe-form/StepFoodPreferences";
import StepAllergies from "@/components/recipe-form/StepAllergies";
import StepPersonalDetails from "@/components/recipe-form/StepPersonalDetails";
import StepNutrition from "@/components/recipe-form/StepNutrition";
import StepCuisine from "@/components/recipe-form/StepCuisine";
import { useRecipeForm } from "@/hooks/useRecipeForm";
import { Header } from "@/components/Header";
import { useEffect } from "react";

const steps = [
  { title: "Preferences", description: "Foods you love and avoid" },
  { title: "Allergies", description: "Safety first" },
  { title: "Details", description: "About you" },
  { title: "Nutrition", description: "Health goals" },
  { title: "Cuisine", description: "Flavor inspiration" },
];

const Preferences = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const promptFromUrl = searchParams.get("prompt") || "";
  
  const {
    formData,
    currentStep,
    totalSteps,
    isSubmitting,
    updateFormData,
    nextStep,
    prevStep,
  } = useRecipeForm();

  // Set prompt from URL on mount
  useEffect(() => {
    if (promptFromUrl) {
      updateFormData("prompt", promptFromUrl);
    }
  }, [promptFromUrl]);

  const handleSubmit = async () => {
    // Navigate to recipe result page with form data
    navigate("/recipe", { state: { formData } });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepFoodPreferences
            likes={formData.likes}
            dislikes={formData.dislikes}
            onLikesChange={(likes) => updateFormData("likes", likes)}
            onDislikesChange={(dislikes) => updateFormData("dislikes", dislikes)}
          />
        );
      case 2:
        return (
          <StepAllergies
            selectedAllergies={formData.allergies}
            selectedDietary={formData.dietaryStyles}
            onAllergiesChange={(allergies) => updateFormData("allergies", allergies)}
            onDietaryChange={(dietary) => updateFormData("dietaryStyles", dietary)}
          />
        );
      case 3:
        return (
          <StepPersonalDetails
            ageRange={formData.ageRange}
            activityLevel={formData.activityLevel}
            servings={formData.servings}
            onAgeRangeChange={(value) => updateFormData("ageRange", value)}
            onActivityLevelChange={(value) => updateFormData("activityLevel", value)}
            onServingsChange={(value) => updateFormData("servings", value)}
          />
        );
      case 4:
        return (
          <StepNutrition
            selectedDeficiencies={formData.deficiencies}
            selectedGoals={formData.healthGoals}
            onDeficienciesChange={(deficiencies) => updateFormData("deficiencies", deficiencies)}
            onGoalsChange={(goals) => updateFormData("healthGoals", goals)}
          />
        );
      case 5:
        return (
          <StepCuisine
            selectedCuisines={formData.cuisines}
            onCuisinesChange={(cuisines) => updateFormData("cuisines", cuisines)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <Header showBackButton backTo="/" backLabel="Back to Home" />

      {/* Form Container */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2 text-center">
            Tell Us About Your Preferences
          </h1>
          <p className="text-muted-foreground text-center">
            Help us create the perfect recipe for you
          </p>
        </div>

        {/* Prompt Display */}
        {formData.prompt && (
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">Generating recipe for:</p>
                <p className="font-medium text-foreground">{formData.prompt}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => updateFormData("prompt", "")}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <FormProgress currentStep={currentStep} totalSteps={totalSteps} steps={steps} />
        </div>

        {/* Step Content */}
        <div className="mb-8">{renderStep()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex-1 sm:flex-none"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} className="flex-1 sm:flex-none gradient-primary text-primary-foreground shadow-soft">
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none gradient-primary text-primary-foreground shadow-elevated"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Recipe
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Preferences;
