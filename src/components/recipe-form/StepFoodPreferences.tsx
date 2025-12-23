import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Heart, ThumbsDown } from "lucide-react";
import MultiSelectTags from "./MultiSelectTags";
import { foodLikes, foodDislikes } from "@/data/formOptions";

interface StepFoodPreferencesProps {
  likes: string[];
  dislikes: string[];
  onLikesChange: (likes: string[]) => void;
  onDislikesChange: (dislikes: string[]) => void;
}

const StepFoodPreferences = ({
  likes,
  dislikes,
  onLikesChange,
  onDislikesChange,
}: StepFoodPreferencesProps) => {
  const toggleLike = (item: string) => {
    if (likes.includes(item)) {
      onLikesChange(likes.filter((l) => l !== item));
    } else {
      onLikesChange([...likes, item]);
    }
  };

  const toggleDislike = (item: string) => {
    if (dislikes.includes(item)) {
      onDislikesChange(dislikes.filter((d) => d !== item));
    } else {
      onDislikesChange([...dislikes, item]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading">Foods You Love</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Select ingredients you enjoy. We'll include these in your recipes!</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Click on ingredients you want in your recipes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelectTags
            options={foodLikes}
            selected={likes}
            onToggle={toggleLike}
            placeholder="Click ingredients below to add them"
          />
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ThumbsDown className="w-5 h-5 text-destructive" />
            <CardTitle className="font-heading">Foods to Avoid</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Select ingredients you don't like. We'll exclude these from your recipes.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CardDescription>
            Click on ingredients you want to exclude
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelectTags
            options={foodDislikes}
            selected={dislikes}
            onToggle={toggleDislike}
            placeholder="Click ingredients below to exclude them"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StepFoodPreferences;
