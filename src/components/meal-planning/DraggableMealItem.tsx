import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";

interface MealItem {
  id: string;
  meal_plan_id: string;
  recipe_id: string | null;
  day_of_week: number;
  meal_type: string;
  custom_meal_name: string | null;
  notes: string | null;
  saved_recipes?: { id: string; title: string } | null;
}

interface DraggableMealItemProps {
  meal: MealItem;
  onRemove: (id: string) => void;
}

export const DraggableMealItem = ({ meal, onRemove }: DraggableMealItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: meal.id,
    data: {
      type: "meal",
      meal,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-secondary/50 rounded-md p-2 text-xs flex items-center gap-1 group cursor-grab active:cursor-grabbing ${
        isDragging ? "ring-2 ring-primary shadow-elevated z-50" : ""
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-3 h-3" />
      </button>
      <span className="truncate flex-1">
        {meal.saved_recipes?.title || meal.custom_meal_name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(meal.id)}
      >
        <Trash2 className="w-3 h-3 text-destructive" />
      </Button>
    </div>
  );
};
