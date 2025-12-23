import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface CheckboxOption {
  id: string;
  label: string;
  description?: string;
}

interface CheckboxGridProps {
  options: CheckboxOption[];
  selected: string[];
  onToggle: (id: string) => void;
  columns?: 2 | 3;
}

const CheckboxGrid = ({ options, selected, onToggle, columns = 2 }: CheckboxGridProps) => {
  return (
    <div className={`grid gap-3 ${columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {options.map((option) => (
        <div
          key={option.id}
          className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
            selected.includes(option.id)
              ? "border-primary bg-primary/5 shadow-soft"
              : "border-border hover:border-primary/50 hover:bg-secondary/50"
          }`}
          onClick={() => onToggle(option.id)}
        >
          <Checkbox
            id={option.id}
            checked={selected.includes(option.id)}
            onCheckedChange={() => onToggle(option.id)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label
            htmlFor={option.id}
            className="flex-1 cursor-pointer font-medium text-foreground"
          >
            {option.label}
          </Label>
          {option.description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{option.description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ))}
    </div>
  );
};

export default CheckboxGrid;
