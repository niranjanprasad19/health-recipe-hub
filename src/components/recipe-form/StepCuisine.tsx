import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Globe } from "lucide-react";
import { cuisines } from "@/data/formOptions";

interface StepCuisineProps {
  selectedCuisines: string[];
  onCuisinesChange: (cuisines: string[]) => void;
}

const StepCuisine = ({ selectedCuisines, onCuisinesChange }: StepCuisineProps) => {
  const toggleCuisine = (id: string) => {
    if (selectedCuisines.includes(id)) {
      onCuisinesChange(selectedCuisines.filter((c) => c !== id));
    } else {
      onCuisinesChange([...selectedCuisines, id]);
    }
  };

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
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {cuisines.map((cuisine) => (
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
          </div>
        </CardContent>
      </Card>

      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-medium text-foreground">Almost there!</span> Click "Generate Recipe" below 
          to get your personalized healthy recipe.
        </p>
      </div>
    </div>
  );
};

export default StepCuisine;
