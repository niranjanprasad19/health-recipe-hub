-- Tighten recipe privacy: remove public visibility of shared recipes
DROP POLICY IF EXISTS "Anyone can view shared recipes" ON public.saved_recipes;