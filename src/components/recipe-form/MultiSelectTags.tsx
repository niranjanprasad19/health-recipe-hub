import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Search, Plus } from "lucide-react";

interface MultiSelectTagsProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
}

const MultiSelectTags = ({ options, selected, onToggle, placeholder }: MultiSelectTagsProps) => {
  const [search, setSearch] = useState("");

  const filteredOptions = options.filter(
    (option) =>
      !selected.includes(option) &&
      option.toLowerCase().includes(search.toLowerCase())
  );

  const isCustomEntry =
    search.trim() !== "" &&
    !options.some((o) => o.toLowerCase() === search.trim().toLowerCase()) &&
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
        onToggle(filteredOptions[0]);
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

      {selected.length === 0 && !search && placeholder && (
        <div className="p-4 bg-secondary/30 rounded-lg text-center text-muted-foreground text-sm">
          {placeholder}
        </div>
      )}

      {isCustomEntry && (
        <button
          onClick={handleAddCustom}
          className="flex items-center gap-2 w-full p-3 rounded-lg border border-dashed border-primary/50 bg-primary/5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add "{search.trim()}"
        </button>
      )}

      <div className="flex flex-wrap gap-2">
        {filteredOptions.map((option) => (
          <Badge
            key={option}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors px-3 py-1.5 text-sm"
            onClick={() => {
              onToggle(option);
              setSearch("");
            }}
          >
            {option}
          </Badge>
        ))}
        {search && filteredOptions.length === 0 && !isCustomEntry && (
          <p className="text-sm text-muted-foreground">No matches found</p>
        )}
      </div>
    </div>
  );
};

export default MultiSelectTags;
