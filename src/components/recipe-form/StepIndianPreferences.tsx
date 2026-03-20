import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Search, Plus, X } from "lucide-react";
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

// Reusable search input for grid sections
const SearchInput = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
}) => (
  <div className="relative mb-4">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input
      placeholder={placeholder || "Search or type to add custom..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      className="pl-9 pr-3"
    />
  </div>
);

const AddCustomButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 w-full p-3 mb-4 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
  >
    <Plus className="w-4 h-4" />
    Add "{label}"
  </button>
);

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
  const [regionSearch, setRegionSearch] = useState("");
  const [spiceSearch, setSpiceSearch] = useState("");
  const [mealSearch, setMealSearch] = useState("");
  const [dietarySearch, setDietarySearch] = useState("");

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

  // Region filtering
  const filteredRegions = indianRegionalCuisines.filter((c) =>
    c.label.toLowerCase().includes(regionSearch.toLowerCase())
  );
  const isCustomRegion =
    regionSearch.trim() !== "" &&
    !indianRegionalCuisines.some((c) => c.label.toLowerCase() === regionSearch.trim().toLowerCase()) &&
    !indianRegion.some((s) => s.toLowerCase() === regionSearch.trim().toLowerCase());
  const customRegions = indianRegion.filter((id) => !indianRegionalCuisines.some((c) => c.id === id));

  // Spice filtering
  const filteredSpices = indianSpicePreferences.filter((s) =>
    s.label.toLowerCase().includes(spiceSearch.toLowerCase())
  );
  const isCustomSpice =
    spiceSearch.trim() !== "" &&
    !indianSpicePreferences.some((s) => s.label.toLowerCase() === spiceSearch.trim().toLowerCase()) &&
    !indianSpices.some((s) => s.toLowerCase() === spiceSearch.trim().toLowerCase());
  const customSpices = indianSpices.filter((id) => !indianSpicePreferences.some((s) => s.id === id));

  // Meal type filtering
  const filteredMealTypes = indianMealTypes.filter((m) =>
    m.label.toLowerCase().includes(mealSearch.toLowerCase())
  );

  // Dietary filtering
  const filteredDietary = indianDietaryStyles.filter((d) =>
    d.label.toLowerCase().includes(dietarySearch.toLowerCase())
  );
  const isCustomDietary =
    dietarySearch.trim() !== "" &&
    !indianDietaryStyles.some((d) => d.label.toLowerCase() === dietarySearch.trim().toLowerCase()) &&
    !indianDietary.some((s) => s.toLowerCase() === dietarySearch.trim().toLowerCase());
  const customDietaryItems = indianDietary.filter((id) => !indianDietaryStyles.some((d) => d.id === id));

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
          <SearchInput
            value={regionSearch}
            onChange={setRegionSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isCustomRegion) {
                  onRegionChange([...indianRegion, regionSearch.trim().toLowerCase()]);
                  setRegionSearch("");
                }
              }
            }}
          />
          {isCustomRegion && (
            <AddCustomButton
              label={regionSearch.trim()}
              onClick={() => {
                onRegionChange([...indianRegion, regionSearch.trim().toLowerCase()]);
                setRegionSearch("");
              }}
            />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredRegions.map((cuisine) => (
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
            {customRegions.map((id) => (
              <button
                key={id}
                onClick={() => toggleRegion(id)}
                className="p-3 rounded-xl border border-primary bg-primary/10 shadow-soft text-center transition-all duration-200"
              >
                <span className="text-xl mb-1 block">🍛</span>
                <span className="text-xs font-medium text-primary capitalize">{id}</span>
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
          <SearchInput
            value={spiceSearch}
            onChange={setSpiceSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isCustomSpice) {
                  onSpicesChange([...indianSpices, spiceSearch.trim().toLowerCase()]);
                  setSpiceSearch("");
                }
              }
            }}
          />
          {isCustomSpice && (
            <AddCustomButton
              label={spiceSearch.trim()}
              onClick={() => {
                onSpicesChange([...indianSpices, spiceSearch.trim().toLowerCase()]);
                setSpiceSearch("");
              }}
            />
          )}
          <div className="space-y-4">
            {(indianSpices.length > 0) && (
              <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg">
                {indianSpices.map((id) => {
                  const spice = indianSpicePreferences.find((s) => s.id === id);
                  const label = spice ? `${spice.emoji} ${spice.label}` : id;
                  return (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-3 py-1.5 text-sm"
                      onClick={() => toggleSpice(id)}
                    >
                      {label}
                      <X className="w-3 h-3 ml-1.5" />
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {filteredSpices
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
          <SearchInput value={mealSearch} onChange={setMealSearch} placeholder="Search meal types..." />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredMealTypes.map((meal) => (
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
          <SearchInput
            value={dietarySearch}
            onChange={setDietarySearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isCustomDietary) {
                  onDietaryChange([...indianDietary, dietarySearch.trim().toLowerCase()]);
                  setDietarySearch("");
                }
              }
            }}
          />
          {isCustomDietary && (
            <AddCustomButton
              label={dietarySearch.trim()}
              onClick={() => {
                onDietaryChange([...indianDietary, dietarySearch.trim().toLowerCase()]);
                setDietarySearch("");
              }}
            />
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {filteredDietary.map((style) => (
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
            {customDietaryItems.map((id) => (
              <button
                key={id}
                onClick={() => toggleDietary(id)}
                className="p-4 rounded-xl border border-primary bg-primary/10 shadow-soft text-left transition-all duration-200"
              >
                <span className="text-sm font-medium text-primary capitalize block">{id}</span>
                <span className="text-xs text-muted-foreground">Custom preference</span>
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
