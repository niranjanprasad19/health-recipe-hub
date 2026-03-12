import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  indianRegionalCuisines,
  indianSpicePreferences,
  indianMealTypes,
  indianDietaryStyles,
  spiceLevels,
} from "@/data/formOptions";

interface StepIndianPreferencesProps {
  indianRegion: string[];
  spiceLevel: string;
  indianSpices: string[];
  indianMealType: string;
  indianDietary: string[];
  onRegionChange: (regions: string[]) => void;
  onSpiceLevelChange: (level: string) => void;
  onSpicesChange: (spices: string[]) => void;
  onMealTypeChange: (type: string) => void;
  onDietaryChange: (dietary: string[]) => void;
}

const StepIndianPreferences = ({
  indianRegion,
  spiceLevel,
  indianSpices,
  indianMealType,
  indianDietary,
  onRegionChange,
  onSpiceLevelChange,
  onSpicesChange,
  onMealTypeChange,
  onDietaryChange,
}: StepIndianPreferencesProps) => {
  const toggleRegion = (id: string) => {
    onRegionChange(
      indianRegion.includes(id)
        ? indianRegion.filter((r) => r !== id)
        : [...indianRegion, id]
    );
  };

  const toggleSpice = (id: string) => {
    onSpicesChange(
      indianSpices.includes(id)
        ? indianSpices.filter((s) => s !== id)
        : [...indianSpices, id]
    );
  };

  const toggleDietary = (id: string) => {
    onDietaryChange(
      indianDietary.includes(id)
        ? indianDietary.filter((d) => d !== id)
        : [...indianDietary, id]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Regional Cuisine */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <CardTitle className="font-heading">Regional Cuisine</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Each region of India has distinct flavors and cooking styles.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>Select your preferred Indian regional cuisines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {indianRegionalCuisines.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => toggleRegion(cuisine.id)}
                className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                  indianRegion.includes(cuisine.id)
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <span className="text-xl mb-1 block">{cuisine.emoji}</span>
                <span className={`text-xs font-medium ${
                  indianRegion.includes(cuisine.id) ? "text-primary" : "text-foreground"
                }`}>
                  {cuisine.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spice Level */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌶️</span>
            <CardTitle className="font-heading">Spice Level</CardTitle>
          </div>
          <CardDescription>How much heat do you enjoy?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {spiceLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => onSpiceLevelChange(level.value)}
                className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                  spiceLevel === level.value
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <span className="text-lg mb-1 block">{level.emoji}</span>
                <span className={`text-sm font-medium block ${
                  spiceLevel === level.value ? "text-primary" : "text-foreground"
                }`}>
                  {level.label}
                </span>
                <span className="text-xs text-muted-foreground">{level.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indian Spice Preferences */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <CardTitle className="font-heading">Spice Preferences</CardTitle>
          </div>
          <CardDescription>Select spices you love in your food</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {indianSpices.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg">
                {indianSpices.map((id) => {
                  const spice = indianSpicePreferences.find((s) => s.id === id);
                  return spice ? (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => toggleSpice(id)}
                    >
                      {spice.emoji} {spice.label}
                      <X className="w-3 h-3 ml-1.5" />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {indianSpicePreferences
                .filter((s) => !indianSpices.includes(s.id))
                .map((spice) => (
                  <Badge
                    key={spice.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors px-3 py-1.5 text-sm"
                    onClick={() => toggleSpice(spice.id)}
                  >
                    {spice.emoji} {spice.label}
                  </Badge>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Type */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <CardTitle className="font-heading">Meal Type</CardTitle>
          </div>
          <CardDescription>What kind of Indian meal are you looking for?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {indianMealTypes.map((meal) => (
              <button
                key={meal.id}
                onClick={() => onMealTypeChange(meal.id)}
                className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                  indianMealType === meal.id
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <span className="text-xl mb-1 block">{meal.emoji}</span>
                <span className={`text-sm font-medium ${
                  indianMealType === meal.id ? "text-primary" : "text-foreground"
                }`}>
                  {meal.label}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indian Dietary Styles */}
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕉️</span>
            <CardTitle className="font-heading">Indian Dietary Style</CardTitle>
          </div>
          <CardDescription>Optional traditional dietary preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {indianDietaryStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => toggleDietary(style.id)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                  indianDietary.includes(style.id)
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <span className={`text-sm font-medium block ${
                  indianDietary.includes(style.id) ? "text-primary" : "text-foreground"
                }`}>
                  {style.label}
                </span>
                <span className="text-xs text-muted-foreground">{style.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-foreground">Almost there!</span> Click "Generate Recipe" below
          to get your personalized Indian recipe.
        </p>
      </div>
    </div>
  );
};

export default StepIndianPreferences;
