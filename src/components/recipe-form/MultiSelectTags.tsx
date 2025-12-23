import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiSelectTagsProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
}

const MultiSelectTags = ({ options, selected, onToggle, placeholder }: MultiSelectTagsProps) => {
  return (
    <div className="space-y-4">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg min-h-[60px]">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer px-3 py-1.5 text-sm"
              onClick={() => onToggle(item)}
            >
              {item}
              <X className="w-3 h-3 ml-1.5" />
            </Badge>
          ))}
        </div>
      )}
      
      {selected.length === 0 && placeholder && (
        <div className="p-4 bg-secondary/30 rounded-lg text-center text-muted-foreground text-sm">
          {placeholder}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {options
          .filter((option) => !selected.includes(option))
          .map((option) => (
            <Badge
              key={option}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors px-3 py-1.5 text-sm"
              onClick={() => onToggle(option)}
            >
              {option}
            </Badge>
          ))}
      </div>
    </div>
  );
};

export default MultiSelectTags;
