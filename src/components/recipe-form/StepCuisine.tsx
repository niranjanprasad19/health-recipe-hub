import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { HelpCircle, Globe, Search, Plus } from "lucide-react";
import { cuisines } from "@/data/formOptions";

interface StepCuisineProps {
  selectedCuisines: string[];
  onCuisinesChange: (cuisines: string[]) => void;
}

const StepCuisine = ({ selectedCuisines, onCuisinesChange }: StepCuisineProps) => {
  const [search, setSearch] = useState("");

  const toggleCuisine = (id: string) => {
    if (selectedCuisines.includes(id)) {
      onCuisinesChange(selectedCuisines.filter((c) => c !== id));
    } else {
      onCuisinesChange([...selectedCuisines, id]);
    }
  };

  const filteredCuisines = cuisines.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const isCustomEntry =
    search.trim() !== "" &&
    !cuisines.some((c) => c.label.toLowerCase() === search.trim().toLowerCase()) &&
    !selectedCuisines.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  const handleAddCustom = () => {
    if (isCustomEntry) {
      onCuisinesChange([...selectedCuisines, search.trim().toLowerCase()]);
      setSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isCustomEntry) handleAddCustom();
      else if (filteredCuisines.length === 1) {
        toggleCuisine(filteredCuisines[0].id);
        setSearch("");
      }
    }
  };

  // Custom-added cuisines not in predefined list
  const customCuisines = selectedCuisines.filter(
    (id) => !cuisines.some((c) => c.id === id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading">Cuisine Preferences</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Select cuisines you enjoy. We'll create recipes inspired by these flavors!</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            What type of cuisines do you enjoy cooking and eating?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search or type to add custom cuisine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 pr-3"
            />
          </div>

          {isCustomEntry && (
            <button
              onClick={handleAddCustom}
              className="flex items-center gap-2 w-full p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add "{search.trim()}"
            </button>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredCuisines.map((cuisine) => (
              <button
                key={cuisine.id}
                onClick={() => toggleCuisine(cuisine.id)}
                className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                  selectedCuisines.includes(cuisine.id)
                    ? "border-primary bg-primary/10 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                }`}
              >
                <span className="text-2xl mb-2 block">{cuisine.emoji}</span>
                <span className={`text-sm font-medium ${
                  selectedCuisines.includes(cuisine.id) ? "text-primary" : "text-foreground"
                }`}>
                  {cuisine.label}
                </span>
              </button>
            ))}
            {customCuisines.map((id) => (
              <button
                key={id}
                onClick={() => toggleCuisine(id)}
                className="p-4 rounded-xl border border-primary bg-primary/10 shadow-soft text-center transition-all duration-200"
              >
                <span className="text-2xl mb-2 block">🍴</span>
                <span className="text-sm font-medium text-primary capitalize">{id}</span>
              </button>
            ))}
          </div>
          {search && filteredCuisines.length === 0 && !isCustomEntry && (
            <p className="text-sm text-muted-foreground text-center">No matches found</p>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <p className="text-sm text-muted-foreground text-center">
          {selectedCuisines.includes("indian") ? (
            <>
              <span className="font-medium text-foreground">🇮🇳 Indian selected!</span> You'll get a dedicated step to customize regional flavors and spice preferences.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">Almost there!</span> Click "Generate Recipe" below 
              to get your personalized healthy recipe.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default StepCuisine;
