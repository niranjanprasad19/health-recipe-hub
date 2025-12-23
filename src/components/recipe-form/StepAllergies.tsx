import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, AlertTriangle, Salad } from "lucide-react";
import CheckboxGrid from "./CheckboxGrid";
import { allergies, dietaryStyles } from "@/data/formOptions";

interface StepAllergiesProps {
  selectedAllergies: string[];
  selectedDietary: string[];
  onAllergiesChange: (allergies: string[]) => void;
  onDietaryChange: (dietary: string[]) => void;
}

const StepAllergies = ({
  selectedAllergies,
  selectedDietary,
  onAllergiesChange,
  onDietaryChange,
}: StepAllergiesProps) => {
  const toggleAllergy = (id: string) => {
    if (selectedAllergies.includes(id)) {
      onAllergiesChange(selectedAllergies.filter((a) => a !== id));
    } else {
      onAllergiesChange([...selectedAllergies, id]);
    }
  };

  const toggleDietary = (id: string) => {
    if (selectedDietary.includes(id)) {
      onDietaryChange(selectedDietary.filter((d) => d !== id));
    } else {
      onDietaryChange([...selectedDietary, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <CardTitle className="font-heading">Allergies & Intolerances</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">We'll ensure your recipes are completely free from these allergens.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Select any food allergies or intolerances you have
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxGrid
            options={allergies}
            selected={selectedAllergies}
            onToggle={toggleAllergy}
            columns={3}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Salad className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading">Dietary Preferences</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Optional dietary styles to shape your recipes.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Choose any dietary styles you follow (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxGrid
            options={dietaryStyles}
            selected={selectedDietary}
            onToggle={toggleDietary}
            columns={2}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StepAllergies;
