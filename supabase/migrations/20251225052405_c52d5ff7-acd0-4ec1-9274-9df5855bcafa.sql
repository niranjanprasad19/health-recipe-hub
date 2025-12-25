-- Create meal_plans table for weekly meal planning
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Meal Plan',
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_plan_items table for individual meals
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES public.saved_recipes(id) ON DELETE SET NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  custom_meal_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on meal_plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Enable RLS on meal_plan_items
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" 
ON public.meal_plans FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans" 
ON public.meal_plans FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans" 
ON public.meal_plans FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans" 
ON public.meal_plans FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for meal_plan_items (through meal_plan ownership)
CREATE POLICY "Users can view their meal plan items" 
ON public.meal_plan_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_items.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

CREATE POLICY "Users can create meal plan items" 
ON public.meal_plan_items FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_items.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

CREATE POLICY "Users can update their meal plan items" 
ON public.meal_plan_items FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_items.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

CREATE POLICY "Users can delete their meal plan items" 
ON public.meal_plan_items FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.meal_plans 
  WHERE meal_plans.id = meal_plan_items.meal_plan_id 
  AND meal_plans.user_id = auth.uid()
));

-- Trigger for updated_at on meal_plans
CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();