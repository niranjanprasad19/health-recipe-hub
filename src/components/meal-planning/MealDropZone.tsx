import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DraggableMealItem } from "./DraggableMealItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LucideIcon } from "lucide-react";

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

interface MealDropZoneProps {
  dayIndex: number;
  mealType: { id: string; label: string; icon: LucideIcon };
  meals: MealItem[];
  onAddMeal: (dayIndex: number, mealType: string) => void;
  onRemoveMeal: (id: string) => void;
}

export const MealDropZone = ({
  dayIndex,
  mealType,
  meals,
  onAddMeal,
  onRemoveMeal,
}: MealDropZoneProps) => {
  const droppableId = `${dayIndex}-${mealType.id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      dayIndex,
      mealType: mealType.id,
    },
  });

  const Icon = mealType.icon;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon className="w-3 h-3" />
          {mealType.label}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => onAddMeal(dayIndex, mealType.id)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[32px] rounded-md transition-colors ${
          isOver ? "bg-primary/10 ring-1 ring-primary/30" : ""
        }`}
      >
        <SortableContext
          items={meals.map((m) => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {meals.map((meal) => (
              <DraggableMealItem
                key={meal.id}
                meal={meal}
                onRemove={onRemoveMeal}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
