import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Pill, Target } from "lucide-react";
import CheckboxGrid from "./CheckboxGrid";
import { deficiencies, healthGoals } from "@/data/formOptions";

interface StepNutritionProps {
  selectedDeficiencies: string[];
  selectedGoals: string[];
  onDeficienciesChange: (deficiencies: string[]) => void;
  onGoalsChange: (goals: string[]) => void;
}

const StepNutrition = ({
  selectedDeficiencies,
  selectedGoals,
  onDeficienciesChange,
  onGoalsChange,
}: StepNutritionProps) => {
  const toggleDeficiency = (id: string) => {
    if (selectedDeficiencies.includes(id)) {
      onDeficienciesChange(selectedDeficiencies.filter((d) => d !== id));
    } else {
      onDeficienciesChange([...selectedDeficiencies, id]);
    }
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      onGoalsChange(selectedGoals.filter((g) => g !== id));
    } else {
      onGoalsChange([...selectedGoals, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading">Nutritional Deficiencies</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">We'll prioritize ingredients rich in these nutrients.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Select any nutritional deficiencies you want to address (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxGrid
            options={deficiencies}
            selected={selectedDeficiencies}
            onToggle={toggleDeficiency}
            columns={3}
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            <CardTitle className="font-heading">Health Goals</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Your recipes will be optimized for these goals.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            What are you hoping to achieve with your diet? (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckboxGrid
            options={healthGoals}
            selected={selectedGoals}
            onToggle={toggleGoal}
            columns={2}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StepNutrition;
