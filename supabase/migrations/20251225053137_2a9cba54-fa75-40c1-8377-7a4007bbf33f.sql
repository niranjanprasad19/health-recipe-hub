-- Add share_token to saved_recipes for public sharing
ALTER TABLE public.saved_recipes 
ADD COLUMN share_token TEXT UNIQUE;

-- Create index for fast lookup by share token
CREATE INDEX idx_saved_recipes_share_token ON public.saved_recipes(share_token);

-- Add RLS policy for public recipe viewing via share token
CREATE POLICY "Anyone can view shared recipes" 
ON public.saved_recipes FOR SELECT 
USING (share_token IS NOT NULL);

-- Create shopping_lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  meal_plan_id UUID REFERENCES public.meal_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  amount TEXT,
  checked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for shopping_lists
CREATE POLICY "Users can view their own shopping lists" 
ON public.shopping_lists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping lists" 
ON public.shopping_lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists" 
ON public.shopping_lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists" 
ON public.shopping_lists FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for shopping_list_items
CREATE POLICY "Users can view their shopping list items" 
ON public.shopping_list_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists 
  WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
  AND shopping_lists.user_id = auth.uid()
));

CREATE POLICY "Users can create shopping list items" 
ON public.shopping_list_items FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.shopping_lists 
  WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
  AND shopping_lists.user_id = auth.uid()
));

CREATE POLICY "Users can update their shopping list items" 
ON public.shopping_list_items FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists 
  WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
  AND shopping_lists.user_id = auth.uid()
));

CREATE POLICY "Users can delete their shopping list items" 
ON public.shopping_list_items FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists 
  WHERE shopping_lists.id = shopping_list_items.shopping_list_id 
  AND shopping_lists.user_id = auth.uid()
));