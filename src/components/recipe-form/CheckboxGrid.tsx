import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, Plus } from "lucide-react";

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
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const isCustomEntry =
    search.trim() !== "" &&
    !options.some((o) => o.label.toLowerCase() === search.trim().toLowerCase()) &&
    !selected.some((s) => s.toLowerCase() === search.trim().toLowerCase());

  const handleAddCustom = () => {
    if (isCustomEntry) {
      onToggle(search.trim());
      setSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isCustomEntry) {
        handleAddCustom();
      } else if (filteredOptions.length === 1) {
        onToggle(filteredOptions[0].id);
        setSearch("");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search or type to add custom..."
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

      <div className={`grid gap-3 ${columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {filteredOptions.map((option) => (
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
        {search && filteredOptions.length === 0 && !isCustomEntry && (
          <p className="text-sm text-muted-foreground col-span-full">No matches found</p>
        )}
      </div>

      {/* Show custom-added items that aren't in original options */}
      {selected.filter((s) => !options.some((o) => o.id === s)).length > 0 && (
        <div className={`grid gap-3 ${columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {selected
            .filter((s) => !options.some((o) => o.id === s))
            .map((customId) => (
              <div
                key={customId}
                className="flex items-center space-x-3 p-4 rounded-lg border border-primary bg-primary/5 shadow-soft transition-all duration-200 cursor-pointer"
                onClick={() => onToggle(customId)}
              >
                <Checkbox
                  checked={true}
                  onCheckedChange={() => onToggle(customId)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label className="flex-1 cursor-pointer font-medium text-foreground">
                  {customId}
                </Label>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CheckboxGrid;
