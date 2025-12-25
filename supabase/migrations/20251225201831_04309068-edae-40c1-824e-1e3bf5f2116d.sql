-- Add is_favorite column to saved_recipes table
ALTER TABLE public.saved_recipes 
ADD COLUMN is_favorite boolean NOT NULL DEFAULT false;

-- Create index for faster favorite queries
CREATE INDEX idx_saved_recipes_favorite ON public.saved_recipes (user_id, is_favorite) WHERE is_favorite = true;