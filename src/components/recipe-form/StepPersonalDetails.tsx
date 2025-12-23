import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, User, Activity, Users } from "lucide-react";
import { ageRanges, activityLevels, servingsOptions } from "@/data/formOptions";

interface StepPersonalDetailsProps {
  ageRange: string;
  activityLevel: string;
  servings: string;
  onAgeRangeChange: (value: string) => void;
  onActivityLevelChange: (value: string) => void;
  onServingsChange: (value: string) => void;
}

const StepPersonalDetails = ({
  ageRange,
  activityLevel,
  servings,
  onAgeRangeChange,
  onActivityLevelChange,
  onServingsChange,
}: StepPersonalDetailsProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading">About You</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">This helps us calculate appropriate portion sizes and nutritional needs.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Tell us a bit about yourself for personalized nutrition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                Age Range
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your age affects nutritional requirements</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Select value={ageRange} onValueChange={onAgeRangeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your age range" />
                </SelectTrigger>
                <SelectContent>
                  {ageRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Activity Level
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Helps determine calorie and protein needs</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <Select value={activityLevel} onValueChange={onActivityLevelChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex flex-col">
                        <span>{level.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Number of Servings
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>How many people will you be cooking for?</p>
                </TooltipContent>
              </Tooltip>
            </label>
            <Select value={servings} onValueChange={onServingsChange}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select servings" />
              </SelectTrigger>
              <SelectContent>
                {servingsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepPersonalDetails;
